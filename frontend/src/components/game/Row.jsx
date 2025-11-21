import React from 'react';
import Tile from './Tile';
import { cn } from "@/lib/utils";

const Row = ({ guess, wordLength, solution, isCurrentRow, isCompleted, isInvalid }) => {
  const tiles = [];

  // If it's a completed row, we need to compute colors
  // If it's current row, we show what's typed so far
  // If it's empty, we show empty slots

  const checkGuess = (guess, solution) => {
    const guessChars = guess.split('');
    const solutionChars = solution.split('');
    const statuses = Array(wordLength).fill('absent');
    
    // Count frequencies in solution to handle duplicates correctly
    const solutionCounts = {};
    solutionChars.forEach(char => {
      solutionCounts[char] = (solutionCounts[char] || 0) + 1;
    });

    // First pass: Find greens (correct)
    guessChars.forEach((char, i) => {
      if (char === solutionChars[i]) {
        statuses[i] = 'correct';
        solutionCounts[char]--;
      }
    });

    // Second pass: Find yellows (present)
    guessChars.forEach((char, i) => {
      if (statuses[i] !== 'correct') {
        if (solutionCounts[char] > 0) {
          statuses[i] = 'present';
          solutionCounts[char]--;
        }
      }
    });

    return statuses;
  };

  let statuses = Array(wordLength).fill(null);
  if (isCompleted) {
    statuses = checkGuess(guess, solution);
  }

  for (let i = 0; i < wordLength; i++) {
    const letter = guess[i] || '';
    let status = null;
    
    if (isCompleted) {
      status = statuses[i];
    } else if (isCurrentRow && letter) {
      status = 'typing'; 
    }

    tiles.push(
      <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
        <Tile 
          letter={letter} 
          status={status} 
          delay={isCompleted ? i * 100 : 0}
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "flex gap-1.5 justify-center mb-1.5",
      isInvalid && "animate-shake"
    )}>
      {tiles}
    </div>
  );
};

export default Row;
