const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// 获取所有项目
router.get('/', auth(['admin', 'teacher']), async (req, res) => {
  try {
    const [projects] = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 创建项目
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO projects (name, description) VALUES (?, ?)',
      [name, description]
    );
    res.json({ id: result.insertId, name, description });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新项目
router.put('/:id', auth(['admin']), async (req, res) => {
  try {
    const { name, description } = req.body;
    await pool.query(
      'UPDATE projects SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );
    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 删除项目
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 批量导入项目
router.post('/batch', auth(['admin']), async (req, res) => {
  try {
    const { projects } = req.body;
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({ message: '没有有效的导入数据' });
    }

    let successCount = 0;
    let failedItems = [];

    for (const project of projects) {
      try {
        await pool.query(
          'INSERT INTO projects (name, description) VALUES (?, ?)',
          [project.name, project.description || '']
        );
        successCount++;
      } catch (err) {
        failedItems.push({ name: project.name, reason: err.code === 'ER_DUP_ENTRY' ? '项目名称已存在' : err.message });
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
