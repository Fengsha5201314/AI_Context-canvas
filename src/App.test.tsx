import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './stores/appStore';
import type { TextBlock } from './types/canvas';

describe('App Store', () => {
  beforeEach(() => {
    // 重置store状态
    useAppStore.setState({
      canvas: {
        blocks: [],
        selectedIds: [],
        viewport: { x: 0, y: 0, scale: 1 },
        history: { past: [], future: [] },
      },
      clipboard: null,
    });
  });

  it('should add a text block', () => {
    const store = useAppStore.getState();
    
    const textBlock: TextBlock = {
      id: 'test-1',
      type: 'text',
      content: 'Test content',
      position: { x: 0, y: 0 },
      size: { width: 100, height: 50 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    store.addBlock(textBlock);
    
    const updatedStore = useAppStore.getState();
    expect(updatedStore.canvas.blocks.length).toBe(1);
    expect(updatedStore.canvas.blocks[0].id).toBe('test-1');
  });

  it('should delete a block', () => {
    const store = useAppStore.getState();
    
    const textBlock: TextBlock = {
      id: 'test-delete',
      type: 'text',
      content: 'To be deleted',
      position: { x: 0, y: 0 },
      size: { width: 100, height: 50 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    store.addBlock(textBlock);
    let updatedStore = useAppStore.getState();
    expect(updatedStore.canvas.blocks.length).toBe(1);
    
    store.deleteBlocks(['test-delete']);
    updatedStore = useAppStore.getState();
    
    expect(updatedStore.canvas.blocks.length).toBe(0);
    expect(updatedStore.canvas.blocks.find(b => b.id === 'test-delete')).toBeUndefined();
  });

  it('should select blocks', () => {
    const store = useAppStore.getState();
    
    store.selectBlocks(['test-1', 'test-2']);
    
    const updatedStore = useAppStore.getState();
    expect(updatedStore.canvas.selectedIds).toEqual(['test-1', 'test-2']);
  });

  it('should move blocks', () => {
    const store = useAppStore.getState();
    
    const textBlock: TextBlock = {
      id: 'test-move',
      type: 'text',
      content: 'To be moved',
      position: { x: 0, y: 0 },
      size: { width: 100, height: 50 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    store.addBlock(textBlock);
    store.moveBlocks(['test-move'], { x: 10, y: 20 });
    
    const updatedStore = useAppStore.getState();
    const movedBlock = updatedStore.canvas.blocks.find(b => b.id === 'test-move');
    expect(movedBlock?.position).toEqual({ x: 10, y: 20 });
  });

  it('should undo and redo', () => {
    const store = useAppStore.getState();
    
    const textBlock: TextBlock = {
      id: 'test-undo',
      type: 'text',
      content: 'Test undo',
      position: { x: 0, y: 0 },
      size: { width: 100, height: 50 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    store.addBlock(textBlock);
    let updatedStore = useAppStore.getState();
    expect(updatedStore.canvas.blocks.length).toBe(1);
    
    store.undo();
    updatedStore = useAppStore.getState();
    expect(updatedStore.canvas.blocks.length).toBe(0);
    
    store.redo();
    updatedStore = useAppStore.getState();
    expect(updatedStore.canvas.blocks.length).toBe(1);
  });
});
