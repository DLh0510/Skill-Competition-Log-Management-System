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

// 导出为PDF（支持多页）
export const exportToPDF = async (log) => {
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
      logging: false,
      windowHeight: container.scrollHeight
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const pageWidth = 210 // A4宽度（mm）
    const pageHeight = 297 // A4高度（mm）
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * pageWidth) / canvas.width
    
    let heightLeft = imgHeight
    let position = 0
    
    // 添加第一页
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    // 如果内容超过一页，添加更多页
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
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
        
        createWordSection('训练日期', log.training_date),
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

- **训练日期**: ${log.training_date}
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
        <p><strong>训练日期：</strong>${log.training_date}</p>
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
