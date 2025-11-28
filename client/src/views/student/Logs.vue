<template>
  <div>
    <el-card>
      <div class="header-actions">
        <h3>我的训练日志</h3>
        <el-button type="primary" @click="$router.push('/student/submit')">提交日志</el-button>
      </div>

      <el-table :data="logs" style="width: 100%; margin-top: 20px">
        <el-table-column prop="training_date" label="训练日期" width="120" />
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
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="viewVisible" title="训练日志详情" width="90%" :fullscreen="isMobile">
      <div class="log-detail" v-if="currentLog">
        <el-descriptions :column="isMobile ? 1 : 2" border>
          <el-descriptions-item label="训练日期">{{ currentLog.training_date }}</el-descriptions-item>
          <el-descriptions-item label="当日教练">{{ currentLog.coach_name }}</el-descriptions-item>
          <el-descriptions-item label="训练课题" :span="2">{{ currentLog.training_topic }}</el-descriptions-item>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../../utils/request'

const logs = ref([])
const viewVisible = ref(false)
const currentLog = ref(null)

const isMobile = computed(() => window.innerWidth < 768)

const fetchLogs = async () => {
  logs.value = await request.get('/logs')
}

const getRatingType = (rating) => {
  const map = { '优': 'success', '良': 'primary', '一般': 'warning', '差': 'danger' }
  return map[rating] || 'info'
}

const handleView = (row) => {
  currentLog.value = row
  viewVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除该日志吗？', '提示', { type: 'warning' })
  await request.delete(`/logs/${row.id}`)
  ElMessage.success('删除成功')
  fetchLogs()
}

onMounted(fetchLogs)
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
