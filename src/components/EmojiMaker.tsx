import React, { useState, useEffect } from 'react';
import { Loader2, Wand2, Download, Trash2, History, Type, Palette, Scaling, Save } from 'lucide-react';
import { generateEmojiImage } from '../services/geminiService';
import { GeneratedEmoji, GenerationSettings, EmojiStyle } from '../types';

interface EmojiMakerProps {
  onEmojiGenerated: (emoji: GeneratedEmoji) => void;
  recentEmojis: GeneratedEmoji[];
  onDeleteEmoji: (id: string) => void;
}

const EmojiMaker: React.FC<EmojiMakerProps> = ({ onEmojiGenerated, recentEmojis, onDeleteEmoji }) => {
  const [text, setText] = useState('LOL');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<GenerationSettings>({
    textColor: 'Light Pastel',
    style: 'bubbly',
    fontFamily: "'Rubik Bubbles', cursive",
    scale: 1.0,
  });

  const fontOptions = [
    { name: 'Bubbly', value: "'Rubik Bubbles', cursive" },
    { name: 'Blocky', value: "'Bangers', cursive" },
    { name: 'Pixel', value: "'Press Start 2P', cursive" },
    { name: 'Graffiti', value: "'Permanent Marker', cursive" },
    { name: 'Tech', value: "'Orbitron', sans-serif" },
    { name: 'Wide Tech', value: "'Audiowide', cursive" },
    { name: 'Retro', value: "'Righteous', cursive" },
    { name: 'Glitch', value: "'Rubik Glitch', cursive" },
    { name: 'Horror', value: "'Nosifer', cursive" },
    { name: 'Creepy', value: "'Creepster', cursive" },
    { name: 'Elegant', value: "'Great Vibes', cursive" },
    { name: 'Standard', value: "'Inter', sans-serif" },
  ];

  // Real-time generation effect
  useEffect(() => {
    let isActive = true;
    const generate = async () => {
        if (!text.trim()) {
            setPreviewUrl(null);
            return;
        }
        
        setError(null);

        try {
            const url = await generateEmojiImage(text.trim(), settings);
            if (isActive) {
                setPreviewUrl(url);
            }
        } catch (err) {
            console.error("Preview generation failed", err);
            setError("Failed to generate preview");
        }
    };

    // Debounce slightly to keep UI smooth during slider dragging
    const timeoutId = setTimeout(generate, 50);

    return () => {
        isActive = false;
        clearTimeout(timeoutId);
    };
  }, [text, settings]);

  const handleSave = async () => {
    if (!text.trim() || !previewUrl) return;
    
    setIsSaving(true);
    try {
      // Simulate a small delay for feedback
      await new Promise(resolve => setTimeout(resolve, 300));

      const newEmoji: GeneratedEmoji = {
        id: crypto.randomUUID(),
        text: text,
        imageUrl: previewUrl,
        processedUrl: previewUrl,
        createdAt: Date.now(),
      };

      onEmojiGenerated(newEmoji);
    } catch (err) {
      setError("Failed to save emoji.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStyleChange = (style: EmojiStyle) => {
    setSettings({ ...settings, style });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-6xl mx-auto p-4">
      {/* Left Column: Controls & Preview */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Generator Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="bg-indigo-500 p-1.5 rounded-lg"><Wand2 className="w-5 h-5 text-white" /></span>
              Discord Emoji Gen
            </h1>
            <p className="text-slate-400 text-sm">Create custom text stickers. Instant & Client-side.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Text content
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value.toUpperCase())}
                placeholder="LOL, HYPE, LMAO"
                className="w-full bg-slate-900 border border-slate-700 text-white text-3xl font-bold tracking-wider rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-slate-600 text-center uppercase transition-all"
              />
              <div className="flex justify-between mt-2 px-1">
                 <span className="text-xs text-slate-500">
                    {text.length} chars
                 </span>
                 <span className="text-xs text-slate-500">Auto-wraps long text</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Style Preset */}
               <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Wand2 className="w-3 h-3" /> FX Style
                </label>
                <select
                  value={settings.style}
                  onChange={(e) => handleStyleChange(e.target.value as EmojiStyle)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="bubbly">Bubbly</option>
                  <option value="graffiti">Graffiti</option>
                  <option value="neon">Neon</option>
                  <option value="pixel">Pixel Art</option>
                  <option value="metallic">Metallic</option>
                  <option value="horror">Horror</option>
                  <option value="comic">Comic</option>
                  <option value="fancy">Fancy</option>
                  <option value="glitch">Glitch</option>
                  <option value="fire">Fire</option>
                  <option value="ice">Ice</option>
                  <option value="retro">Retro</option>
                  <option value="cyber">Cyber</option>
                  <option value="toxic">Toxic</option>
                  <option value="love">Love</option>
                </select>
               </div>

               {/* Font Family */}
               <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Type className="w-3 h-3" /> Font
                </label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {fontOptions.map((font) => (
                        <option key={font.value} value={font.value}>{font.name}</option>
                    ))}
                </select>
               </div>

               {/* Color Theme */}
               <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Palette className="w-3 h-3" /> Color Theme
                </label>
                <select
                  value={settings.textColor}
                  onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Light Pastel">Pastel (Pink/Blue)</option>
                  <option value="Vibrant Cyan">Cyan (Blue/Cyan)</option>
                  <option value="Hot Pink">Hot Pink (Pink/Purple)</option>
                  <option value="Gold">Gold (Yellow/Orange)</option>
                  <option value="White">Monochrome (White/Grey)</option>
                  <option value="Rainbow">Rainbow</option>
                  <option value="Sunset">Sunset</option>
                  <option value="Forest">Forest</option>
                  <option value="Ocean">Ocean</option>
                  <option value="Candy">Candy</option>
                  <option value="Vampire">Vampire</option>
                  <option value="Midnight">Midnight</option>
                </select>
               </div>

               {/* Size Slider */}
               <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Scaling className="w-3 h-3" /> Text Scale ({Math.round(settings.scale * 100)}%)
                </label>
                <div className="flex items-center gap-3 h-[46px]">
                    <span className="text-xs text-slate-500">Small</span>
                    <input 
                        type="range" 
                        min="0.5" 
                        max="2.0" 
                        step="0.05" 
                        value={settings.scale}
                        onChange={(e) => setSettings({...settings, scale: parseFloat(e.target.value)})}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                    />
                    <span className="text-xs text-slate-500">Big</span>
                </div>
               </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving || !text.trim() || !previewUrl}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2
                ${isSaving || !text.trim() || !previewUrl
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25'
                }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Saving...
                </>
              ) : (
                <>
                    <Save className="w-5 h-5" />
                    Save Emoji
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Preview */}
        {previewUrl && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold text-white mb-4">Live Preview</h2>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
              {/* Large View */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-32 h-32 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-slate-700 rounded-lg flex items-center justify-center border-2 border-slate-600 overflow-hidden relative shadow-inner">
                   {/* Checkerboard background for transparency check */}
                   <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}></div>
                   <img src={previewUrl} alt="Preview" className="w-24 h-24 object-contain relative z-10 transition-all duration-75" />
                </div>
                <span className="text-xs text-slate-500">Actual Size (96px)</span>
              </div>

              {/* Context View (Discord Dark Mode) */}
              <div className="flex-1 w-full sm:w-auto bg-[#36393f] rounded-lg p-4 flex items-start gap-3 border border-slate-900 shadow-inner">
                 <div className="w-10 h-10 rounded-full bg-indigo-500 flex-shrink-0"></div>
                 <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                        <span className="text-white font-medium text-sm">User</span>
                        <span className="text-xs text-slate-400">Today at 4:20 PM</span>
                    </div>
                    <div className="text-slate-300 text-sm mt-1 flex items-center gap-1 flex-wrap">
                        Here is the new emoji! 
                        <img src={previewUrl} alt="emoji" className="w-6 h-6 inline-block align-bottom" />
                    </div>
                 </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    onClick={() => handleDownload(previewUrl, `${text}_emoji.png`)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-green-900/20"
                >
                    <Download className="w-4 h-4" />
                    Download PNG (96x96)
                </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: History */}
      <div className="lg:col-span-5 space-y-4">
         <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                <History className="w-4 h-4" />
                Recent Emojis
            </h3>
            <span className="text-xs text-slate-500">{recentEmojis.length} saved</span>
         </div>
         
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recentEmojis.map((emoji) => (
                <div key={emoji.id} className="group relative bg-slate-800 rounded-xl p-3 border border-slate-700 hover:border-indigo-500 transition-all">
                    <div className="aspect-square bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-slate-900/50 rounded-lg flex items-center justify-center mb-2 overflow-hidden relative">
                         {/* Mini checkerboard */}
                         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '10px 10px' }}></div>
                        <img src={emoji.processedUrl} alt={emoji.text} className="w-16 h-16 object-contain relative z-10" />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 truncate max-w-[60px]">{emoji.text}</span>
                        <div className="flex gap-1">
                             <button
                                onClick={() => handleDownload(emoji.processedUrl, `${emoji.text}.png`)}
                                className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-400/10 rounded transition-colors"
                                title="Download"
                             >
                                <Download className="w-3.5 h-3.5" />
                             </button>
                             <button
                                onClick={() => onDeleteEmoji(emoji.id)}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                title="Delete"
                             >
                                <Trash2 className="w-3.5 h-3.5" />
                             </button>
                        </div>
                    </div>
                </div>
            ))}

            {recentEmojis.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                    <p>No emojis saved yet.</p>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default EmojiMaker;