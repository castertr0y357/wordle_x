import React, { useEffect } from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';
import { cn } from "@/lib/utils";

const Keyboard = ({ onKey, usedKeys }) => {
  // usedKeys: { 'A': 'correct', 'B': 'present', 'C': 'absent' }

  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        onKey('ENTER');
      } else if (e.key === 'Backspace') {
        onKey('BACKSPACE');
      } else {
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) {
          onKey(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKey]);

  const getKeyClass = (key) => {
    const status = usedKeys[key];
    const base = "flex items-center justify-center rounded-md font-bold text-sm sm:text-base transition-colors duration-150 cursor-pointer select-none h-14";
    
    if (key === 'ENTER' || key === 'BACKSPACE') {
      return cn(base, "bg-muted text-foreground hover:bg-muted/80 px-2 sm:px-4 text-xs sm:text-sm");
    }

    if (status === 'correct') return cn(base, "bg-tile-correct text-white hover:bg-tile-correct/90 flex-1");
    if (status === 'present') return cn(base, "bg-tile-present text-white hover:bg-tile-present/90 flex-1");
    if (status === 'absent') return cn(base, "bg-tile-absent text-white hover:bg-tile-absent/90 flex-1");
    
    return cn(base, "bg-muted text-foreground hover:bg-muted/80 flex-1");
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-2 gap-2 flex flex-col">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-1.5 justify-center w-full">
          {row.map((key) => (
            <div 
              key={key} 
              onClick={() => onKey(key)}
              className={getKeyClass(key)}
              style={{ minWidth: key.length > 1 ? 'auto' : '2rem' }}
            >
              {key === 'BACKSPACE' ? <Delete className="w-5 h-5" /> : key === 'ENTER' ? 'ENTER' : key}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
