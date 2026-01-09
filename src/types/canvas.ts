// 位置
export interface Position {
  x: number;
  y: number;
}

// 尺寸
export interface Size {
  width: number;
  height: number;
}

// 内容块基类
export interface BaseBlock {
  id: string;
  position: Position;
  size: Size;
  createdAt: number;
  updatedAt: number;
}

// 文字块
export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

// 图片块
export interface ImageBlock extends BaseBlock {
  type: 'image';
  imageData: string; // Base64编码的图片数据
  originalFormat: string; // 原始格式（png, jpg等）
}

// 内容块联合类型
export type ContentBlock = TextBlock | ImageBlock;

// 画布状态
export interface CanvasState {
  blocks: ContentBlock[];
  selectedIds: string[];
  viewport: {
    x: number;
    y: number;
    scale: number;
  };
  history: {
    past: ContentBlock[][];
    future: ContentBlock[][];
  };
}

// AI配置
export interface AIConfig {
  providers: {
    [key: string]: {
      apiKey: string;
      model: string;
    };
  };
  systemPrompt: string;
  selectedProvider: string;
}

// 持久化数据
export interface PersistedData {
  canvas: CanvasState;
  aiConfig: AIConfig;
  lastSaved: number;
}
