<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">{{ isCollapse ? '学生' : '学生端' }}</div>
      <el-menu :default-active="$route.path" router :collapse="isCollapse">
        <el-menu-item index="/student/logs">
          <el-icon><Document /></el-icon>
          <span>我的日志</span>
        </el-menu-item>
        <el-menu-item index="/student/submit">
          <el-icon><Edit /></el-icon>
          <span>提交日志</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <el-icon class="collapse-icon" @click="isCollapse = !isCollapse">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
        <div class="header-right">
          <span>学生：{{ userStore.user.name }}</span>
          <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

const handleLogout = () => {
  userStore.clearAuth()
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background: #2c3e50;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background: #1a252f;
}

.el-menu {
  border: none;
  background: #2c3e50;
}

:deep(.el-menu-item) {
  color: #bfcbd9;
}

:deep(.el-menu-item:hover) {
  background-color: #263445 !important;
  color: #fff;
}

:deep(.el-menu-item.is-active) {
  background-color: #e6a23c !important;
  color: #fff;
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.el-main {
  background: #f5f7fa;
  padding: 20px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 64px !important;
  }
  
  .el-main {
    padding: 10px;
  }
}
</style>
