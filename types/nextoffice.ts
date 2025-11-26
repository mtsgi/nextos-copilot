// NextOffice Suite Type Definitions

// Document Editor Types
export interface DocumentFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

export interface DocumentTemplate {
  id: string;
  name: string;
  content: string;
  thumbnail?: string;
}

// Spreadsheet Types
export interface CellData {
  value: string | number;
  formula?: string;
  format?: CellFormat;
}

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  backgroundColor?: string;
  numberFormat?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface SpreadsheetCell {
  row: number;
  col: number;
  data: CellData;
}

export interface Sheet {
  id: string;
  name: string;
  cells: Map<string, CellData>;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter';
  dataRange: string;
  title: string;
}

// Presentation Types
export interface Slide {
  id: string;
  order: number;
  title: string;
  content: SlideElement[];
  background?: string;
  transition?: 'none' | 'fade' | 'slide';
}

export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  position: { x: number; y: number };
  size: { width: number; height: number };
  content?: string;
  style?: Record<string, string>;
}

export interface PresentationTemplate {
  id: string;
  name: string;
  slides: Slide[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

// Common Types
export interface ExportOptions {
  format: 'pdf' | 'docx' | 'xlsx' | 'csv' | 'pptx';
  fileName: string;
}

export interface CollaborationState {
  isEnabled: boolean;
  users: CollaborativeUser[];
  changes: Change[];
}

export interface CollaborativeUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

export interface Change {
  id: string;
  userId: string;
  timestamp: Date;
  type: string;
  data: unknown;
}
