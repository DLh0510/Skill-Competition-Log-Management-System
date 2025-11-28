<template>
  <div>
    <el-card>
      <div class="filter-bar">
        <el-date-picker v-model="filterDate" type="date" placeholder="选择日期" @change="fetchLogs" clearable />
        <el-select v-model="filterStudent" placeholder="选择学生" @change="fetchLogs" clearable style="width: 200px">
          <el-option v-for="s in students" :key="s.id" :label="s.name" :value="s.id" />
        </el-select>
      </div>

      <el-table :data="logs" style="width: 100%; margin-top: 20px">
        <el-table-column prop="training_date" label="训练日期" width="120" />
        <el-table-column prop="student_name" label="学生" width="100" />
        <el-table-column prop="training_topic" label="训练课题" />
        <el-table-column prop="self_rating" label="自评" width="80">
          <template #default="{ row }">
            <el-tag :type="getRatingType(row.self_rating)">{{ row.self_rating }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacher_rating" label="教师评价" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.teacher_rating" :type="getRatingType(row.teacher_rating)">{{ row.teacher_rating }}</el-tag>
            <span v-else style="color: #999">未评价</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <el-button size="small" @click="handleView(row)">查看</el-button>
              <el-button size="small" type="primary" @click="handleEvaluate(row)">评价</el-button>
              <el-dropdown size="small">
                <el-button size="small" type="success">
                  导出<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleExport(row, 'pdf')">导出PDF</el-dropdown-item>
                    <el-dropdown-item @click="handleExport(row, 'word')">导出Word</el-dropdown-item>
                    <el-dropdown-item @click="handleExport(row, 'md')">导出Markdown</el-dropdown-item>
                    <el-dropdown-item @click="handleExport(row, 'image')">导出图片</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="viewVisible" title="训练日志详情" width="90%" :fullscreen="isMobile">
      <div class="log-detail" v-if="currentLog">
        <el-descriptions :column="isMobile ? 1 : 2" border>
          <el-descriptions-item label="训练日期">{{ currentLog.training_date }}</el-descriptions-item>
          <el-descriptions-item label="学生">{{ currentLog.student_name }}</el-descriptions-item>
          <el-descriptions-item label="当日教练">{{ currentLog.coach_name }}</el-descriptions-item>
          <el-descriptions-item label="训练课题">{{ currentLog.training_topic }}</el-descriptions-item>
          <el-descriptions-item label="训练内容" :span="2">
            <div class="content-text">{{ currentLog.training_content }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="存在问题" :span="2">
            <div class="content-text">{{ currentLog.problems }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="解决办法" :span="2">
            <div class="content-text">{{ currentLog.solutions }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="训练小结" :span="2">
            <div class="content-text">{{ currentLog.summary }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="自我评价">
            <el-tag :type="getRatingType(currentLog.self_rating)">{{ currentLog.self_rating }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="教师评价" v-if="currentLog.teacher_rating">
            <el-tag :type="getRatingType(currentLog.teacher_rating)">{{ currentLog.teacher_rating }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="教师评语" :span="2" v-if="currentLog.teacher_comment">
            <div class="content-text">{{ currentLog.teacher_comment }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <el-dialog v-model="evaluateVisible" title="教师评价" width="500px">
      <el-form :model="evaluateForm" label-width="100px">
        <el-form-item label="教练评价">
          <el-select v-model="evaluateForm.teacher_rating" style="width: 100%">
            <el-option label="优" value="优" />
            <el-option label="良" value="良" />
            <el-option label="一般" value="一般" />
            <el-option label="差" value="差" />
          </el-select>
        </el-form-item>
        <el-form-item label="教练评语">
          <el-input v-model="evaluateForm.teacher_comment" type="textarea" :rows="5" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="evaluateVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitEvaluate">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import request from '../../utils/request'
import { exportToPDF, exportToWord, exportToMarkdown, exportToImage } from '../../utils/exportLog'

const logs = ref([])
const students = ref([])
const filterDate = ref('')
const filterStudent = ref('')
const viewVisible = ref(false)
const evaluateVisible = ref(false)
const currentLog = ref(null)
const evaluateForm = ref({ teacher_rating: '', teacher_comment: '' })

const isMobile = computed(() => window.innerWidth < 768)

const fetchLogs = async () => {
  const params = {}
  if (filterDate.value) {
    const date = new Date(filterDate.value)
    params.date = date.toISOString().split('T')[0]
  }
  if (filterStudent.value) params.studentId = filterStudent.value
  
  logs.value = await request.get('/logs', { params })
}

const fetchStudents = async () => {
  students.value = await request.get('/students')
}

const getRatingType = (rating) => {
  const map = { '优': 'success', '良': 'primary', '一般': 'warning', '差': 'danger' }
  return map[rating] || 'info'
}

const handleView = (row) => {
  currentLog.value = row
  viewVisible.value = true
}

const handleEvaluate = (row) => {
  currentLog.value = row
  evaluateForm.value = {
    teacher_rating: row.teacher_rating || '',
    teacher_comment: row.teacher_comment || ''
  }
  evaluateVisible.value = true
}

const handleExport = async (row, format) => {
  try {
    ElMessage.info('正在生成文件，请稍候...')
    
    switch (format) {
      case 'pdf':
        await exportToPDF(row)
        break
      case 'word':
        await exportToWord(row)
        break
      case 'md':
        exportToMarkdown(row)
        break
      case 'image':
        await exportToImage(row)
        break
    }
    
    ElMessage.success('导出成功！')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

const handleSubmitEvaluate = async () => {
  await request.put(`/logs/${currentLog.value.id}/evaluate`, evaluateForm.value)
  ElMessage.success('评价成功')
  evaluateVisible.value = false
  fetchLogs()
}

onMounted(() => {
  fetchLogs()
  fetchStudents()
})
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
  }
  
  .el-select {
    width: 100% !important;
  }
}
</style>
