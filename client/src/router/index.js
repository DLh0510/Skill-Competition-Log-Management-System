import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/admin',
    component: () => import('../views/admin/Layout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: '/admin/projects' },
      { path: 'projects', component: () => import('../views/admin/Projects.vue') },
      { path: 'teachers', component: () => import('../views/admin/Teachers.vue') },
      { path: 'students', component: () => import('../views/admin/Students.vue') },
      { path: 'logs', component: () => import('../views/admin/Logs.vue') }
    ]
  },
  {
    path: '/teacher',
    component: () => import('../views/teacher/Layout.vue'),
    meta: { requiresAuth: true, role: 'teacher' },
    children: [
      { path: '', redirect: '/teacher/logs' },
      { path: 'logs', component: () => import('../views/teacher/Logs.vue') },
      { path: 'students', component: () => import('../views/teacher/Students.vue') }
    ]
  },
  {
    path: '/student',
    component: () => import('../views/student/Layout.vue'),
    meta: { requiresAuth: true, role: 'student' },
    children: [
      { path: '', redirect: '/student/logs' },
      { path: 'logs', component: () => import('../views/student/Logs.vue') },
      { path: 'submit', component: () => import('../views/student/Submit.vue') }
    ]
  },
  { path: '/', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.role && to.meta.role !== role) {
    next(`/${role}`)
  } else {
    next()
  }
})

export default router
