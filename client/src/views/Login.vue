<template>
  <div class="login-page">
    <!-- 动态背景 -->
    <div class="background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <div class="container">
      <!-- 左侧：系统亮点展示 -->
      <div class="left-section">
        <div class="logo-section">
          <div class="logo-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" stroke="url(#gradient)" stroke-width="3"/>
              <path d="M30 50L45 65L70 35" stroke="url(#gradient)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea"/>
                  <stop offset="100%" style="stop-color:#764ba2"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 class="system-title">竞赛训练日志管理系统</h1>
          <p class="system-subtitle">Competition Training Log System</p>
        </div>

        <div class="features">
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>智能数据分析</h3>
            <p>实时追踪训练进度，可视化展示成长曲线</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>目标管理</h3>
            <p>设定训练目标，系统智能提醒与规划</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏆</div>
            <h3>成就系统</h3>
            <p>记录每一次突破，见证成长每一步</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🤝</div>
            <h3>团队协作</h3>
            <p>与队友共享训练心得，共同进步</p>
          </div>
        </div>
      </div>

      <!-- 右侧：登录表单 -->
      <div class="right-section">
        <div class="login-card">
          <div class="login-header">
            <h2>欢迎回来</h2>
            <p>登录您的账户继续训练之旅</p>
          </div>

          <form class="login-form" @submit.prevent="handleLogin">
            <div class="form-group">
              <label>用户名</label>
              <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <input v-model="form.username" type="text" placeholder="请输入用户名" required>
              </div>
            </div>

            <div class="form-group">
              <label>密码</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码" required>
                <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>角色</label>
              <div class="role-selector">
                <div 
                  v-for="role in roles" 
                  :key="role.value"
                  class="role-option"
                  :class="{ active: form.role === role.value }"
                  @click="form.role = role.value"
                >
                  <span class="role-icon">{{ role.icon }}</span>
                  <span class="role-label">{{ role.label }}</span>
                </div>
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox-wrapper">
                <input v-model="remember" type="checkbox">
                <span class="checkmark"></span>
                <span>记住我</span>
              </label>
            </div>

            <button type="submit" class="login-button" :disabled="loading">
              <span>{{ loading ? '登录中...' : '登录' }}</span>
              <svg v-if="!loading" class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import request from '../utils/request'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const showPassword = ref(false)
const remember = ref(false)

const form = ref({
  username: '',
  password: '',
  role: 'student'
})

const roles = [
  { value: 'admin', label: '管理员', icon: '👨‍💼' },
  { value: 'teacher', label: '教师', icon: '👨‍🏫' },
  { value: 'student', label: '学生', icon: '👨‍🎓' }
]

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请填写完整信息')
    return
  }

  loading.value = true
  try {
    const data = await request.post('/auth/login', form.value)
    userStore.setAuth(data)
    ElMessage.success('登录成功！')
    setTimeout(() => {
      router.push(`/${data.role}`)
    }, 500)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.login-page {
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

/* 动态背景 */
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  background: #f8f9ff;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  top: -10%;
  left: -10%;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  bottom: -10%;
  right: -5%;
  animation-delay: 7s;
}

.orb-3 {
  width: 450px;
  height: 450px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(50px, -50px) scale(1.1); }
  66% { transform: translate(-30px, 30px) scale(0.9); }
}

/* 主容器 */
.container {
  display: flex;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
  gap: 60px;
}

/* 左侧区域 */
.left-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 50px;
  animation: slideInLeft 0.8s ease-out;
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

.logo-section {
  text-align: center;
}

.logo-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.logo-icon svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3));
}

.system-title {
  font-size: 48px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
}

.system-subtitle {
  font-size: 16px;
  color: #718096;
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* 功能卡片 */
.features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 30px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.16);
  background: rgba(255, 255, 255, 0.9);
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 15px;
  display: inline-block;
}

.feature-card h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #2d3748;
}

.feature-card p {
  font-size: 14px;
  color: #718096;
  line-height: 1.6;
}

/* 右侧登录区域 */
.right-section {
  flex: 0 0 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: slideInRight 0.8s ease-out;
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

.login-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  padding: 50px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.16);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 14px;
  color: #718096;
}

/* 表单样式 */
.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 10px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 18px;
  font-size: 20px;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 16px 20px 16px 55px;
  font-size: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 15px;
  background: #fff;
  transition: all 0.3s ease;
  outline: none;
}

.input-wrapper input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.toggle-password {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.toggle-password:hover {
  opacity: 1;
}

/* 角色选择器 */
.role-selector {
  display: flex;
  gap: 10px;
}

.role-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 15px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-option:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.role-option.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.role-icon {
  font-size: 28px;
}

.role-label {
  font-size: 14px;
  font-weight: 600;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #718096;
}

.checkbox-wrapper input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 14px;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.arrow-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.login-button:hover .arrow-icon {
  transform: translateX(5px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .container {
    flex-direction: column;
    gap: 40px;
  }
  
  .right-section {
    flex: 1;
  }
  
  .features {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 20px;
  }
  
  .login-card {
    padding: 30px;
  }
  
  .system-title {
    font-size: 36px;
  }
  
  .role-selector {
    flex-direction: column;
  }
}
</style>
