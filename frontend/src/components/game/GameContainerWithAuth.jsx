import React, { useState, useEffect, useCallback } from 'react';
import Grid from './Grid';
import Keyboard from './Keyboard';
import { getRandomWord, isValidWord } from '@/lib/words';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RefreshCw, User } from 'lucide-react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const GameContainerWithAuth = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [wordLength, setWordLength] = useState(5);
  const [solution, setSolution] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing');
  const [isInvalidShake, setIsInvalidShake] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [stats, setStats] = useState({ played: 0, won: 0, streak: 0 });
  const [userStats, setUserStats] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Load saved session if authenticated
  useEffect(() => {
    if (isAuthenticated && !sessionLoaded) {
      loadGameSession();
    } else if (!isAuthenticated && !sessionLoaded) {
      startNewGame();
      setSessionLoaded(true);
    }
  }, [isAuthenticated]);

  const loadGameSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/game/session`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const session = await response.json();
        if (session) {
          // Load existing session
          setWordLength(session.word_length);
          setSolution(session.solution);
          setGuesses(session.guesses || []);
          setCurrentGuess(session.current_guess || '');
          setGameStatus(session.game_status);
          console.log('Loaded saved session:', session);
        } else {
          startNewGame();
        }
      } else {
        startNewGame();
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      startNewGame();
    } finally {
      setSessionLoaded(true);
    }
  };

  const saveGameSession = useCallback(async (sessionData) => {
    if (!isAuthenticated) return;

    try {
      await fetch(`${API_URL}/api/game/session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, [isAuthenticated, token]);

  const updateGameSession = useCallback(async (guesses, currentGuess, gameStatus) => {
    if (!isAuthenticated) return;

    try {
      await fetch(`${API_URL}/api/game/session`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          guesses,
          current_guess: currentGuess,
          game_status: gameStatus
        })
      });
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  }, [isAuthenticated, token]);

  const recordGameCompletion = async (won, numGuesses) => {
    if (!isAuthenticated) return;

    try {
      await fetch(`${API_URL}/api/game/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          word_length: wordLength,
          won,
          num_guesses: numGuesses
        })
      });
    } catch (error) {
      console.error('Failed to record game completion:', error);
    }
  };

  const startNewGame = () => {
    const newLength = Math.floor(Math.random() * (8 - 5 + 1)) + 5;
    const newWord = getRandomWord(newLength);
    setWordLength(newLength);
    setSolution(newWord);
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setShowModal(false);
    console.log(`New Game: Length ${newLength}, Word: ${newWord}`);

    // Save new session if authenticated
    if (isAuthenticated) {
      saveGameSession({
        word_length: newLength,
        solution: newWord,
        guesses: [],
        current_guess: '',
        game_status: 'playing'
      });
    }
  };

  const handleKey = (key) => {
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      if (currentGuess.length !== wordLength) {
        toast.warning("Not enough letters");
        setIsInvalidShake(true);
        setTimeout(() => setIsInvalidShake(false), 600);
        return;
      }
      if (guesses.includes(currentGuess)) {
        toast.warning("Already guessed");
        setIsInvalidShake(true);
        setTimeout(() => setIsInvalidShake(false), 600);
        return;
      }
      if (!isValidWord(currentGuess)) {
        toast.error("Not in word list");
        setIsInvalidShake(true);
        setTimeout(() => setIsInvalidShake(false), 600);
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      if (currentGuess === solution) {
        setGameStatus('won');
        setStats(s => ({ ...s, played: s.played + 1, won: s.won + 1, streak: s.streak + 1 }));
        toast.success("Splendid! You found the word!", { duration: 3000 });
        setTimeout(() => setShowModal(true), 1500);
        
        // Record completion
        if (isAuthenticated) {
          recordGameCompletion(true, newGuesses.length);
        }
      } else {
        const maxGuesses = wordLength > 6 ? 7 : 6;
        if (newGuesses.length >= maxGuesses) {
          setGameStatus('lost');
          setStats(s => ({ ...s, played: s.played + 1, streak: 0 }));
          toast.error(`Game Over! The word was ${solution}`);
          setTimeout(() => setShowModal(true), 1500);
          
          // Record completion
          if (isAuthenticated) {
            recordGameCompletion(false, newGuesses.length);
          }
        } else {
          // Save progress
          if (isAuthenticated) {
            updateGameSession(newGuesses, '', 'playing');
          }
        }
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else {
      if (currentGuess.length < wordLength) {
        setCurrentGuess(prev => prev + key);
      }
    }
  };

  const usedKeys = {};
  guesses.forEach(guess => {
    guess.split('').forEach((char, i) => {
      if (solution[i] === char) {
        usedKeys[char] = 'correct';
      } else if (solution.includes(char)) {
        if (usedKeys[char] !== 'correct') {
          usedKeys[char] = 'present';
        }
      } else {
        if (usedKeys[char] !== 'correct' && usedKeys[char] !== 'present') {
          usedKeys[char] = 'absent';
        }
      }
    });
  });

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
            W
          </div>
          <h1 className="text-xl font-heading font-bold tracking-tight">Wordle<span className="text-primary">X</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex px-3 py-1 bg-muted rounded-full text-xs font-medium">
            {wordLength} Letters
          </div>
          {isAuthenticated ? (
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} title="Profile">
              <User className="w-5 h-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={startNewGame} title="New Game">
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 overflow-y-auto py-4 min-h-0">
        <Grid 
          guesses={guesses}
          currentGuess={currentGuess}
          solution={solution}
          wordLength={wordLength}
          isInvalidShake={isInvalidShake}
        />
      </div>

      {/* Keyboard Area */}
      <div className="p-2 pb-6 bg-background border-t border-border/40">
        <Keyboard onKey={handleKey} usedKeys={usedKeys} />
      </div>

      {/* Game Over / Win Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-heading">
              {gameStatus === 'won' ? '🎉 Victory!' : '😔 Game Over'}
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              {gameStatus === 'won' 
                ? `You found "${solution}" in ${guesses.length} guesses.` 
                : `The word was "${solution}". Better luck next time!`}
            </DialogDescription>
          </DialogHeader>
          
          {!isAuthenticated && (
            <div className="py-4 px-6 bg-muted/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Sign in to track your progress and compete with others!
              </p>
              <Button size="sm" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
          )}

          <DialogFooter className="sm:justify-center">
            <Button onClick={startNewGame} className="w-full sm:w-auto" size="lg">
              Play Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameContainerWithAuth;
