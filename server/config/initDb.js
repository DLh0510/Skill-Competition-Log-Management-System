const pool = require('./db');

async function initDatabase() {
  try {
    // 管理员表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

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
        project_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
      )
    `);

    // 学生表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(50) NOT NULL,
        project_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
      )
    `);

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
