<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <img src="@/assets/images/logo.png" alt="Logo" class="logo-img" />
        <span v-if="!isCollapse" class="logo-text">教师端</span>
      </div>
      <el-menu :default-active="$route.path" router :collapse="isCollapse">
        <el-menu-item index="/teacher/logs">
          <el-icon><Document /></el-icon>
          <span>训练日志</span>
        </el-menu-item>
        <el-menu-item index="/teacher/students">
          <el-icon><UserFilled /></el-icon>
          <span>学生列表</span>
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
          <span>教师：{{ userStore.user.name }}</span>
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 15px;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background: #1a252f;
}

.logo-img {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: contain;
}

.logo-text {
  white-space: nowrap;
  overflow: hidden;
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
  background-color: #67c23a !important;
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
  .layout-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100% !important;
    height: auto;
  }

  .logo {
    height: 50px;
    padding: 0 10px;
  }

  .logo-img {
    width: 30px;
    height: 30px;
  }

  .el-menu {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
  }

  :deep(.el-menu-item) {
    flex-shrink: 0;
  }
  
  .el-main {
    padding: 10px;
  }

  .header {
    padding: 0 10px;
  }

  .header-right {
    gap: 8px;
    font-size: 12px;
  }

  .header-right span {
    display: none;
  }
}
</style>
