import localforage from 'localforage';
import type { CanvasState, AIConfig } from '../types/canvas';

// 配置localforage
localforage.config({
  name: 'ai-context-canvas',
  storeName: 'canvas_data',
});

export class StorageService {
  private static readonly CANVAS_KEY = 'canvas_state';
  private static readonly AI_CONFIG_KEY = 'ai_config';

  // 保存画布状态
  static async saveCanvas(canvas: CanvasState): Promise<void> {
    try {
      await localforage.setItem(this.CANVAS_KEY, canvas);
    } catch (error) {
      console.error('保存画布状态失败:', error);
      throw new Error('保存失败，可能是存储空间不足');
    }
  }

  // 加载画布状态
  static async loadCanvas(): Promise<CanvasState | null> {
    try {
      const canvas = await localforage.getItem<CanvasState>(this.CANVAS_KEY);
      return canvas;
    } catch (error) {
      console.error('加载画布状态失败:', error);
      return null;
    }
  }

  // 保存AI配置
  static async saveAIConfig(config: AIConfig): Promise<void> {
    try {
      await localforage.setItem(this.AI_CONFIG_KEY, config);
    } catch (error) {
      console.error('保存AI配置失败:', error);
    }
  }

  // 加载AI配置
  static async loadAIConfig(): Promise<AIConfig | null> {
    try {
      const config = await localforage.getItem<AIConfig>(this.AI_CONFIG_KEY);
      return config;
    } catch (error) {
      console.error('加载AI配置失败:', error);
      return null;
    }
  }

  // 清空所有数据
  static async clearAll(): Promise<void> {
    try {
      await localforage.clear();
    } catch (error) {
      console.error('清空数据失败:', error);
    }
  }

  // 获取存储使用情况
  static async getStorageInfo(): Promise<{ used: number; quota: number } | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
        };
      } catch (error) {
        console.error('获取存储信息失败:', error);
      }
    }
    return null;
  }
}
