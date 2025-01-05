export interface Question {
  id: number;
  type: 'text' | 'draw' | 'paint' | 'drag' | 'click';
  question: string;
  options?: string[];
  correctAnswer: string;
  audioUrl?: string;
}

export interface DrawingTools {
  brush: number;
  color: string;
  eraser: boolean;
}

export interface PaintingTools {
  brush: number;
  colors: string[];
  fill: boolean;
} 