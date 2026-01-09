import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { useAppStore } from '../stores/appStore';
import ContentBlockComponent from './ContentBlock.tsx';
import type { ContentBlock } from '../types/canvas';

export interface CanvasRef {
  exportToImage: () => Promise<string>;
}

interface CanvasProps {
  onBlockDoubleClick?: (block: ContentBlock) => void;
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(({ onBlockDoubleClick }, ref) => {
  const stageRef = useRef<any>(null);
  const { canvas, setViewport, selectBlocks, showGrid, setClickPosition } = useAppStore();
  const { blocks, selectedIds, viewport } = canvas;
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);

  // 暴露导出方法给父组件
  useImperativeHandle(ref, () => ({
    exportToImage: async () => {
      const stage = stageRef.current;
      if (!stage || blocks.length === 0) {
        throw new Error('画布为空');
      }

      // 保存当前视口状态
      const originalViewport = { ...viewport };

      try {
        // 计算所有内容的边界框
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        blocks.forEach(block => {
          minX = Math.min(minX, block.position.x);
          minY = Math.min(minY, block.position.y);
          maxX = Math.max(maxX, block.position.x + block.size.width);
          maxY = Math.max(maxY, block.position.y + block.size.height);
        });

        // 添加边距
        const padding = 50;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;

        // 计算合适的缩放比例以适应导出尺寸
        const maxExportWidth = 2480; // A4宽度的像素(300dpi)
        const maxExportHeight = 3508; // A4高度的像素(300dpi)
        
        const scaleX = maxExportWidth / contentWidth;
        const scaleY = maxExportHeight / contentHeight;
        const exportScale = Math.min(scaleX, scaleY, 2); // 最大2倍,保证清晰度

        // 临时调整视口以包含所有内容
        setViewport({
          x: -minX * exportScale,
          y: -minY * exportScale,
          scale: exportScale,
        });

        // 等待视口更新
        await new Promise(resolve => setTimeout(resolve, 100));

        // 导出为高质量图片
        const dataURL = stage.toDataURL({
          pixelRatio: 2, // 2倍分辨率,提高清晰度
        });

        // 恢复原始视口
        setViewport(originalViewport);

        return dataURL;
      } catch (error) {
        // 确保恢复视口
        setViewport(originalViewport);
        throw error;
      }
    },
  }));

  // 处理画布拖拽（仅在按住空格时）
  const handleDragEnd = (e: any) => {
    if (isSpacePressed || isDraggingCanvas) {
      setViewport({
        x: e.target.x(),
        y: e.target.y(),
      });
      setIsDraggingCanvas(false);
    }
  };

  // 处理画布缩放（Alt + 滚轮）
  const handleWheel = (e: any) => {
    // 只在按住Alt键时缩放
    if (!e.evt.altKey) return;
    
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = viewport.scale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - viewport.x) / oldScale,
      y: (pointer.y - viewport.y) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;

    // 限制缩放范围
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    setViewport({
      scale: clampedScale,
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  // 处理画布点击
  const handleStageClick = (e: any) => {
    // 如果点击的是画布背景
    if (e.target === e.target.getStage()) {
      selectBlocks([]);
      
      // 记录点击位置（用于粘贴）
      const stage = stageRef.current;
      if (stage) {
        const pointer = stage.getPointerPosition();
        const scale = viewport.scale;
        setClickPosition({
          x: (pointer.x - viewport.x) / scale,
          y: (pointer.y - viewport.y) / scale,
        });
      }
    }
  };

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
        setIsDraggingCanvas(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
        setIsDraggingCanvas(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  // 生成网格线
  const generateGridLines = () => {
    if (!showGrid) return null;

    const lines = [];
    const gridSize = 50;
    // 扩大网格范围到10倍视口大小，确保足够大
    const stageWidth = window.innerWidth * 10;
    const stageHeight = (window.innerHeight - 60) * 10;
    const offsetX = -stageWidth / 2;
    const offsetY = -stageHeight / 2;

    // 垂直线
    for (let i = 0; i <= stageWidth / gridSize; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[offsetX + i * gridSize, offsetY, offsetX + i * gridSize, offsetY + stageHeight]}
          stroke="#d1d5db"
          strokeWidth={1}
          listening={false}
          dash={[5, 5]}
        />
      );
    }

    // 水平线
    for (let i = 0; i <= stageHeight / gridSize; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[offsetX, offsetY + i * gridSize, offsetX + stageWidth, offsetY + i * gridSize]}
          stroke="#d1d5db"
          strokeWidth={1}
          listening={false}
          dash={[5, 5]}
        />
      );
    }

    return lines;
  };

  return (
    <div className="w-full h-full relative">
      {blocks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center text-gray-400 max-w-2xl px-4">
            <p className="text-xl mb-4 font-semibold">欢迎使用AI上下文画布</p>
            <div className="space-y-2 text-sm">
              <p>📋 点击画布任意位置，然后按 <kbd className="px-2 py-1 bg-gray-200 text-gray-700 rounded">Ctrl+V</kbd> 粘贴内容</p>
              <p>📁 或拖拽文件到此处</p>
              <p className="mt-4 text-xs text-gray-500">提示：首次粘贴时，浏览器可能会请求剪贴板权限，请点击"允许"</p>
            </div>
            <div className="mt-6 space-y-1 text-xs text-gray-400">
              <p>⌨️ 按住 <kbd className="px-1 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">空格键</kbd> + 拖动鼠标可移动画布</p>
              <p>🔍 按住 <kbd className="px-1 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">Alt键</kbd> + 滚轮可缩放画布</p>
            </div>
          </div>
        </div>
      )}
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight - 60}
        draggable={isSpacePressed || isDraggingCanvas}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        onDragEnd={handleDragEnd}
        onWheel={handleWheel}
        onClick={handleStageClick}
        style={{ cursor: isSpacePressed ? 'grab' : 'default' }}
      >
        <Layer>
          {generateGridLines()}
          {blocks.map((block) => (
            <ContentBlockComponent
              key={block.id}
              block={block}
              isSelected={selectedIds.includes(block.id)}
              canDrag={!isSpacePressed}
              onDoubleClick={onBlockDoubleClick}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
