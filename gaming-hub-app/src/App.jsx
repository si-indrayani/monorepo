import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [selectedTenant, setSelectedTenant] = useState('')
  const [selectedGame, setSelectedGame] = useState('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [tenants, setTenants] = useState({})
  const [loading, setLoading] = useState(true)
  const [coreSDKLoaded, setCoreSDKLoaded] = useState(false)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('gaming_token') || null)
  const [loginName, setLoginName] = useState('')
  const [showStats, setShowStats] = useState(false)
  const [userStats, setUserStats] = useState(null)

  // Load tenant configuration from JSON file
  useEffect(() => {
    const loadTenantConfig = async () => {
      try {
        const response = await fetch('/tenant-games.json')
        const config = await response.json()
        setTenants(config.tenants)
        setLoading(false)
      } catch (error) {
        console.error('Failed to load tenant configuration:', error)
        // Fallback configuration
        setTenants({
          'NFL': {
            tenantId: "NFL_TENANT",
            name: "NFL Gaming Hub",
            games: [
              { id: "trivia", name: "NFL Trivia", displayName: "NFL Trivia", emoji: "🏈", category: "NFL Trivia", difficulty: "medium", gameMode: "single_player", enabled: true },
              { id: "puzzle", name: "NFL Puzzle", displayName: "NFL Puzzle", emoji: "🧩", category: "NFL Puzzle", difficulty: "medium", gameMode: "single_player", enabled: true }
            ]
          }
        })
        setLoading(false)
      }
    }
    loadTenantConfig()
  }, [])

  // Load Core Gaming SDK from S3
  useEffect(() => {
    const loadCoreSDK = async () => {
      try {
        // Check if SDK is already loaded (from a previous session)
        if (window.CoreGaming && window.CoreGaming.GameSelector) {
          console.log('🎮 Core Gaming SDK already loaded from previous session')
          setCoreSDKLoaded(true)
          return
        }

        // Load the core gaming SDK script from S3 with cache busting
        const script = document.createElement('script')
        const timestamp = Date.now()
        script.src = `/s3-proxy/core-gaming-sdk/index.global.js?v=${timestamp}`
        console.log('🎮 Loading Core Gaming SDK from:', script.src)

        // Create a promise to handle the loading
        const loadPromise = new Promise((resolve, reject) => {
          script.onload = () => {
            console.log('🎮 Core Gaming SDK script loaded successfully')

            // Wait for global variables to be set up
            const checkGlobals = (attempt = 1, maxAttempts = 10) => {
              if (window.CoreGaming && window.CoreGaming.GameSelector) {
                console.log('🎮 Core Gaming SDK global variables available after', attempt, 'attempts')
                resolve(true)
                return
              }

              if (attempt >= maxAttempts) {
                console.error('❌ Core Gaming SDK failed to initialize global variables after', maxAttempts, 'attempts')
                reject(new Error('Global variables not set'))
                return
              }

              // Wait 100ms and try again
              setTimeout(() => checkGlobals(attempt + 1, maxAttempts), 100)
            }

            checkGlobals()
          }

          script.onerror = (error) => {
            console.error('❌ Failed to load Core Gaming SDK script:', error)
            reject(error)
          }
        })

        document.head.appendChild(script)

        // Wait for the loading to complete
        await loadPromise
        setCoreSDKLoaded(true)
        console.log('🎮 Core Gaming SDK fully loaded and ready')

        // If user is logged in, expose to window for SDK
        if (token && loginName) {
          window.currentUserId = loginName
        } else if (token && !window.currentUserId && localStorage.getItem('gaming_user')) {
          window.currentUserId = JSON.parse(localStorage.getItem('gaming_user')).username
        }

      } catch (error) {
        console.error('❌ Error loading Core Gaming SDK:', error)
        // Don't set coreSDKLoaded to true if loading failed
      }
    }

    if (!loading) {
      loadCoreSDK()
    }
  }, [loading])

  // Mouse tracking for 3D parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Load user stats from SessionManager
  const loadUserStats = () => {
    console.log('🔍 Loading user stats for:', user?.username);
    console.log('🔍 CoreGaming available:', !!window.CoreGaming);
    console.log('🔍 SessionManager available:', !!window.CoreGaming?.SessionManager);
    
    if (!user || !window.CoreGaming?.SessionManager) {
      console.warn('❌ Cannot load stats - user or SessionManager not available');
      return;
    }
    
    try {
      console.log('✅ Creating SessionManager instance...');
      const sessionManager = new window.CoreGaming.SessionManager(user.username);
      console.log('✅ Getting user stats...');
      const stats = sessionManager.getUserStats();
      console.log('✅ User stats loaded:', stats);
      setUserStats(stats);
    } catch (error) {
      console.error('❌ Failed to load user stats:', error);
      console.error('❌ Error details:', error.message, error.stack);
      setUserStats(null);
    }
  }

  // Load stats when user logs in
  useEffect(() => {
    if (user && coreSDKLoaded) {
      loadUserStats();
    }
  }, [user, coreSDKLoaded])

  const handleTenantChange = (tenantId) => {
    setSelectedTenant(tenantId)
    setSelectedGame('')
  }

  const handleGameSelect = async (gameId) => {
    if (!coreSDKLoaded) {
      console.error('❌ Core Gaming SDK not loaded yet')
      alert('Gaming SDK is still loading. Please try again in a moment.')
      return
    }

    setSelectedGame(gameId)

    const tenant = tenants[selectedTenant]
    const game = tenant.games.find(g => g.id === gameId)

    try {
      // Track game selection event
      const payload = {
        tenantId: tenant.tenantId,
        playerId: "player_12345",
        eventType: "game_selected",
        occurredAt: new Date().toISOString(),
        sessionId: "session_" + Date.now(),
        appVersion: "1.0.0",
        locale: "en_US",
        region: "NA",
        consentState: "granted",
        schemaVersion: "1.0",
        eventData: {
          gameId: gameId,
          gameName: game.displayName,
          tenantName: tenant.name,
          difficulty: game.difficulty,
          category: game.category
        }
      }

      console.log('🎮 Tracking game selection:', payload)

      // Create game object for Core SDK
      const gameForSDK = {
        name: game.id,
        displayName: game.displayName,
        emoji: game.emoji,
        category: game.category,
        difficulty: game.difficulty,
        gameMode: game.gameMode,
        tenantId: tenant.tenantId,
        tenantName: tenant.name
      }

      // Initialize GameSelector with the selected game
      if (window.CoreGaming && window.CoreGaming.GameSelector) {
        console.log('🚀 Initializing GameSelector with game:', gameForSDK)

        // Store game data for the SDK to use BEFORE creating GameSelector
        window.selectedGameData = gameForSDK

        // Clear current content and initialize GameSelector
        const container = document.getElementById('gaming-hub-container')
        if (container) {
          container.innerHTML = '<div id="game-selector-container" style="width: 100%; height: 100vh;"></div>'
          const gameSelector = new window.CoreGaming.GameSelector('game-selector-container')
        }
      } else {
        console.error('❌ GameSelector not available in Core SDK')
        alert('Game loading system is not available. Please try again.')
      }

    } catch (error) {
      console.error('❌ Error selecting game:', error)
      alert('Failed to load game. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="gaming-hub loading">
        <div className="loading-spinner"></div>
        <h2>Loading Gaming Hub...</h2>
      </div>
    )
  }

  return (
    <div id="gaming-hub-container">
      <div
        className="gaming-hub"
        style={{
          transform: `perspective(1000px) rotateX(${mousePosition.y * 0.02}deg) rotateY(${mousePosition.x * 0.02}deg)`
        }}
      >
        <header className="hub-header">
          <h1>🎮 Gaming Hub</h1>
          <p>Select your gaming experience</p>
          <div style={{ position: 'absolute', top: 20, right: 20 }}>
            {user ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ fontWeight: '600' }}>{user.username}</div>
                <button onClick={() => setShowStats(!showStats)} style={{ padding: '4px 8px', fontSize: '12px' }}>
                  📊 {showStats ? 'Hide Stats' : 'My Stats'}
                </button>
                <button onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  localStorage.removeItem('gaming_token');
                  localStorage.removeItem('gaming_user');
                  setUser(null); setToken(null); window.currentUserId = undefined;
                  setShowStats(false);
                }}>Logout</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input placeholder="username" value={loginName} onChange={(e) => setLoginName(e.target.value)} />
                <button onClick={async () => {
                  if (!loginName) return alert('enter username');
                  const res = await fetch('http://localhost:4001/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: loginName }) });
                  const data = await res.json();
                  localStorage.setItem('gaming_token', data.token);
                  localStorage.setItem('gaming_user', JSON.stringify(data.user));
                  setToken(data.token); setUser(data.user); window.currentUserId = data.user.username;
                }}>Login</button>
              </div>
            )}
          </div>
        </header>

        {/* User Stats Display */}
        {showStats && (
          <div className="stats-section" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            margin: '20px',
            borderRadius: '15px',
            padding: '20px',
            color: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center', fontSize: '24px' }}>📊 My Gaming Statistics</h2>
            
            {userStats ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                  <div className="stat-card" style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>🎮</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{userStats.total || 0}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Total Games</div>
                  </div>
                  
                  <div className="stat-card" style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>✅</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{userStats.completed || 0}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Completed</div>
                  </div>
                  
                  <div className="stat-card" style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>⏸️</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{userStats.paused || 0}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Paused</div>
                  </div>
                  
                  <div className="stat-card" style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>❌</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{userStats.abandoned || 0}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Abandoned</div>
                  </div>
                  
                  <div className="stat-card" style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>🏆</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{(userStats.totalScore || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Total Score</div>
                  </div>
                  
                  <div className="stat-card" style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>📈</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{(userStats.avgScore || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Avg Score</div>
                  </div>
                  
                  <div className="stat-card" style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>🔥</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{userStats.bestStreak || 0}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Best Streak</div>
                  </div>
                  
                  <div className="stat-card" style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>⏱️</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{Math.floor((userStats.totalPlayTime || 0) / 60)}h {(userStats.totalPlayTime || 0) % 60}m</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Total Play Time</div>
                  </div>
                </div>
                
                {/* Recent Games */}
                {userStats.recent && userStats.recent.length > 0 && (
                  <div>
                    <h3 style={{ marginBottom: '15px', textAlign: 'center', fontSize: '18px' }}>🕒 Recent Games</h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {userStats.recent.map((game, index) => (
                        <div key={index} style={{
                          background: 'rgba(255,255,255,0.1)',
                          padding: '10px',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backdropFilter: 'blur(10px)'
                        }}>
                          <div>
                            <span style={{ fontWeight: 'bold' }}>{game.gameId}</span>
                            <span style={{ marginLeft: '10px', fontSize: '12px', opacity: 0.8 }}>
                              {game.status === 'completed' ? '✅' : game.status === 'abandoned' ? '❌' : '⏸️'} {game.status}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold' }}>{(game.score || 0).toLocaleString()} pts</div>
                            <div style={{ fontSize: '12px', opacity: 0.8 }}>
                              {Math.floor((game.duration || 0) / 60)}:{((game.duration || 0) % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(!userStats.recent || userStats.recent.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '20px', opacity: 0.7 }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎮</div>
                    <p>No games played yet. Start playing to see your statistics!</p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                <p>Loading your gaming statistics...</p>
                <button 
                  onClick={loadUserStats}
                  style={{
                    marginTop: '15px',
                    padding: '10px 20px',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid white',
                    borderRadius: '25px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Refresh Stats
                </button>
              </div>
            )}
          </div>
        )}

        <div className="hub-content">
          {/* Tenant Selection */}
          <div className="tenant-section">
            <h2>🏢 Choose Your Gaming Hub</h2>
            <div className="tenant-dropdown-container">
              <select
                value={selectedTenant}
                onChange={(e) => handleTenantChange(e.target.value)}
                className="tenant-dropdown"
              >
                <option value="">Select a Gaming Hub...</option>
                {Object.entries(tenants).map(([tenantKey, tenant]) => (
                  <option key={tenantKey} value={tenantKey}>
                    {tenant.name} ({tenant.games.filter(g => g.enabled).length} games)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Game Selection */}
          {selectedTenant && (
            <div className="games-section">
              <h2>🎯 Available Games</h2>
              <div className="games-grid">
                {tenants[selectedTenant].games.filter(game => game.enabled).map((game) => (
                  <div
                    key={game.id}
                    className={`game-card ${selectedGame === game.id ? 'selected' : ''}`}
                    onClick={() => handleGameSelect(game.id)}
                    style={{
                      borderColor: selectedGame === game.id ? '#667eea' : undefined,
                      boxShadow: selectedGame === game.id ? `0 0 30px rgba(102, 126, 234, 0.4)` : undefined
                    }}
                  >
                    <div className="game-header">
                      <div className="game-icon">{game.emoji}</div>
                      <div className="game-meta">
                        <span
                          className={`difficulty ${game.difficulty.toLowerCase()}`}
                          style={{
                            background: `linear-gradient(45deg, #667eea, #764ba2)`
                          }}
                        >
                          {game.difficulty}
                        </span>
                        <span className="duration">5-10 min</span>
                      </div>
                    </div>
                    <h3>{game.displayName}</h3>
                    <p>{game.category}</p>
                    <div className="game-actions">
                      <button
                        className="play-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGameSelect(game.id)
                        }}
                        style={{
                          background: `linear-gradient(45deg, #667eea, #764ba2)`
                        }}
                      >
                        🎮 Play Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="hub-footer">
            <p>© 2025 Gaming Hub - Powered by Core Gaming SDK</p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default App
