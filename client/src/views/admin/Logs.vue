<!-- 在文件末尾添加移动端样式 -->
<style scoped>
.filter-bar {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
  }

  :deep(.el-select) {
    width: 100% !important;
  }

  :deep(.el-date-picker) {
    width: 100% !important;
  }

  :deep(.el-table) {
    font-size: 12px;
  }

  :deep(.el-table .el-button) {
    padding: 5px 8px;
    font-size: 12px;
  }

  :deep(.el-dropdown) {
    display: block;
  }

  :deep(.el-table__body-wrapper) {
    overflow-x: auto;
  }

  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5px auto !important;
  }
}
</style>
