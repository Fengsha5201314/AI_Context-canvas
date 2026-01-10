import { useEffect, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import type { ContentBlock } from '../types/canvas';

/**
 * 剪贴板监听 Hook
 * 当自动捕获开关打开时，定时检查剪贴板内容
 * 如果发现新内容，自动添加到画布
 */
export function useClipboardMonitor() {
  const { autoCapture, addBlock, canvas } = useAppStore();
  const lastContentRef = useRef<string>('');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!autoCapture) {
      // 关闭监听
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 开启监听
    const checkClipboard = async () => {
      try {
        // 检查是否有剪贴板权限
        const permission = await navigator.permissions.query({
          name: 'clipboard-read' as PermissionName,
        });

        if (permission.state === 'denied') {
          console.warn('剪贴板权限被拒绝');
          return;
        }

        // 读取剪贴板内容
        const items = await navigator.clipboard.read();

        for (const item of items) {
          // 处理图片
          if (item.types.includes('image/png')) {
            const blob = await item.getType('image/png');
            const reader = new FileReader();

            reader.onload = (e) => {
              const imageData = e.target?.result as string;

              // 检查是否是新内容
              if (imageData === lastContentRef.current) return;
              lastContentRef.current = imageData;

              // 检查是否已存在相同图片
              const exists = canvas.blocks.some(
                (block) => block.type === 'image' && block.imageData === imageData
              );
              if (exists) return;

              // 创建图片对象以获取尺寸
              const img = new Image();
              img.onload = () => {
                const maxWidth = 400;
                const maxHeight = 400;
                let width = img.width;
                let height = img.height;

                // 等比例缩放
                if (width > maxWidth || height > maxHeight) {
                  const ratio = Math.min(maxWidth / width, maxHeight / height);
                  width = width * ratio;
                  height = height * ratio;
                }

                const newBlock: ContentBlock = {
                  id: `block-${Date.now()}-${Math.random()}`,
                  type: 'image',
                  imageData,
                  originalFormat: 'png',
                  position: { x: 100, y: 100 },
                  size: { width, height },
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                };

                addBlock(newBlock);
                console.log('自动捕获：已添加图片');
              };
              img.src = imageData;
            };

            reader.readAsDataURL(blob);
          }
          // 处理文本
          else if (item.types.includes('text/plain')) {
            const blob = await item.getType('text/plain');
            const text = await blob.text();

            // 检查是否是新内容
            if (text === lastContentRef.current) return;
            lastContentRef.current = text;

            // 过滤空文本
            if (!text.trim()) return;

            // 检查是否已存在相同文本
            const exists = canvas.blocks.some(
              (block) => block.type === 'text' && block.content === text
            );
            if (exists) return;

            const newBlock: ContentBlock = {
              id: `block-${Date.now()}-${Math.random()}`,
              type: 'text',
              content: text,
              position: { x: 100, y: 100 },
              size: { width: 300, height: 150 },
              fontSize: 14,
              fontFamily: 'Arial',
              color: '#000000',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };

            addBlock(newBlock);
            console.log('自动捕获：已添加文本');
          }
        }
      } catch (error) {
        // 忽略权限错误和其他错误
        // console.error('读取剪贴板失败:', error);
      }
    };

    // 每 500ms 检查一次剪贴板
    intervalRef.current = window.setInterval(checkClipboard, 500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoCapture, addBlock, canvas.blocks]);
}
