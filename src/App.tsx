import React, { useState, useEffect } from 'react';
import EmojiMaker from './components/EmojiMaker';
import { GeneratedEmoji } from './types';

function App() {
  const [recentEmojis, setRecentEmojis] = useState<GeneratedEmoji[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('discord-emojis');
      if (saved) {
        setRecentEmojis(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load emojis", e);
    }
  }, []);

  // Save to local storage whenever list changes
  useEffect(() => {
    localStorage.setItem('discord-emojis', JSON.stringify(recentEmojis));
  }, [recentEmojis]);

  const handleEmojiGenerated = (newEmoji: GeneratedEmoji) => {
    setRecentEmojis(prev => [newEmoji, ...prev]);
  };

  const handleDeleteEmoji = (id: string) => {
    setRecentEmojis(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 text-slate-50 font-sans selection:bg-indigo-500/30">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                DE
             </div>
             <span className="font-bold text-lg tracking-tight">Discord Emoji Gen</span>
           </div>
           <a href="https://discord.com" target="_blank" rel="noreferrer" className="text-xs font-medium text-slate-500 hover:text-indigo-400 transition-colors">
              Optimized for Discord
           </a>
        </div>
      </header>

      <main className="py-8">
        <EmojiMaker 
            onEmojiGenerated={handleEmojiGenerated} 
            recentEmojis={recentEmojis} 
            onDeleteEmoji={handleDeleteEmoji}
        />
      </main>

      <footer className="border-t border-slate-800 mt-12 py-8 text-center text-slate-600 text-sm">
        <p>Pure Client-side Generation • Free & Private</p>
      </footer>
    </div>
  );
}

export default App;