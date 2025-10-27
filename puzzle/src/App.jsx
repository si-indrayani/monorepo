
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
  const [score, setScore] = useState(0);
  const mazeRef = useRef(null);
  const timerRef = useRef();
  const scoringStrategy = useRef(null);

  // Detailed scoring state
  const [scoringBreakdown, setScoringBreakdown] = useState({
    baseScore: 0,
    timeBonus: 0,
    speedBonus: 0,
    multipliers: [],
    penalties: [],
    totalScore: 0
  });
  const [currentStreak, setCurrentStreak] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(1);

  // Initialize scoring strategy when component mounts
  useEffect(() => {
    if (window.CoreGaming && window.CoreGaming.BaseScoringStrategy) {
      // Dynamically create PuzzleScoringStrategy class
      const PuzzleScoringStrategy = class extends window.CoreGaming.BaseScoringStrategy {
        constructor() {
          super();
          this.scoringRules = {
            complete_puzzle: 100,
            time_bonus: 10,
            hint_used: -5,
            restart_penalty: -10,
            perfect_completion: 50,
            speed_bonus: 20
          };
          this.bonusMultipliers = {
            difficulty_bonus: 1.5,
            first_attempt: 1.2,
            no_hints: 1.3
          };
          this.penaltyRules = {
            time_penalty: 2,
            multiple_attempts: 5
          };
        }

        calculateScore(action, context = {}) {
          let baseScore = this.scoringRules[action] || 0;

          switch (action) {
            case 'complete_puzzle':
              baseScore = this.calculatePuzzleCompletionScore(context);
              break;
            case 'time_bonus':
              baseScore = this.calculatePuzzleTimeBonus(context);
              break;
            case 'speed_bonus':
              baseScore = this.calculatePuzzleSpeedBonus(context);
              break;
          }

          return Math.max(0, Math.floor(baseScore));
        }

        calculatePuzzleCompletionScore(context) {
          let score = this.scoringRules.complete_puzzle;
          if (context.difficulty === 'hard') {
            score = this.applyMultiplier(score, 'difficulty_bonus');
          }
          if (context.custom?.attemptNumber === 1) {
            score = this.applyMultiplier(score, 'first_attempt');
          }
          if (context.custom?.hintsUsed === 0) {
            score = this.applyMultiplier(score, 'no_hints');
          }
          if (context.custom?.attemptNumber === 1 && context.custom?.hintsUsed === 0) {
            score += this.scoringRules.perfect_completion;
          }
          return score;
        }

        calculatePuzzleTimeBonus(context) {
          if (!context.timeRemaining || !context.maxTime) return 0;
          const timeRatio = context.timeRemaining / context.maxTime;
          if (timeRatio > 0.5) {
            return this.scoringRules.time_bonus;
          }
          return 0;
        }

        calculatePuzzleSpeedBonus(context) {
          if (!context.actionSpeed) return 0;
          const speedScore = Math.max(0, 60 - context.actionSpeed);
          return Math.floor(speedScore * 0.5);
        }
      };

      scoringStrategy.current = new PuzzleScoringStrategy();
    }
  }, []);

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
    setAttempts(prev => prev + 1);
    setScoringBreakdown({
      baseScore: 0,
      timeBonus: 0,
      speedBonus: 0,
      multipliers: [],
      penalties: [],
      totalScore: 0
    });
  };

  const handleEnd = async () => {
    console.log('🏁 Ending puzzle game and making API call...');

    // Calculate final score using scoring strategy with detailed breakdown
    let finalScore = 0;
    let breakdown = {
      baseScore: 0,
      timeBonus: 0,
      speedBonus: 0,
      multipliers: [],
      penalties: [],
      totalScore: 0
    };

    if (scoringStrategy.current) {
      const context = {
        difficulty: 'medium',
        timeRemaining: Math.max(0, 300 - timer), // Assuming 5 minutes max time
        maxTime: 300,
        actionSpeed: timer,
        custom: {
          attemptNumber: attempts,
          hintsUsed: hintsUsed
        }
      };

      // Calculate completion score
      const completionScore = scoringStrategy.current.calculateScore('complete_puzzle', context);
      breakdown.baseScore = completionScore;

      // Calculate time bonus
      const timeBonus = scoringStrategy.current.calculateScore('time_bonus', context);
      breakdown.timeBonus = timeBonus;

      // Calculate speed bonus
      const speedBonus = scoringStrategy.current.calculateScore('speed_bonus', context);
      breakdown.speedBonus = speedBonus;

      // Track multipliers applied
      if (context.custom.attemptNumber === 1) {
        breakdown.multipliers.push('First Attempt Bonus (1.2x)');
      }
      if (context.custom.hintsUsed === 0) {
        breakdown.multipliers.push('No Hints Bonus (1.3x)');
      }
      if (context.difficulty === 'hard') {
        breakdown.multipliers.push('Difficulty Bonus (1.5x)');
      }

      // Track penalties
      if (context.custom.attemptNumber > 1) {
        breakdown.penalties.push(`Multiple Attempts (-${context.custom.attemptNumber * 5})`);
      }
      if (context.custom.hintsUsed > 0) {
        breakdown.penalties.push(`Hints Used (-${context.custom.hintsUsed * 5})`);
      }

      finalScore = completionScore + timeBonus + speedBonus;
      breakdown.totalScore = finalScore;
    } else {
      // Fallback scoring if strategy not available
      finalScore = gameOver ? Math.max(0, 1000 - timer * 10) : 0;
      breakdown.baseScore = finalScore;
      breakdown.totalScore = finalScore;
    }

    setScore(finalScore);
    setScoringBreakdown(breakdown);

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
          finalScore: finalScore,
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
      <div className="maze-score" style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50', margin: '10px 0' }}>
        Score: {score}
      </div>
      
      {/* Detailed Scoring Display */}
      {scoringBreakdown.totalScore > 0 && (
        <div className="scoring-breakdown" style={{ 
          background: 'rgba(76, 175, 80, 0.1)', 
          border: '1px solid #4CAF50', 
          borderRadius: '8px', 
          padding: '10px', 
          margin: '10px 0',
          fontSize: '14px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2E7D32' }}>🎯 Score Breakdown:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>🏆 Base Score: <strong>{scoringBreakdown.baseScore}</strong></div>
            <div>⏱️ Time Bonus: <strong>+{scoringBreakdown.timeBonus}</strong></div>
            <div>⚡ Speed Bonus: <strong>+{scoringBreakdown.speedBonus}</strong></div>
            <div>🔥 Current Streak: <strong>{currentStreak}</strong></div>
          </div>
          
          {scoringBreakdown.multipliers.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ color: '#FF9800', fontWeight: 'bold' }}>✨ Multipliers Applied:</div>
              {scoringBreakdown.multipliers.map((multiplier, idx) => (
                <div key={idx} style={{ fontSize: '12px', color: '#E65100' }}>• {multiplier}</div>
              ))}
            </div>
          )}
          
          {scoringBreakdown.penalties.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ color: '#F44336', fontWeight: 'bold' }}>⚠️ Penalties Applied:</div>
              {scoringBreakdown.penalties.map((penalty, idx) => (
                <div key={idx} style={{ fontSize: '12px', color: '#C62828' }}>• {penalty}</div>
              ))}
            </div>
          )}
          
          <div style={{ borderTop: '1px solid #4CAF50', marginTop: '8px', paddingTop: '8px', fontWeight: 'bold', color: '#2E7D32' }}>
            🏅 Total Score: {scoringBreakdown.totalScore}
          </div>
        </div>
      )}
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
