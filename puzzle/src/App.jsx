
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// 0 = open, 1 = wall
const MAZE = [
  [0, 1, 0, 0, 0],
  [0, 1, 0, 1, 0],
  [0, 0, 0, 1, 0],
  [1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0],
];
const START = { row: 0, col: 0 };
const EXIT = { row: 4, col: 4 };

function App({ gameInstance }) {
  const [player, setPlayer] = useState(START);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const mazeRef = useRef(null);
  const timerRef = useRef();

  useEffect(() => {
    mazeRef.current && mazeRef.current.focus();
  }, []);

  useEffect(() => {
    if (running && !gameOver && !paused) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running, gameOver, paused]);

  useEffect(() => {
    if (player.row === EXIT.row && player.col === EXIT.col) {
      setGameOver(true);
      setRunning(false);
      // Timer will stop automatically due to gameOver state
    }
  }, [player]);

  useEffect(() => {
    if (gameOver) {
      // Automatically call end API when game is completed
      handleEnd();
    }
  }, [gameOver]);

  const move = (dr, dc) => {
    if (gameOver || paused) return;
    const newRow = player.row + dr;
    const newCol = player.col + dc;
    if (
      newRow >= 0 &&
      newRow < MAZE.length &&
      newCol >= 0 &&
      newCol < MAZE[0].length &&
      MAZE[newRow][newCol] === 0
    ) {
      if (!running && timer === 0) setRunning(true);
      setPlayer({ row: newRow, col: newCol });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') move(-1, 0);
    else if (e.key === 'ArrowDown') move(1, 0);
    else if (e.key === 'ArrowLeft') move(0, -1);
    else if (e.key === 'ArrowRight') move(0, 1);
  };

  const handleStart = async () => {
    console.log('🚀 Starting puzzle game and making API call...');

    // Make API call to track game start
    try {
      console.log('📡 Making API request to track puzzle game start...');
      const payload = {
        tenantId: "TENANT_ID",
        playerId: "player_12345",
        eventType: "game_play_start",
        occurredAt: new Date().toISOString(),
        sessionId: "session_abc123",
        appVersion: "1.2.3",
        locale: "en_US",
        region: "NA",
        consentState: "granted",
        schemaVersion: "1.0",
        eventData: {
          gameId: "GAME_ID",
          miniGameType: "puzzle",
          difficulty: "medium",
          levelId: "level_5",
          gameMode: "single_player",
          category: "NFL Trivia"
        }
      };

      console.log('📦 Request payload:', JSON.stringify(payload, null, 2));

      const response = await fetch('https://secure-lacewing-sweeping.ngrok-free.app/api/events', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic YWRtaW46Z2FtaW5nMTIz',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Puzzle game start event tracked successfully:', responseData);
      } else {
        const errorText = await response.text();
        console.warn('⚠️ Failed to track puzzle game start event:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error tracking puzzle game start event:', error);
      console.error('❌ Error details:', error.message, error.stack);
    }

    if (gameInstance) gameInstance.start();
    setRunning(true);
    setPaused(false);
  };

  const handlePause = () => {
    if (gameInstance) gameInstance.pause();
    setPaused(true);
  };

  const handleResume = () => {
    if (gameInstance) gameInstance.resume();
    setPaused(false);
  };

  const handleRestart = () => {
    if (gameInstance) gameInstance.restart();
    setPlayer(START);
    setGameOver(false);
    setTimer(0);
    setRunning(false);
    setPaused(false);
  };

  const handleEnd = async () => {
    console.log('🏁 Ending puzzle game and making API call...');

    // Make API call to track game end
    try {
      console.log('📡 Making API request to track puzzle game end...');
      const payload = {
        tenantId: "TENANT_ID",
        playerId: "player_12345",
        eventType: "game_play_end",
        occurredAt: new Date().toISOString(),
        sessionId: "session_abc123",
        appVersion: "1.2.3",
        locale: "en_US",
        region: "NA",
        consentState: "granted",
        schemaVersion: "1.0",
        eventData: {
          gameId: "GAME_ID",
          miniGameType: "puzzle",
          duration: timer * 1000, // Convert seconds to milliseconds
          finalScore: gameOver ? Math.max(0, 1000 - timer * 10) : 0, // Simple scoring based on time
          completionStatus: gameOver ? "completed" : "abandoned",
          questionsAttempted: 0, // Not applicable for puzzle
          questionsCorrect: 0, // Not applicable for puzzle
          streakCount: 0, // Not applicable for puzzle
          powerUpsUsed: 0 // Not applicable for puzzle
        }
      };

      console.log('📦 End puzzle game request payload:', JSON.stringify(payload, null, 2));

      const response = await fetch('https://secure-lacewing-sweeping.ngrok-free.app/api/events', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic YWRtaW46Z2FtaW5nMTIz',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 End puzzle game response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Puzzle game end event tracked successfully:', responseData);
      } else {
        const errorText = await response.text();
        console.warn('⚠️ Failed to track puzzle game end event:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error tracking puzzle game end event:', error);
      console.error('❌ Error details:', error.message, error.stack);
    }

    if (gameInstance) gameInstance.end();
    setRunning(false);
    setPaused(false);
  };

  return (
    <div className="maze-container">
      <h1>Maze Puzzle</h1>
      <div className="game-controls" style={{ textAlign: 'center', margin: '10px 0' }}>
        {!running && !gameOver && (
          <button 
            onClick={handleStart} 
            style={{ 
              fontSize: '24px', 
              padding: '10px 20px', 
              border: 'none', 
              borderRadius: '50%', 
              background: '#4CAF50', 
              color: 'white', 
              cursor: 'pointer' 
            }}
            title="Start Game"
          >
            ▶️
          </button>
        )}
      </div>
      <div className="maze-timer">Time: {timer}s {paused ? '(Paused)' : ''}</div>
      <div
        className="maze-grid"
        tabIndex={0}
        ref={mazeRef}
        onKeyDown={handleKeyDown}
        style={{ outline: 'none' }}
      >
        {MAZE.map((row, rIdx) => (
          <div className="maze-row" key={rIdx}>
            {row.map((cell, cIdx) => {
              let content = '';
              if (player.row === rIdx && player.col === cIdx) content = '🧑';
              else if (EXIT.row === rIdx && EXIT.col === cIdx) content = '🚩';
              return (
                <div
                  className={`maze-cell${cell === 1 ? ' wall' : ''}`}
                  key={cIdx}
                >
                  {content}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ margin: '16px 0', textAlign: 'center' }}>
        <button onClick={() => move(-1, 0)} disabled={paused || gameOver}>Up</button>
        <button onClick={() => move(1, 0)} disabled={paused || gameOver}>Down</button>
        <button onClick={() => move(0, -1)} disabled={paused || gameOver}>Left</button>
        <button onClick={() => move(0, 1)} disabled={paused || gameOver}>Right</button>
      </div>
      {gameOver && <div className="puzzle-solved" style={{textAlign: 'center', margin: '20px 0'}}>🎉 You reached the exit in {timer} seconds!</div>}
    </div>
  );
}

export default App;
