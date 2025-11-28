<template>
  <div>
    <el-card>
      <h3>{{ form.id ? '编辑训练日志' : '提交训练日志' }}</h3>
      <el-form :model="form" label-width="100px" style="margin-top: 20px; max-width: 800px">
        <el-form-item label="训练日期">
          <el-date-picker v-model="form.training_date" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="当日教练">
          <el-input v-model="form.coach_name" />
        </el-form-item>
        <el-form-item label="训练课题">
          <el-input v-model="form.training_topic" />
        </el-form-item>
        <el-form-item label="训练内容">
          <el-input v-model="form.training_content" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item label="存在问题">
          <el-input v-model="form.problems" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="解决办法">
          <el-input v-model="form.solutions" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="训练小结">
          <el-input v-model="form.summary" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="自我评价">
          <el-select v-model="form.self_rating" style="width: 100%">
            <el-option label="优" value="优" />
            <el-option label="良" value="良" />
            <el-option label="一般" value="一般" />
            <el-option label="差" value="差" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../../utils/request'

const router = useRouter()

const form = ref({
  training_date: new Date(),
  coach_name: '',
  training_topic: '',
  training_content: '',
  problems: '',
  solutions: '',
  summary: '',
  self_rating: '良'
})

const handleSubmit = async () => {
  const data = { ...form.value }
  data.training_date = new Date(data.training_date).toISOString().split('T')[0]
  
  if (form.value.id) {
    await request.put(`/logs/${form.value.id}`, data)
    ElMessage.success('更新成功')
  } else {
    await request.post('/logs', data)
    ElMessage.success('提交成功')
  }
  
  router.push('/student/logs')
}

const handleReset = () => {
  form.value = {
    training_date: new Date(),
    coach_name: '',
    training_topic: '',
    training_content: '',
    problems: '',
    solutions: '',
    summary: '',
    self_rating: '良'
  }
}
</script>
