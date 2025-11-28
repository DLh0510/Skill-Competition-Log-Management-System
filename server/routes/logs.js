const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// 获取训练日志列表
router.get('/', auth(['admin', 'teacher', 'student']), async (req, res) => {
  try {
    const { date, studentId } = req.query;
    let query = `
      SELECT l.*, s.name as student_name, p.name as project_name
      FROM training_logs l
      JOIN students s ON l.student_id = s.id
      JOIN projects p ON l.project_id = p.id
    `;
    const params = [];
    const conditions = [];

    if (req.user.role === 'student') {
      conditions.push('l.student_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'teacher') {
      conditions.push('l.project_id = ?');
      params.push(req.user.projectId);
    }

    if (date) {
      conditions.push('l.training_date = ?');
      params.push(date);
    }

    if (studentId) {
      conditions.push('l.student_id = ?');
      params.push(studentId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY l.training_date DESC, l.created_at DESC';

    const [logs] = await pool.query(query, params);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 创建训练日志
router.post('/', auth(['student']), async (req, res) => {
  try {
    const {
      training_date, coach_name, training_topic, training_content,
      problems, solutions, summary, self_rating
    } = req.body;

    const [student] = await pool.query('SELECT project_id FROM students WHERE id = ?', [req.user.id]);
    
    const [result] = await pool.query(
      `INSERT INTO training_logs 
      (student_id, project_id, training_date, coach_name, training_topic, 
       training_content, problems, solutions, summary, self_rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, student[0].project_id, training_date, coach_name, training_topic,
       training_content, problems, solutions, summary, self_rating]
    );

    res.json({ id: result.insertId, message: '提交成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新训练日志（学生编辑）
router.put('/:id', auth(['student']), async (req, res) => {
  try {
    const {
      training_date, coach_name, training_topic, training_content,
      problems, solutions, summary, self_rating
    } = req.body;

    await pool.query(
      `UPDATE training_logs SET 
       training_date = ?, coach_name = ?, training_topic = ?, 
       training_content = ?, problems = ?, solutions = ?, 
       summary = ?, self_rating = ?
       WHERE id = ? AND student_id = ?`,
      [training_date, coach_name, training_topic, training_content,
       problems, solutions, summary, self_rating, req.params.id, req.user.id]
    );

    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 教师评价
router.put('/:id/evaluate', auth(['teacher']), async (req, res) => {
  try {
    const { teacher_comment, teacher_rating } = req.body;

    await pool.query(
      'UPDATE training_logs SET teacher_comment = ?, teacher_rating = ? WHERE id = ?',
      [teacher_comment, teacher_rating, req.params.id]
    );

    res.json({ message: '评价成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 删除训练日志
router.delete('/:id', auth(['student', 'admin']), async (req, res) => {
  try {
    if (req.user.role === 'student') {
      await pool.query('DELETE FROM training_logs WHERE id = ? AND student_id = ?', 
        [req.params.id, req.user.id]);
    } else {
      await pool.query('DELETE FROM training_logs WHERE id = ?', [req.params.id]);
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;
