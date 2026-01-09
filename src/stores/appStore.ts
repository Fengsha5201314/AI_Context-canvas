import { create } from 'zustand';
import type { ContentBlock, CanvasState, AIConfig, Position } from '../types/canvas';

interface AppStore {
  // 画布状态
  canvas: CanvasState;
  
  // 画布设置
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  
  // 点击位置（用于粘贴）
  clickPosition: Position | null;
  setClickPosition: (pos: Position | null) => void;
  
  // 画布操作方法
  addBlock: (block: ContentBlock) => void;
  updateBlock: (id: string, updates: Partial<ContentBlock>) => void;
  deleteBlocks: (ids: string[]) => void;
  selectBlocks: (ids: string[]) => void;
  moveBlocks: (ids: string[], delta: Position) => void;
  clearCanvas: () => void;
  autoLayout: () => void;
  reorderBlocks: (newBlocks: ContentBlock[]) => void;
  
  // 视口操作
  setViewport: (viewport: Partial<CanvasState['viewport']>) => void;
  
  // 撤销/重做
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  
  // 剪贴板
  clipboard: ContentBlock | null;
  copy: () => void;
  cut: () => void;
  paste: () => void;
  
  // AI配置
  aiConfig: AIConfig;
  updateAIConfig: (config: Partial<AIConfig>) => void;
}

const initialCanvasState: CanvasState = {
  blocks: [],
  selectedIds: [],
  viewport: {
    x: 0,
    y: 0,
    scale: 1,
  },
  history: {
    past: [],
    future: [],
  },
};

const initialAIConfig: AIConfig = {
  providers: {
    google: {
      apiKey: '',
      model: 'gemini-2.5-flash', // 默认使用稳定版
    },
    siliconflow: {
      apiKey: '',
      model: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B', // 默认使用免费模型
    },
    aliyun: {
      apiKey: '',
      model: 'qwen3-coder-plus', // 默认使用有免费额度的模型
    },
  },
  systemPrompt: '请提取并总结以下内容的关键信息：',
  selectedProvider: 'siliconflow', // 默认推荐硅基流动
};

export const useAppStore = create<AppStore>((set, get) => ({
  canvas: initialCanvasState,
  clipboard: null,
  aiConfig: initialAIConfig,
  showGrid: true,
  clickPosition: null,

  setShowGrid: (show) => set({ showGrid: show }),
  setClickPosition: (pos) => set({ clickPosition: pos }),

  // 添加内容块
  addBlock: (block) => {
    set((state) => {
      const newBlocks = [...state.canvas.blocks, block];
      return {
        canvas: {
          ...state.canvas,
          blocks: newBlocks,
        },
      };
    });
    get().pushHistory();
  },

  // 更新内容块
  updateBlock: (id, updates) => {
    set((state) => {
      const newBlocks = state.canvas.blocks.map((block) =>
        block.id === id
          ? { ...block, ...updates, updatedAt: Date.now() } as ContentBlock
          : block
      );
      return {
        canvas: {
          ...state.canvas,
          blocks: newBlocks,
        },
      };
    });
    get().pushHistory();
  },

  // 删除内容块
  deleteBlocks: (ids) => {
    set((state) => {
      const newBlocks = state.canvas.blocks.filter(
        (block) => !ids.includes(block.id)
      );
      const newSelectedIds = state.canvas.selectedIds.filter(
        (id) => !ids.includes(id)
      );
      return {
        canvas: {
          ...state.canvas,
          blocks: newBlocks,
          selectedIds: newSelectedIds,
        },
      };
    });
    get().pushHistory();
  },

  // 选中内容块
  selectBlocks: (ids) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        selectedIds: ids,
      },
    }));
  },

  // 移动内容块
  moveBlocks: (ids, delta) => {
    set((state) => {
      const newBlocks = state.canvas.blocks.map((block) =>
        ids.includes(block.id)
          ? {
              ...block,
              position: {
                x: block.position.x + delta.x,
                y: block.position.y + delta.y,
              },
              updatedAt: Date.now(),
            }
          : block
      );
      return {
        canvas: {
          ...state.canvas,
          blocks: newBlocks,
        },
      };
    });
    get().pushHistory();
  },

  // 清空画布
  clearCanvas: () => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        blocks: [],
        selectedIds: [],
      },
    }));
    get().pushHistory();
  },

  // 自动排版布局 - 按时间排序
  autoLayout: () => {
    set((state) => {
      const blocks = [...state.canvas.blocks];
      if (blocks.length === 0) return state;

      // 按创建时间排序(从早到晚)
      blocks.sort((a, b) => a.createdAt - b.createdAt);

      // 直接更新顺序,不改变位置(网格布局会自动处理位置)
      return {
        canvas: {
          ...state.canvas,
          blocks: blocks,
        },
      };
    });
    get().pushHistory();
  },

  // 设置视口
  setViewport: (viewport) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        viewport: {
          ...state.canvas.viewport,
          ...viewport,
        },
      },
    }));
  },

  // 推入历史记录
  pushHistory: () => {
    set((state) => {
      const newPast = [...state.canvas.history.past, state.canvas.blocks];
      // 限制历史记录数量为50
      if (newPast.length > 50) {
        newPast.shift();
      }
      return {
        canvas: {
          ...state.canvas,
          history: {
            past: newPast,
            future: [],
          },
        },
      };
    });
  },

  // 撤销
  undo: () => {
    set((state) => {
      const { past, future } = state.canvas.history;
      if (past.length === 0) return state;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      const newFuture = [state.canvas.blocks, ...future];

      return {
        canvas: {
          ...state.canvas,
          blocks: previous,
          history: {
            past: newPast,
            future: newFuture,
          },
        },
      };
    });
  },

  // 重做
  redo: () => {
    set((state) => {
      const { past, future } = state.canvas.history;
      if (future.length === 0) return state;

      const next = future[0];
      const newFuture = future.slice(1);
      const newPast = [...past, state.canvas.blocks];

      return {
        canvas: {
          ...state.canvas,
          blocks: next,
          history: {
            past: newPast,
            future: newFuture,
          },
        },
      };
    });
  },

  // 复制
  copy: () => {
    const state = get();
    const selectedBlocks = state.canvas.blocks.filter((block) =>
      state.canvas.selectedIds.includes(block.id)
    );
    if (selectedBlocks.length > 0) {
      set({ clipboard: selectedBlocks[0] });
    }
  },

  // 剪切
  cut: () => {
    const state = get();
    state.copy();
    state.deleteBlocks(state.canvas.selectedIds);
  },

  // 粘贴
  paste: () => {
    const state = get();
    if (state.clipboard) {
      const newBlock: ContentBlock = {
        ...state.clipboard,
        id: `block-${Date.now()}-${Math.random()}`,
        position: {
          x: state.clipboard.position.x + 20,
          y: state.clipboard.position.y + 20,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      state.addBlock(newBlock);
    }
  },

  // 更新AI配置
  updateAIConfig: (config) => {
    set((state) => ({
      aiConfig: {
        ...state.aiConfig,
        ...config,
      },
    }));
  },

  // 重新排序内容块
  reorderBlocks: (newBlocks: ContentBlock[]) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        blocks: newBlocks,
      },
    }));
    get().pushHistory();
  },
}));
