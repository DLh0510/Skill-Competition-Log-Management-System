<template>
  <div>
    <el-card>
      <h3>学生列表</h3>
      <el-table :data="students" style="width: 100%; margin-top: 20px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="project_name" label="项目" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../../utils/request'

const students = ref([])

const fetchStudents = async () => {
  students.value = await request.get('/students')
}

onMounted(fetchStudents)
</script>
