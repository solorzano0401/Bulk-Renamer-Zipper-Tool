export interface FileData {
  file: File;
  previewUrl: string;
  extension: string;
}

export interface RenameJob {
  originalFile: File;
  targetNames: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING_ZIP = 'PROCESSING_ZIP',
  GENERATING_NAMES = 'GENERATING_NAMES',
}
