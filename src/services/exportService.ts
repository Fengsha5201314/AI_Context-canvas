import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
import type { ContentBlock } from '../types/canvas';

export class ExportService {
  // 生成标准化的导出文件名: AI_context_YYMMDD###
  static generateExportFilename(extension: 'pdf' | 'docx'): string {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2); // 后两位年份
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateKey = `${year}${month}${day}`;
    
    // 从localStorage获取今天的导出计数
    const storageKey = `export_counter_${dateKey}`;
    let counter = parseInt(localStorage.getItem(storageKey) || '0', 10);
    
    // 递增计数器
    counter += 1;
    localStorage.setItem(storageKey, String(counter));
    
    // 格式化为3位数字
    const counterStr = String(counter).padStart(3, '0');
    
    return `AI_context_${dateKey}${counterStr}.${extension}`;
  }
  // 导出为PDF - 最强大脑优化版
  static async exportToPDF(blocks: ContentBlock[]): Promise<Blob> {
    if (blocks.length === 0) {
      throw new Error('画布为空，无法导出');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let currentY = margin;

    // 按位置排序内容块（从上到下，从左到右）
    const sortedBlocks = [...blocks].sort((a, b) => {
      const yDiff = a.position.y - b.position.y;
      if (Math.abs(yDiff) < 100) { // 如果Y坐标接近,按X排序
        return a.position.x - b.position.x;
      }
      return yDiff;
    });

    for (let i = 0; i < sortedBlocks.length; i++) {
      const block = sortedBlocks[i];

      if (block.type === 'text') {
        // 渲染文本块 - 保留原始格式
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // 使用原始字体大小,不缩小
        const fontSize = block.fontSize || 14;
        const lineHeight = fontSize * 1.6;
        const padding = 12;
        
        // 设置字体用于测量
        ctx.font = `${fontSize}px ${block.fontFamily || 'Arial'}, "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif`;
        
        // 智能分行 - 保留原始换行符
        const lines: string[] = [];
        const paragraphs = block.content.split('\n');
        const maxWidthPx = contentWidth * 3.78; // mm转px
        
        for (const para of paragraphs) {
          if (!para.trim()) {
            lines.push('');
            continue;
          }
          
          let currentLine = '';
          for (const char of para) {
            const testLine = currentLine + char;
            const width = ctx.measureText(testLine).width;
            
            if (width > maxWidthPx - padding * 2 && currentLine) {
              lines.push(currentLine);
              currentLine = char;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) {
            lines.push(currentLine);
          }
        }
        
        // 计算canvas尺寸
        const canvasHeight = lines.length * lineHeight + padding * 2;
        canvas.width = contentWidth * 3.78;
        canvas.height = canvasHeight;
        
        // 绘制白色背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 重新设置字体(canvas重置后需要)
        ctx.font = `${fontSize}px ${block.fontFamily || 'Arial'}, "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif`;
        ctx.fillStyle = block.color || '#000000';
        ctx.textBaseline = 'top';
        
        // 绘制文本
        lines.forEach((line, idx) => {
          ctx.fillText(line, padding, padding + idx * lineHeight);
        });
        
        // 转换为图片
        const imgData = canvas.toDataURL('image/png');
        const imgHeightMM = canvasHeight / 3.78;
        
        // 检查是否需要新页面
        if (currentY + imgHeightMM > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        
        // 添加到PDF
        pdf.addImage(imgData, 'PNG', margin, currentY, contentWidth, imgHeightMM);
        currentY += imgHeightMM + 5;
        
      } else if (block.type === 'image') {
        // 渲染图片块
        const img = new Image();
        img.src = block.imageData;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          setTimeout(reject, 5000); // 5秒超时
        });

        // 计算图片尺寸
        let imgWidth = block.size.width * 0.264583; // px转mm
        let imgHeight = block.size.height * 0.264583;
        
        // 限制最大宽度
        if (imgWidth > contentWidth) {
          const ratio = contentWidth / imgWidth;
          imgWidth = contentWidth;
          imgHeight *= ratio;
        }
        
        // 限制最大高度
        const maxHeight = pageHeight - margin * 2;
        if (imgHeight > maxHeight) {
          const ratio = maxHeight / imgHeight;
          imgHeight = maxHeight;
          imgWidth *= ratio;
        }
        
        // 检查是否需要新页面
        if (currentY + imgHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        
        // 添加到PDF
        pdf.addImage(block.imageData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 8;
      }
      
      // 在内容块之间添加适当间距
      if (i < sortedBlocks.length - 1) {
        currentY += 3;
      }
    }

    return pdf.output('blob');
  }

  // 导出为PDF(使用画布截图) - 备用方法
  static async exportToPDFFromImage(canvasImageData: string): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // 加载图片
    const img = new Image();
    img.src = canvasImageData;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // 计算图片尺寸以适应页面
    const maxWidth = pageWidth - 2 * margin;
    const maxHeight = pageHeight - 2 * margin;
    
    let imgWidth = img.width * 0.264583; // px to mm
    let imgHeight = img.height * 0.264583;

    // 按比例缩放以适应页面
    if (imgWidth > maxWidth) {
      const ratio = maxWidth / imgWidth;
      imgWidth = maxWidth;
      imgHeight *= ratio;
    }

    if (imgHeight > maxHeight) {
      const ratio = maxHeight / imgHeight;
      imgHeight = maxHeight;
      imgWidth *= ratio;
    }

    // 居中显示
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    pdf.addImage(canvasImageData, 'PNG', x, y, imgWidth, imgHeight);

    return pdf.output('blob');
  }

  // 导出为Word
  static async exportToWord(blocks: ContentBlock[]): Promise<Blob> {
    if (blocks.length === 0) {
      throw new Error('画布为空，无法导出');
    }

    // 按位置排序内容块
    const sortedBlocks = [...blocks].sort((a, b) => {
      if (Math.abs(a.position.y - b.position.y) < 50) {
        return a.position.x - b.position.x;
      }
      return a.position.y - b.position.y;
    });

    const children: (Paragraph)[] = [];

    for (const block of sortedBlocks) {
      if (block.type === 'text') {
        // 添加文字段落
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.content,
                size: (block.fontSize || 14) * 2, // Word使用半点
              }),
            ],
            spacing: {
              after: 200,
            },
          })
        );
      } else if (block.type === 'image') {
        // 添加图片
        const imageData = block.imageData.split(',')[1]; // 移除data:image/...;base64,前缀
        const imageBuffer = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));

        // 计算图片尺寸（限制最大宽度）
        const maxWidth = 600; // 像素
        let width = block.size.width;
        let height = block.size.height;

        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height *= ratio;
        }

        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width,
                  height,
                },
              }),
            ],
            spacing: {
              after: 200,
            },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    return await Packer.toBlob(doc);
  }

  // 触发文件下载
  static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
