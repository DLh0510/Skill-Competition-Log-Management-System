<template>
  <div>
    <el-card>
      <div class="header-actions">
        <h3>项目管理</h3>
        <el-button type="primary" @click="handleAdd">添加项目</el-button>
      </div>
      <el-table :data="projects" style="width: 100%; margin-top: 20px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑项目' : '添加项目'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="项目名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
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

const projects = ref([])
const dialogVisible = ref(false)
const form = ref({ name: '', description: '' })

const fetchProjects = async () => {
  projects.value = await request.get('/projects')
}

const handleAdd = () => {
  form.value = { name: '', description: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (form.value.id) {
    await request.put(`/projects/${form.value.id}`, form.value)
    ElMessage.success('更新成功')
  } else {
    await request.post('/projects', form.value)
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
  fetchProjects()
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除该项目吗？', '提示', { type: 'warning' })
  await request.delete(`/projects/${row.id}`)
  ElMessage.success('删除成功')
  fetchProjects()
}

onMounted(fetchProjects)
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
