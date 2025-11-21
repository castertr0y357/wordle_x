import React from 'react';
import { cn } from "@/lib/utils";

const Tile = ({ letter, status, delay = 0 }) => {
  // Status: 'correct' | 'present' | 'absent' | 'empty' | 'typing'
  
  const baseClasses = "flex items-center justify-center text-3xl font-bold uppercase select-none transition-all duration-200";
  
  // Dynamic sizing based on grid needs, but usually handled by parent grid layout
  // We'll use w-full h-full and let parent control the cell size
  
  let statusClasses = "";
  let animationClass = "";

  if (status === 'correct') {
    statusClasses = "bg-tile-correct text-white border-tile-correct";
    animationClass = "animate-flip";
  } else if (status === 'present') {
    statusClasses = "bg-tile-present text-white border-tile-present";
    animationClass = "animate-flip";
  } else if (status === 'absent') {
    statusClasses = "bg-tile-absent text-white border-tile-absent";
    animationClass = "animate-flip";
  } else if (status === 'typing') {
    statusClasses = "border-primary text-foreground border-2 scale-105";
    animationClass = "animate-pop";
  } else {
    // Empty or just filled but not submitted
    statusClasses = "border-border text-foreground border-2 bg-background";
  }

  // If it has a letter but not submitted yet (and not typing specifically which is active state)
  if (letter && !status) {
     statusClasses = "border-border text-foreground border-2 bg-background";
     animationClass = "animate-pop";
  }

  return (
    <div 
      className={cn(
        baseClasses, 
        statusClasses, 
        animationClass,
        `delay-${delay}`
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {letter}
    </div>
  );
};

export default Tile;
