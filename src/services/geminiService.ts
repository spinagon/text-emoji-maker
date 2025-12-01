import { GenerationSettings, EmojiStyle } from "../types";

// Helper to determine colors based on settings
const getColorPalette = (theme: string) => {
  switch (theme) {
    case 'Vibrant Cyan': return { start: '#06b6d4', end: '#3b82f6', text: '#ecfeff', stroke: '#0e7490' };
    case 'Hot Pink': return { start: '#ec4899', end: '#a855f7', text: '#fdf2f8', stroke: '#831843' };
    case 'Gold': return { start: '#facc15', end: '#ca8a04', text: '#fefce8', stroke: '#713f12' };
    case 'White': return { start: '#ffffff', end: '#e2e8f0', text: '#ffffff', stroke: '#0f172a' };
    case 'Rainbow': return { start: '#ff0000', end: '#0000ff', text: '#ffffff', stroke: '#000000' };
    case 'Sunset': return { start: '#f97316', end: '#9333ea', text: '#fff7ed', stroke: '#431407' };
    case 'Forest': return { start: '#84cc16', end: '#166534', text: '#f0fdf4', stroke: '#14532d' };
    case 'Ocean': return { start: '#22d3ee', end: '#1e3a8a', text: '#ecfeff', stroke: '#164e63' };
    case 'Candy': return { start: '#f472b6', end: '#60a5fa', text: '#fff1f2', stroke: '#be185d' };
    case 'Vampire': return { start: '#ef4444', end: '#450a0a', text: '#fef2f2', stroke: '#450a0a' };
    case 'Midnight': return { start: '#818cf8', end: '#312e81', text: '#e0e7ff', stroke: '#1e1b4b' };
    default: // Light Pastel
      return { start: '#f9a8d4', end: '#818cf8', text: '#ffffff', stroke: '#4338ca' };
  }
};

// Internal render helper to apply styles per line without relying on SVG filters
const renderLine = (
  ctx: CanvasRenderingContext2D, 
  text: string, 
  x: number, 
  y: number, 
  style: EmojiStyle, 
  colors: { start: string, end: string, stroke: string },
  fillStyle: string | CanvasGradient,
  fontSize: number
) => {
  ctx.save();
  
  // -- Style Specific Rendering Logic --

  // 1. Shadow / Glow Setup
  if (style === 'neon' || style === 'cyber' || style === 'toxic') {
    ctx.shadowBlur = 10;
    ctx.shadowColor = style === 'toxic' ? '#39ff14' : colors.start;
  } else if (style === 'fire') {
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ea580c'; // Orange glow
    ctx.shadowOffsetY = -2;
  } else if (style === 'ice') {
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#0ea5e9'; // Blue glow
  } else if (style === 'horror') {
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#000000';
    ctx.shadowOffsetY = 2;
  } else if (style === 'bubbly' || style === 'fancy' || style === 'love') {
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  } else if (style === 'graffiti' || style === 'comic' || style === 'retro') {
    ctx.shadowBlur = 0;
    ctx.shadowColor = '#000000';
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
  } else if (style === 'pixel') {
    ctx.imageSmoothingEnabled = false;
  }

  // 2. Special Effects Draw Calls

  if (style === 'glitch') {
    // RGB Split Effect
    ctx.globalCompositeOperation = 'source-over';
    
    // Red Channel Offset
    ctx.fillStyle = '#ff0000';
    ctx.fillText(text, x - 2, y);
    
    // Blue Channel Offset
    ctx.fillStyle = '#00ffff';
    ctx.fillText(text, x + 2, y);
    
    // Main Text
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0; // Clear shadow for main text crispness
    ctx.fillText(text, x, y);

  } else {
    // Standard Draw Pipeline
    
    // Stroke (Outline)
    ctx.lineWidth = Math.max(2, fontSize * 0.08);
    ctx.strokeStyle = style === 'cyber' ? '#ffffff' : colors.stroke;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    
    // Cyber/Neon gets a double stroke for glow intensity
    if (style === 'cyber' || style === 'neon') {
       ctx.strokeText(text, x, y);
    }
    
    ctx.strokeText(text, x, y);

    // Fill
    ctx.fillStyle = fillStyle;
    ctx.fillText(text, x, y);
    
    // Extra shine for Metallic
    if (style === 'metallic') {
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillText(text, x, y - 1);
    }
  }

  ctx.restore();
};

export const generateEmojiImage = async (text: string, settings: GenerationSettings): Promise<string> => {
  if (!text) throw new Error("Text is required");

  const canvas = document.createElement('canvas');
  const size = 96;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not get canvas context");

  // Ensure font is loaded
  const fontFamily = settings.fontFamily || "'Inter', sans-serif";
  try {
    // Attempt to verify font load, but proceed even if check fails/times out
    await document.fonts.load(`900 20px ${fontFamily}`);
  } catch (e) {
    console.warn("Font loading check failed, attempting to render anyway", e);
  }

  const colors = getColorPalette(settings.textColor);
  const scale = settings.scale || 1.0;

  // Smart Wrapping
  const words = text.split(' ');
  let lines: string[] = [];

  if (words.length === 1) {
    if (text.length > 6) {
      const mid = Math.ceil(text.length / 2);
      lines = [text.slice(0, mid), text.slice(mid)];
    } else {
      lines = [text];
    }
  } else {
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      const nextWord = words[i];
      if ((currentLine.length + nextWord.length + 1) > 7) {
        lines.push(currentLine);
        currentLine = nextWord;
      } else {
        currentLine += " " + nextWord;
      }
    }
    lines.push(currentLine);
  }

  // Layout calculations
  const padding = 4;
  const usableW = size - (padding * 2);
  const usableH = size - (padding * 2);

  // Iteratively find best font size
  ctx.font = `900 10px ${fontFamily}`; 
  let fontSize = 100;
  let fits = false;

  // Reduced minimum font size to 4px to accommodate longer text
  while (fontSize > 4 && !fits) {
    ctx.font = `900 ${fontSize}px ${fontFamily}`;
    const lineHeight = fontSize * 0.9;
    const totalH = lines.length * lineHeight;
    
    const maxW = Math.max(...lines.map(line => ctx.measureText(line).width));

    // Looser constraints for bigger text feel
    if (maxW <= usableW && totalH <= usableH) {
      fits = true;
    } else {
      fontSize -= 2;
    }
  }
  
  // Apply user scale
  fontSize = fontSize * scale;
  
  // Apply final font
  ctx.font = `900 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Calculate vertical center
  const lineHeight = fontSize * 0.9;
  const totalTextHeight = lines.length * lineHeight;
  const startY = (size / 2) - (totalTextHeight / 2) + (lineHeight / 2); 

  // Prepare Gradient/Fill Style
  let fillStyle: string | CanvasGradient = colors.start;
  if (settings.textColor === 'Rainbow') {
    const gradient = ctx.createLinearGradient(0, 0, size, 0);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.2, "yellow");
    gradient.addColorStop(0.4, "lime");
    gradient.addColorStop(0.6, "cyan");
    gradient.addColorStop(0.8, "blue");
    gradient.addColorStop(1, "magenta");
    fillStyle = gradient;
  } else if (colors.start !== colors.end) {
    // Vertical gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, colors.start);
    gradient.addColorStop(1, colors.end);
    fillStyle = gradient;
  }

  // Clear Canvas
  ctx.clearRect(0, 0, size, size);

  // Render Loop
  lines.forEach((line, i) => {
    const y = startY + (i * lineHeight);
    renderLine(ctx, line, size / 2, y, settings.style, colors, fillStyle, fontSize);
  });

  return canvas.toDataURL('image/png');
};