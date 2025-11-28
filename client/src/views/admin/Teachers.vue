<template>
  <div>
    <el-card>
      <div class="header-actions">
        <h3>教师管理</h3>
        <el-button type="primary" @click="handleAdd">添加教师</el-button>
      </div>
      <el-table :data="teachers" style="width: 100%; margin-top: 20px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="project_name" label="关联项目" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑教师' : '添加教师'" width="500px">
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
        <el-form-item label="关联项目">
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

const teachers = ref([])
const projects = ref([])
const dialogVisible = ref(false)
const form = ref({ username: '', password: '', name: '', project_id: null })

const fetchData = async () => {
  teachers.value = await request.get('/teachers')
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
    await request.put(`/teachers/${form.value.id}`, form.value)
    ElMessage.success('更新成功')
  } else {
    await request.post('/teachers', form.value)
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
  fetchData()
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除该教师吗？', '提示', { type: 'warning' })
  await request.delete(`/teachers/${row.id}`)
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
