import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GameContainer from './components/game/GameContainer';
import DebugPage from './DebugPage';
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GameContainer />} />
          <Route path="/debug" element={<DebugPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
