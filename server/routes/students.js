const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const auth = require('../middleware/auth');

// 获取学生列表
router.get('/', auth(['admin', 'teacher']), async (req, res) => {
  try {
    let query = `
      SELECT s.*, p.name as project_name 
      FROM students s 
      LEFT JOIN projects p ON s.project_id = p.id
    `;
    
    if (req.user.role === 'teacher') {
      query += ' WHERE s.project_id = ?';
      const [students] = await pool.query(query + ' ORDER BY s.created_at DESC', [req.user.projectId]);
      return res.json(students);
    }
    
    const [students] = await pool.query(query + ' ORDER BY s.created_at DESC');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 创建学生
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { username, password, name, project_id } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO students (username, password, name, project_id) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, name, project_id]
    );
    res.json({ id: result.insertId, username, name, project_id });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新学生
router.put('/:id', auth(['admin']), async (req, res) => {
  try {
    const { name, project_id, password } = req.body;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE students SET name = ?, project_id = ?, password = ? WHERE id = ?',
        [name, project_id, hashedPassword, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE students SET name = ?, project_id = ? WHERE id = ?',
        [name, project_id, req.params.id]
      );
    }
    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 删除学生
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;
