const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const auth = require('../middleware/auth');

// 获取所有教师
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const [teachers] = await pool.query(`
      SELECT t.*, p.name as project_name 
      FROM teachers t 
      LEFT JOIN projects p ON t.project_id = p.id 
      ORDER BY t.created_at DESC
    `);
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 创建教师
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { username, password, name, project_id } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO teachers (username, password, name, project_id) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, name, project_id]
    );
    res.json({ id: result.insertId, username, name, project_id });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新教师
router.put('/:id', auth(['admin']), async (req, res) => {
  try {
    const { name, project_id, password } = req.body;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE teachers SET name = ?, project_id = ?, password = ? WHERE id = ?',
        [name, project_id, hashedPassword, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE teachers SET name = ?, project_id = ? WHERE id = ?',
        [name, project_id, req.params.id]
      );
    }
    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 删除教师
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    await pool.query('DELETE FROM teachers WHERE id = ?', [req.params.id]);
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;
