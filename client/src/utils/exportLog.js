import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx'
import { saveAs } from 'file-saver'

// 导出为图片
export const exportToImage = async (log) => {
  const content = createLogHTML(log)
  const container = document.createElement('div')
  container.innerHTML = content
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 800px;
    padding: 40px;
    background: white;
    font-family: 'Microsoft YaHei', Arial, sans-serif;
  `
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false
    })
    
    canvas.toBlob((blob) => {
      saveAs(blob, `训练日志-${log.student_name}-${log.training_date}.png`)
    })
  } finally {
    document.body.removeChild(container)
  }
}

// 导出为PDF（支持多页，带页边距和页间距）
export const exportToPDF = async (log) => {
  const content = createLogHTML(log)
  const container = document.createElement('div')
  container.innerHTML = content
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 750px;
    padding: 40px;
    background: white;
    font-family: 'Microsoft YaHei', Arial, sans-serif;
  `
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      windowHeight: container.scrollHeight
    })
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const pageWidth = 210 // A4宽度（mm）
    const pageHeight = 297 // A4高度（mm）
    const topMargin = 25 // 顶部页边距（mm）
    const bottomMargin = 25 // 底部页边距（mm）
    const sideMargin = 15 // 左右页边距（mm）
    const extraTopMargin = 30 // 第二页及之后额外顶部间距（mm）
    
    const contentWidth = pageWidth - 2 * sideMargin
    const firstPageContentHeight = pageHeight - topMargin - bottomMargin // 第一页可用内容高度
    const otherPageContentHeight = pageHeight - topMargin - bottomMargin - extraTopMargin // 其他页可用内容高度（更小，留更多顶部空间）
    
    // 计算图片在PDF中的尺寸
    const imgWidthMM = contentWidth
    const imgHeightMM = (canvas.height * contentWidth) / canvas.width
    
    // 计算canvas像素与mm的比例
    const pxPerMM = canvas.width / contentWidth
    
    // 计算总共需要多少页
    let totalHeightMM = imgHeightMM
    let pages = []
    let currentY = 0 // 当前在原图中的Y位置（mm）
    let pageIndex = 0
    
    while (currentY < imgHeightMM) {
      const availableHeight = pageIndex === 0 ? firstPageContentHeight : otherPageContentHeight
      const sliceHeight = Math.min(availableHeight, imgHeightMM - currentY)
      
      pages.push({
        sourceY: currentY * pxPerMM, // 原图中的起始Y（像素）
        sourceHeight: sliceHeight * pxPerMM, // 原图中的高度（像素）
        destY: pageIndex === 0 ? topMargin : (topMargin + extraTopMargin), // PDF中的Y位置
        destHeight: sliceHeight // PDF中的高度（mm）
      })
      
      currentY += sliceHeight
      pageIndex++
    }
    
    // 逐页渲染
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        pdf.addPage()
      }
      
      const page = pages[i]
      
      // 创建当前页的canvas切片
      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = canvas.width
      sliceCanvas.height = Math.ceil(page.sourceHeight)
      
      const ctx = sliceCanvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
      
      // 从原canvas中截取对应部分
      ctx.drawImage(
        canvas,
        0, Math.floor(page.sourceY), // 源图起始位置
        canvas.width, Math.ceil(page.sourceHeight), // 源图尺寸
        0, 0, // 目标位置
        sliceCanvas.width, sliceCanvas.height // 目标尺寸
      )
      
      const sliceImgData = sliceCanvas.toDataURL('image/png')
      pdf.addImage(sliceImgData, 'PNG', sideMargin, page.destY, imgWidthMM, page.destHeight)
    }
    
    pdf.save(`训练日志-${log.student_name}-${log.training_date}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}

// 导出为Word
export const exportToWord = async (log) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: '技能竞赛训练日志',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        
        createWordSection('训练日期', formatDate(log.training_date)),
        createWordSection('学生姓名', log.student_name),
        createWordSection('项目名称', log.project_name),
        createWordSection('当日教练', log.coach_name),
        createWordSection('训练课题', log.training_topic),
        createWordSection('训练内容', log.training_content),
        createWordSection('存在问题', log.problems),
        createWordSection('解决办法', log.solutions),
        createWordSection('训练小结', log.summary),
        createWordSection('自我评价', log.self_rating),
        
        ...(log.teacher_rating ? [
          new Paragraph({
            text: '',
            spacing: { before: 300 }
          }),
          new Paragraph({
            text: '教师评价',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 200 }
          }),
          createWordSection('教练评价', log.teacher_rating),
          createWordSection('教练评语', log.teacher_comment)
        ] : [])
      ]
    }]
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `训练日志-${log.student_name}-${log.training_date}.docx`)
}

// 导出为Markdown
export const exportToMarkdown = (log) => {
  const md = `# 技能竞赛训练日志

## 基本信息

- **训练日期**: ${formatDate(log.training_date)}
- **学生姓名**: ${log.student_name}
- **项目名称**: ${log.project_name}
- **当日教练**: ${log.coach_name}

## 训练课题

${log.training_topic}

## 训练内容

${log.training_content}

## 存在问题

${log.problems}

## 解决办法

${log.solutions}

## 训练小结

${log.summary}

## 自我评价

${log.self_rating}

${log.teacher_rating ? `
---

## 教师评价

- **教练评价**: ${log.teacher_rating}
- **教练评语**: ${log.teacher_comment || '无'}
` : ''}

---

*导出时间: ${new Date().toLocaleString('zh-CN')}*
`

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  saveAs(blob, `训练日志-${log.student_name}-${log.training_date}.md`)
}

// 创建HTML内容
function createLogHTML(log) {
  return `
    <div style="font-family: 'Microsoft YaHei', Arial, sans-serif; line-height: 1.8; color: #333;">
      <h1 style="text-align: center; color: #409eff; margin-bottom: 30px; font-size: 28px;">技能竞赛训练日志</h1>
      
      <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #409eff; margin-bottom: 15px; font-size: 18px;">基本信息</h3>
        <p><strong>训练日期：</strong>${formatDate(log.training_date)}</p>
        <p><strong>学生姓名：</strong>${log.student_name}</p>
        <p><strong>项目名称：</strong>${log.project_name}</p>
        <p><strong>当日教练：</strong>${log.coach_name}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #409eff; margin-bottom: 10px; font-size: 18px;">训练课题</h3>
        <p style="padding: 15px; background: #fff; border-left: 4px solid #409eff;">${log.training_topic}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #409eff; margin-bottom: 10px; font-size: 18px;">训练内容</h3>
        <p style="padding: 15px; background: #fff; border-left: 4px solid #409eff; white-space: pre-wrap;">${log.training_content}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #409eff; margin-bottom: 10px; font-size: 18px;">存在问题</h3>
        <p style="padding: 15px; background: #fff; border-left: 4px solid #e6a23c; white-space: pre-wrap;">${log.problems}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #409eff; margin-bottom: 10px; font-size: 18px;">解决办法</h3>
        <p style="padding: 15px; background: #fff; border-left: 4px solid #67c23a; white-space: pre-wrap;">${log.solutions}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #409eff; margin-bottom: 10px; font-size: 18px;">训练小结</h3>
        <p style="padding: 15px; background: #fff; border-left: 4px solid #409eff; white-space: pre-wrap;">${log.summary}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #409eff; margin-bottom: 10px; font-size: 18px;">自我评价</h3>
        <p style="padding: 15px; background: #fff; border-left: 4px solid #409eff;">
          <span style="display: inline-block; padding: 5px 15px; background: ${getRatingColor(log.self_rating)}; color: white; border-radius: 4px;">${log.self_rating}</span>
        </p>
      </div>

      ${log.teacher_rating ? `
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-top: 30px; border: 2px solid #409eff;">
          <h3 style="color: #409eff; margin-bottom: 15px; font-size: 18px;">教师评价</h3>
          <p><strong>教练评价：</strong>
            <span style="display: inline-block; padding: 5px 15px; background: ${getRatingColor(log.teacher_rating)}; color: white; border-radius: 4px;">${log.teacher_rating}</span>
          </p>
          <p><strong>教练评语：</strong></p>
          <p style="padding: 15px; background: white; border-radius: 4px; white-space: pre-wrap;">${log.teacher_comment || '无'}</p>
        </div>
      ` : ''}

      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; color: #999; font-size: 12px;">
        导出时间：${new Date().toLocaleString('zh-CN')}
      </div>
    </div>
  `
}

// 创建Word段落
function createWordSection(label, content) {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${label}：`,
        bold: true,
        size: 24
      }),
      new TextRun({
        text: content || '无',
        size: 24
      })
    ],
    spacing: { after: 200 }
  })
}

// 获取评价颜色
function getRatingColor(rating) {
  const colors = {
    '优': '#67c23a',
    '良': '#409eff',
    '一般': '#e6a23c',
    '差': '#f56c6c'
  }
  return colors[rating] || '#909399'
}

// 格式化日期：将 ISO 格式转换为 yyyy-MM-dd HH:mm:ss 或 yyyy-MM-dd
function formatDate(dateStr) {
  if (!dateStr) return ''
  // 如果是 ISO 格式 (包含 T 和 Z)
  if (dateStr.includes('T')) {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    // 如果时间部分全为0，只返回日期
    if (hours === '00' && minutes === '00' && seconds === '00') {
      return `${year}-${month}-${day}`
    }
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
  return dateStr
}
