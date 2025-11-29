export interface GeneratedEmoji {
  id: string;
  text: string;
  imageUrl: string; // The original full-res image (or SVG data URI)
  processedUrl: string; // The 96x96 processed image
  createdAt: number;
}

export type EmojiStyle = 
  | 'bubbly' | 'graffiti' | 'neon' | 'pixel' 
  | 'metallic' | 'horror' | 'comic' | 'fancy' 
  | 'glitch' | 'fire' | 'ice' | 'retro' 
  | 'cyber' | 'toxic' | 'love';

export interface GenerationSettings {
  textColor: string;
  style: EmojiStyle;
  fontFamily: string;
  scale: number;
}