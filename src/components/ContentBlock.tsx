import { useRef, useEffect } from 'react';
import { Group, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { useAppStore } from '../stores/appStore';
import type { ContentBlock } from '../types/canvas';
import useImage from 'use-image';

interface ContentBlockProps {
  block: ContentBlock;
  isSelected: boolean;
  canDrag?: boolean;
  onDoubleClick?: (block: ContentBlock) => void;
}

function TextBlockComponent({ block, isSelected, canDrag = true, onDoubleClick }: { block: ContentBlock & { type: 'text' }, isSelected: boolean, canDrag?: boolean, onDoubleClick?: (block: ContentBlock) => void }) {
  const { selectBlocks, updateBlock, canvas } = useAppStore();
  const groupRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleClick = (e: any) => {
    e.cancelBubble = true;
    if (e.evt.ctrlKey || e.evt.metaKey) {
      const newSelectedIds = canvas.selectedIds.includes(block.id)
        ? canvas.selectedIds.filter(id => id !== block.id)
        : [...canvas.selectedIds, block.id];
      selectBlocks(newSelectedIds);
    } else {
      selectBlocks([block.id]);
    }
  };

  const handleDoubleClick = (e: any) => {
    e.cancelBubble = true;
    if (onDoubleClick) {
      onDoubleClick(block);
    }
  };

  const handleDragEnd = (e: any) => {
    if (!canDrag) return;
    updateBlock(block.id, {
      position: {
        x: e.target.x(),
        y: e.target.y(),
      },
    });
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // 计算新的尺寸 - 使用block.size而不是node的尺寸
    const newWidth = Math.max(50, block.size.width * scaleX);
    const newHeight = Math.max(30, block.size.height * scaleY);

    // 计算新的字体大小 - 使用平均缩放比例
    const avgScale = (scaleX + scaleY) / 2;
    const currentFontSize = block.fontSize || 14;
    const newFontSize = Math.max(8, Math.min(72, currentFontSize * avgScale));

    // 重置缩放
    node.scaleX(1);
    node.scaleY(1);

    updateBlock(block.id, {
      position: {
        x: node.x(),
        y: node.y(),
      },
      size: {
        width: newWidth,
        height: newHeight,
      },
      fontSize: newFontSize,
    });
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={block.position.x}
        y={block.position.y}
        draggable={canDrag}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        onDblClick={handleDoubleClick}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          width={block.size.width}
          height={block.size.height}
          fill="white"
          stroke={isSelected ? '#3b82f6' : '#e5e7eb'}
          strokeWidth={isSelected ? 2 : 1}
          shadowColor="black"
          shadowBlur={5}
          shadowOpacity={0.1}
          cornerRadius={4}
        />
        <Text
          text={block.content}
          x={10}
          y={10}
          width={block.size.width - 20}
          height={block.size.height - 20}
          fontSize={block.fontSize || 14}
          fontFamily={block.fontFamily || 'Arial'}
          fill={block.color || '#000000'}
          wrap="word"
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            // 限制最小尺寸
            if (newBox.width < 50 || newBox.height < 30) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

function ImageBlockComponent({ block, isSelected, canDrag = true, onDoubleClick }: { block: ContentBlock & { type: 'image' }, isSelected: boolean, canDrag?: boolean, onDoubleClick?: (block: ContentBlock) => void }) {
  const { selectBlocks, updateBlock, canvas } = useAppStore();
  const groupRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [image] = useImage(block.imageData);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleClick = (e: any) => {
    e.cancelBubble = true;
    if (e.evt.ctrlKey || e.evt.metaKey) {
      const newSelectedIds = canvas.selectedIds.includes(block.id)
        ? canvas.selectedIds.filter(id => id !== block.id)
        : [...canvas.selectedIds, block.id];
      selectBlocks(newSelectedIds);
    } else {
      selectBlocks([block.id]);
    }
  };

  const handleDoubleClick = (e: any) => {
    e.cancelBubble = true;
    if (onDoubleClick) {
      onDoubleClick(block);
    }
  };

  const handleDragEnd = (e: any) => {
    if (!canDrag) return;
    updateBlock(block.id, {
      position: {
        x: e.target.x(),
        y: e.target.y(),
      },
    });
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // 计算新的尺寸
    const newWidth = Math.max(50, block.size.width * scaleX);
    const newHeight = Math.max(50, block.size.height * scaleY);

    // 重置缩放
    node.scaleX(1);
    node.scaleY(1);

    updateBlock(block.id, {
      position: {
        x: node.x(),
        y: node.y(),
      },
      size: {
        width: newWidth,
        height: newHeight,
      },
    });
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={block.position.x}
        y={block.position.y}
        draggable={canDrag}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        onDblClick={handleDoubleClick}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          width={block.size.width}
          height={block.size.height}
          stroke={isSelected ? '#3b82f6' : '#e5e7eb'}
          strokeWidth={isSelected ? 2 : 1}
          shadowColor="black"
          shadowBlur={5}
          shadowOpacity={0.1}
        />
        {image && (
          <KonvaImage
            image={image}
            width={block.size.width}
            height={block.size.height}
          />
        )}
      </Group>
      {isSelected && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            // 限制最小尺寸
            if (newBox.width < 50 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

function ContentBlockComponent({ block, isSelected, canDrag = true, onDoubleClick }: ContentBlockProps) {
  if (block.type === 'text') {
    return <TextBlockComponent block={block} isSelected={isSelected} canDrag={canDrag} onDoubleClick={onDoubleClick} />;
  } else {
    return <ImageBlockComponent block={block} isSelected={isSelected} canDrag={canDrag} onDoubleClick={onDoubleClick} />;
  }
}

export default ContentBlockComponent;
