import React from 'react';
import GameContainer from './components/game/GameContainer';
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <GameContainer />
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
