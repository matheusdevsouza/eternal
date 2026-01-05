export type BlockType = 'hero' | 'text' | 'image' | 'gallery' | 'video' | 'music' | 'divider' | 'button' | 'countdown';

export interface BlockStyle {
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  backgroundColor?: string;
  padding?: string;
  fontSize?: string;
  fontWeight?: string;
  borderRadius?: string;
  fontFamily?: string;
}

export interface BlockContent {
  text?: string;
  url?: string;
  images?: { url: string; caption?: string }[];
  caption?: string;
  link?: string;
  buttonText?: string;
  targetDate?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
  style: BlockStyle;
  order: number;
}

export interface GiftContent {
  blocks: Block[];
  settings: {
    theme: string;
    font: string;
    animation: string;
    globalStyles: {
        backgroundColor?: string;
        textColor?: string;
        primaryColor?: string;
    };
  };
}
