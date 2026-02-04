export interface CoupletData {
  upper: string; // 上联
  lower: string; // 下联
  horizontal: string; // 横批
}

export interface GeneratedImage {
  url: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING_TEXT = 'LOADING_TEXT',
  SUCCESS_TEXT = 'SUCCESS_TEXT',
  LOADING_IMAGE = 'LOADING_IMAGE',
  SUCCESS_IMAGE = 'SUCCESS_IMAGE',
  ERROR = 'ERROR'
}
