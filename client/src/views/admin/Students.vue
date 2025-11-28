<template>
  <div>
    <el-card>
      <div class="header-actions">
        <h3>学生管理</h3>
        <el-button type="primary" @click="handleAdd">添加学生</el-button>
      </div>
      <el-table :data="students" style="width: 100%; margin-top: 20px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="project_name" label="项目" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑学生' : '添加学生'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" :placeholder="form.id ? '不修改请留空' : ''" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="项目">
          <el-select v-model="form.project_id" style="width: 100%">
            <el-option v-for="p in projects" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../../utils/request'

const students = ref([])
const projects = ref([])
const dialogVisible = ref(false)
const form = ref({ username: '', password: '', name: '', project_id: null })

const fetchData = async () => {
  students.value = await request.get('/students')
  projects.value = await request.get('/projects')
}

const handleAdd = () => {
  form.value = { username: '', password: '', name: '', project_id: null }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  form.value = { ...row, password: '' }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (form.value.id) {
    await request.put(`/students/${form.value.id}`, form.value)
    ElMessage.success('更新成功')
  } else {
    await request.post('/students', form.value)
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
  fetchData()
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除该学生吗？', '提示', { type: 'warning' })
  await request.delete(`/students/${row.id}`)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
