const pool = require('./db');

async function initDatabase() {
  try {
    // 管理员表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 为已存在的表添加 phone 字段（如果不存在）
    try {
      await pool.query('ALTER TABLE admins ADD COLUMN phone VARCHAR(20)');
    } catch (e) { /* 字段可能已存在 */ }

    // 项目表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 教师表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(50) NOT NULL,
        phone VARCHAR(20),
        project_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
      )
    `);
    
    // 为已存在的表添加 phone 字段（如果不存在）
    try {
      await pool.query('ALTER TABLE teachers ADD COLUMN phone VARCHAR(20)');
    } catch (e) { /* 字段可能已存在 */ }

    // 学生表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(50) NOT NULL,
        phone VARCHAR(20),
        project_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
      )
    `);
    
    // 为已存在的表添加 phone 字段（如果不存在）
    try {
      await pool.query('ALTER TABLE students ADD COLUMN phone VARCHAR(20)');
    } catch (e) { /* 字段可能已存在 */ }

    // 训练日志表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS training_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        project_id INT NOT NULL,
        training_date DATE NOT NULL,
        coach_name VARCHAR(50),
        training_topic VARCHAR(200),
        training_content TEXT,
        problems TEXT,
        solutions TEXT,
        summary TEXT,
        self_rating ENUM('优', '良', '一般', '差'),
        teacher_comment TEXT,
        teacher_rating ENUM('优', '良', '一般', '差'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // 创建默认管理员账号 admin/admin123
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT IGNORE INTO admins (username, password) VALUES (?, ?)',
      ['admin', hashedPassword]
    );

    console.log('数据库初始化成功！');
    console.log('默认管理员账号: admin / admin123');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}

initDatabase();

module.exports = initDatabase;
