import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const role = ref(localStorage.getItem('role') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

  const setAuth = (authData) => {
    token.value = authData.token
    role.value = authData.role
    user.value = authData.user
    localStorage.setItem('token', authData.token)
    localStorage.setItem('role', authData.role)
    localStorage.setItem('user', JSON.stringify(authData.user))
  }

  const clearAuth = () => {
    token.value = ''
    role.value = ''
    user.value = {}
    localStorage.clear()
  }

  return { token, role, user, setAuth, clearAuth }
})
