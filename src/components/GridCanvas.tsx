import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import type { ContentBlock } from '../types/canvas';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface GridCanvasRef {
  exportToImage: () => Promise<string>;
}

interface GridCanvasProps {
  onBlockDoubleClick?: (block: ContentBlock) => void;
}

// 可排序的内容卡片组件
function SortableCard({ block, index, onDoubleClick, onTimeEdit }: { 
  block: ContentBlock; 
  index: number; 
  onDoubleClick?: (block: ContentBlock) => void;
  onTimeEdit?: (blockId: string, newTime: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState('');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 格式化时间戳为 YYYY-MM-DD HH:mm:ss
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 解析时间字符串为时间戳
  const parseTimeString = (timeStr: string): number | null => {
    const date = new Date(timeStr);
    return isNaN(date.getTime()) ? null : date.getTime();
  };

  const handleTimeEdit = () => {
    setTimeInput(formatTimestamp(block.createdAt));
    setIsEditingTime(true);
  };

  const handleTimeSave = () => {
    const newTime = parseTimeString(timeInput);
    if (newTime && onTimeEdit) {
      onTimeEdit(block.id, newTime);
    }
    setIsEditingTime(false);
  };

  const handleTimeCancel = () => {
    setIsEditingTime(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* 序号拖动手柄 */}
      <div
        {...attributes}
        {...listeners}
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 text-xs font-semibold cursor-move"
      >
        <div className="flex items-center justify-between mb-1">
          <span>#{index + 1}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        
        {/* 时间戳显示/编辑 */}
        {isEditingTime ? (
          <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              className="flex-1 px-1 py-0.5 text-xs text-gray-800 rounded border border-white"
              placeholder="YYYY-MM-DD HH:mm:ss"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTimeSave();
                if (e.key === 'Escape') handleTimeCancel();
              }}
            />
            <button
              onClick={handleTimeSave}
              className="px-1 py-0.5 bg-green-500 hover:bg-green-600 rounded text-xs"
            >
              ✓
            </button>
            <button
              onClick={handleTimeCancel}
              className="px-1 py-0.5 bg-red-500 hover:bg-red-600 rounded text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <div 
            className="flex items-center justify-between text-xs opacity-90 cursor-pointer hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              handleTimeEdit();
            }}
            title="点击编辑时间"
          >
            <span>{formatTimestamp(block.createdAt)}</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div
        className="p-4 cursor-pointer h-56 flex items-center justify-center overflow-hidden"
        onDoubleClick={() => onDoubleClick?.(block)}
      >
        {block.type === 'text' ? (
          <div
            className="text-sm text-gray-700 line-clamp-6 w-full"
            style={{
              fontSize: `${Math.min(block.fontSize || 14, 14)}px`,
              fontFamily: block.fontFamily || 'Arial',
              color: block.color || '#000000',
            }}
          >
            {block.content}
          </div>
        ) : (
          <img
            src={block.imageData}
            alt={`内容 ${index + 1}`}
            className="w-full h-full object-contain"
          />
        )}
      </div>
    </div>
  );
}

const GridCanvas = forwardRef<GridCanvasRef, GridCanvasProps>(({ onBlockDoubleClick }, ref) => {
  const { canvas, reorderBlocks, updateBlock } = useAppStore();
  const { blocks } = canvas;
  const [items, setItems] = useState(blocks);

  // 同步blocks到items
  useEffect(() => {
    setItems(blocks);
  }, [blocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移动后才开始拖拽,避免误触
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      reorderBlocks(newItems);
    }
  };

  // 处理时间编辑
  const handleTimeEdit = (blockId: string, newTime: number) => {
    updateBlock(blockId, { createdAt: newTime });
  };

  // 暴露导出方法
  useImperativeHandle(ref, () => ({
    exportToImage: async () => {
      // TODO: 实现网格布局的导出
      throw new Error('网格布局导出功能待实现');
    },
  }));

  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">暂无内容</p>
          <p className="text-sm">按 <kbd className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">Ctrl+V</kbd> 粘贴内容</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(b => b.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-4">
          {items.map((block, index) => (
            <SortableCard
              key={block.id}
              block={block}
              index={index}
              onDoubleClick={onBlockDoubleClick}
              onTimeEdit={handleTimeEdit}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
});

GridCanvas.displayName = 'GridCanvas';

export default GridCanvas;
