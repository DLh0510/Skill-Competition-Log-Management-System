const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    let table = role === 'admin' ? 'admins' : role === 'teacher' ? 'teachers' : 'students';
    const [users] = await pool.query(`SELECT * FROM ${table} WHERE username = ?`, [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role, projectId: user.project_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, role, user: { id: user.id, username: user.username, name: user.name, projectId: user.project_id } });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;
