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

// 批量导入学生
router.post('/batch', auth(['admin']), async (req, res) => {
  try {
    const { students } = req.body;
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: '没有有效的导入数据' });
    }

    // 获取所有项目用于匹配
    const [projects] = await pool.query('SELECT id, name FROM projects');
    const projectMap = {};
    projects.forEach(p => { projectMap[p.name] = p.id; });

    let successCount = 0;
    let failedItems = [];

    for (const student of students) {
      try {
        const projectId = projectMap[student.project_name] || null;
        const hashedPassword = await bcrypt.hash(student.password || '123456', 10);
        await pool.query(
          'INSERT INTO students (username, password, name, project_id) VALUES (?, ?, ?, ?)',
          [student.username, hashedPassword, student.name, projectId]
        );
        successCount++;
      } catch (err) {
        failedItems.push({ username: student.username, reason: err.code === 'ER_DUP_ENTRY' ? '用户名已存在' : err.message });
      }
    }

    res.json({ 
      message: `成功导入 ${successCount} 条，失败 ${failedItems.length} 条`,
      successCount,
      failedCount: failedItems.length,
      failedItems
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;
