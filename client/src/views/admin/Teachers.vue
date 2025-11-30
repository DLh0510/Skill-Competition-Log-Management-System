<template>
  <div>
    <el-card>
      <div class="header-actions">
        <h3>教师管理</h3>
        <div class="action-buttons">
          <el-button type="primary" @click="handleAdd">添加教师</el-button>
          <el-button type="success" @click="handleImport">批量导入</el-button>
          <el-button @click="handleDownloadTemplate">下载模板</el-button>
        </div>
      </div>
      <el-table :data="teachers" style="width: 100%; margin-top: 20px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" width="130" />
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
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="用于微信小程序登录" />
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

    <el-dialog v-model="importVisible" title="批量导入教师" width="500px">
      <el-upload
        ref="uploadRef"
        drag
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        :on-change="handleFileChange"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">只能上传 xlsx/xls 文件</div>
        </template>
      </el-upload>
      <div v-if="importPreview.length > 0" style="margin-top: 15px;">
        <p>预览（共 {{ importPreview.length }} 条数据）：</p>
        <el-table :data="importPreview.slice(0, 5)" size="small" max-height="200">
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column prop="project_name" label="项目" />
        </el-table>
        <p v-if="importPreview.length > 5" style="color: #999; font-size: 12px;">... 还有 {{ importPreview.length - 5 }} 条数据</p>
      </div>
      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitImport" :disabled="importPreview.length === 0">确认导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import request from '../../utils/request'
import { downloadTemplate, parseExcel } from '../../utils/excelImport'

const teachers = ref([])
const projects = ref([])
const dialogVisible = ref(false)
const importVisible = ref(false)
const importPreview = ref([])
const uploadRef = ref(null)
const form = ref({ username: '', password: '', name: '', phone: '', project_id: null })

const fetchData = async () => {
  teachers.value = await request.get('/teachers')
  projects.value = await request.get('/projects')
}

const handleAdd = () => {
  form.value = { username: '', password: '', name: '', phone: '', project_id: null }
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

const handleImport = () => {
  importPreview.value = []
  importVisible.value = true
}

const handleDownloadTemplate = () => {
  downloadTemplate('teachers')
  ElMessage.success('模板下载成功')
}

const handleFileChange = async (file) => {
  try {
    const data = await parseExcel(file.raw, 'teachers')
    importPreview.value = data
  } catch (error) {
    ElMessage.error(error.message)
  }
}

const handleSubmitImport = async () => {
  try {
    const res = await request.post('/teachers/batch', { teachers: importPreview.value })
    ElMessage.success(res.message)
    if (res.failedItems && res.failedItems.length > 0) {
      console.log('导入失败的项目:', res.failedItems)
    }
    importVisible.value = false
    importPreview.value = []
    fetchData()
  } catch (error) {
    ElMessage.error('导入失败')
  }
}

onMounted(fetchData)
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
