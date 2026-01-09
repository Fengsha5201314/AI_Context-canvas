import type { ContentBlock, TextBlock, ImageBlock, Position } from '../types/canvas';

// 从剪贴板读取内容
export async function readFromClipboard(position?: Position): Promise<ContentBlock | null> {
  const defaultPosition = position || { x: 100, y: 100 };
  
  try {
    // 首先尝试使用现代剪贴板API
    const clipboardItems = await navigator.clipboard.read();
    
    for (const item of clipboardItems) {
      // 处理图片
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const blob = await item.getType(type);
          const imageData = await blobToBase64(blob);
          
          // 创建临时图片以获取尺寸
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = imageData;
          });
          
          const imageBlock: ImageBlock = {
            id: `block-${Date.now()}-${Math.random()}`,
            type: 'image',
            imageData,
            originalFormat: type.split('/')[1],
            position: defaultPosition,
            size: { width: Math.min(img.width, 800), height: Math.min(img.height, 600) },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          return imageBlock;
        }
      }
      
      // 处理文字
      if (item.types.includes('text/plain')) {
        const blob = await item.getType('text/plain');
        const text = await blob.text();
        
        if (text.trim()) {
          // 计算文字块的合适尺寸
          const lines = text.split('\n');
          const maxLineLength = Math.max(...lines.map(line => line.length));
          const width = Math.min(Math.max(300, maxLineLength * 8), 600);
          const height = Math.min(Math.max(100, lines.length * 20 + 20), 400);
          
          const textBlock: TextBlock = {
            id: `block-${Date.now()}-${Math.random()}`,
            type: 'text',
            content: text,
            position: defaultPosition,
            size: { width, height },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          return textBlock;
        }
      }
    }
  } catch (error) {
    console.warn('使用clipboard.read()失败，尝试降级方案:', error);
    
    // 降级方案：使用传统的文本API
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        // 计算文字块的合适尺寸
        const lines = text.split('\n');
        const maxLineLength = Math.max(...lines.map(line => line.length));
        const width = Math.min(Math.max(300, maxLineLength * 8), 600);
        const height = Math.min(Math.max(100, lines.length * 20 + 20), 400);
        
        const textBlock: TextBlock = {
          id: `block-${Date.now()}-${Math.random()}`,
          type: 'text',
          content: text,
          position: defaultPosition,
          size: { width, height },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        return textBlock;
      }
    } catch (fallbackError) {
      console.error('所有剪贴板读取方法都失败了:', fallbackError);
      throw new Error('无法读取剪贴板内容。请确保已授予剪贴板权限。');
    }
  }
  
  return null;
}

// 将Blob转换为Base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// 处理文件拖拽
export async function handleFileDrop(files: FileList): Promise<ContentBlock[]> {
  const blocks: ContentBlock[] = [];
  let offsetX = 100;
  let offsetY = 100;
  
  for (const file of Array.from(files)) {
    if (file.type.startsWith('image/')) {
      const imageData = await fileToBase64(file);
      
      // 创建临时图片以获取尺寸
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = imageData;
      });
      
      const imageBlock: ImageBlock = {
        id: `block-${Date.now()}-${Math.random()}`,
        type: 'image',
        imageData,
        originalFormat: file.type.split('/')[1],
        position: { x: offsetX, y: offsetY },
        size: { width: Math.min(img.width, 800), height: Math.min(img.height, 600) },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      blocks.push(imageBlock);
      
      // 自动排列：下一个图片向右偏移
      const imgWidth = Math.min(img.width, 800);
      offsetX += imgWidth + 20;
      if (offsetX > 1000) {
        offsetX = 100;
        offsetY += 400;
      }
    }
  }
  
  return blocks;
}

// 将File转换为Base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 检查剪贴板权限
export async function checkClipboardPermission(): Promise<boolean> {
  try {
    const result = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
    return result.state === 'granted' || result.state === 'prompt';
  } catch (error) {
    // 某些浏览器不支持clipboard-read权限查询
    return true;
  }
}
