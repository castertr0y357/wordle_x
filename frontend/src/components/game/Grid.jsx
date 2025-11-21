import React from 'react';
import Row from './Row';

const Grid = ({ guesses, currentGuess, solution, wordLength, turn, isInvalidShake }) => {
  // Standard Wordle is 6 guesses usually. 
  // For 8 letters maybe give 7 guesses? Let's stick to 6 for challenge or dynamic.
  // Let's do 6 guesses for 5-6 letters, 7 guesses for 7-8 letters.
  const maxGuesses = wordLength > 6 ? 7 : 6;
  
  const empties = Array(Math.max(0, maxGuesses - 1 - guesses.length)).fill('');

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {guesses.map((g, i) => (
        <Row 
          key={i} 
          guess={g} 
          wordLength={wordLength} 
          solution={solution} 
          isCompleted={true}
          isCurrentRow={false}
        />
      ))}
      
      {guesses.length < maxGuesses && (
        <Row 
          guess={currentGuess} 
          wordLength={wordLength} 
          solution={solution} 
          isCurrentRow={true}
          isCompleted={false}
          isInvalid={isInvalidShake}
        />
      )}

      {empties.map((_, i) => (
        <Row 
          key={`empty-${i}`} 
          guess="" 
          wordLength={wordLength} 
          solution={solution} 
          isCurrentRow={false}
          isCompleted={false}
        />
      ))}
    </div>
  );
};

export default Grid;
