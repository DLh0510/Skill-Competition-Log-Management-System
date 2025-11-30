// 手动执行此脚本来添加 phone 字段
// 运行: node server/migrate-phone.js

require('dotenv').config();
const pool = require('./config/db');

async function migrate() {
  console.log('开始添加 phone 字段...');
  
  const tables = ['admins', 'teachers', 'students'];
  
  for (const table of tables) {
    try {
      // 检查字段是否存在
      const [columns] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE 'phone'`);
      if (columns.length === 0) {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN phone VARCHAR(20)`);
        console.log(`✓ ${table} 表添加 phone 字段成功`);
      } else {
        console.log(`- ${table} 表已有 phone 字段，跳过`);
      }
    } catch (error) {
      console.error(`✗ ${table} 表操作失败:`, error.message);
    }
  }
  
  console.log('迁移完成！');
  process.exit(0);
}

migrate();
