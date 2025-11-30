import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// 下载模板
export const downloadTemplate = (type) => {
  let headers = []
  let sampleData = []
  let fileName = ''

  switch (type) {
    case 'students':
      headers = ['用户名', '密码', '姓名', '手机号', '项目名称']
      sampleData = [['student001', '123456', '张三', '13800138000', 'Web前端开发']]
      fileName = '学生导入模板.xlsx'
      break
    case 'teachers':
      headers = ['用户名', '密码', '姓名', '手机号', '项目名称']
      sampleData = [['teacher001', '123456', '李老师', '13900139000', 'Web前端开发']]
      fileName = '教师导入模板.xlsx'
      break
    case 'projects':
      headers = ['项目名称', '描述']
      sampleData = [['Web前端开发', '包含HTML、CSS、JavaScript等技术']]
      fileName = '项目导入模板.xlsx'
      break
  }

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  
  // 设置列宽
  ws['!cols'] = headers.map(() => ({ wch: 20 }))
  
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName)
}

// 解析Excel文件
export const parseExcel = (file, type) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        // 移除表头
        const rows = jsonData.slice(1).filter(row => row.length > 0)
        
        let result = []
        switch (type) {
          case 'students':
            result = rows.map(row => ({
              username: String(row[0] || '').trim(),
              password: String(row[1] || '').trim(),
              name: String(row[2] || '').trim(),
              phone: String(row[3] || '').trim(),
              project_name: String(row[4] || '').trim()
            })).filter(item => item.username && item.name)
            break
          case 'teachers':
            result = rows.map(row => ({
              username: String(row[0] || '').trim(),
              password: String(row[1] || '').trim(),
              name: String(row[2] || '').trim(),
              phone: String(row[3] || '').trim(),
              project_name: String(row[4] || '').trim()
            })).filter(item => item.username && item.name)
            break
          case 'projects':
            result = rows.map(row => ({
              name: String(row[0] || '').trim(),
              description: String(row[1] || '').trim()
            })).filter(item => item.name)
            break
        }
        
        resolve(result)
      } catch (error) {
        reject(new Error('Excel文件解析失败'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}
