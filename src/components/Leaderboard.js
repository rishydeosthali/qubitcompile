import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, User, Crown, Star, Edit2, Save, X } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { getLeaderboardData } from '../utils/progress';
import { doc, updateDoc } from 'firebase/firestore';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLeaderboardData();
        setLeaderboardData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
    });

    // Fetch leaderboard data regardless of auth state
    fetchData();
    
    // Removed debug alert for now

    return () => unsubscribe();
  }, []);

  // Calculate current user's rank
  useEffect(() => {
    if (currentUser && leaderboardData.length > 0) {
      const rank = leaderboardData.findIndex(user => user.userId === currentUser.uid);
      setCurrentUserRank(rank !== -1 ? rank + 1 : null);
    } else {
      setCurrentUserRank(null);
    }
  }, [currentUser, leaderboardData]);

  const handleEditName = () => {
    if (currentUser && leaderboardData.length > 0) {
      const userData = leaderboardData.find(user => user.userId === currentUser.uid);
      setEditedName(userData?.displayName || '');
      setEditingName(true);
    }
  };

  const handleSaveName = async () => {
    if (!currentUser) return;
    
    try {
      const userProgressRef = doc(db, 'userProgress', currentUser.uid);
      await updateDoc(userProgressRef, {
        displayName: editedName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
      });
      
      // Update local state
      setLeaderboardData(prev => prev.map(user => 
        user.userId === currentUser.uid 
          ? { ...user, displayName: editedName }
          : user
      ));
      
      setEditingName(false);
    } catch (error) {
      console.error('Error updating display name:', error);
      alert('Failed to update display name. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingName(false);
    setEditedName('');
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={32} color="#FFD700" />;
    if (rank === 2) return <Medal size={32} color="#C0C0C0" />;
    if (rank === 3) return <Award size={32} color="#CD7F32" />;
    return <span className="rank-number">{rank}</span>;
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return { background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#fff' };
    if (rank === 2) return { background: 'linear-gradient(135deg, #C0C0C0, #808080)', color: '#fff' };
    if (rank === 3) return { background: 'linear-gradient(135deg, #CD7F32, #8B4513)', color: '#fff' };
    return { background: 'rgba(255, 255, 255, 0.1)', color: '#b0b0c0' };
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: '#b0b0c0'
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0, 212, 255, 0.3)',
            borderTop: '3px solid #00d4ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="leaderboard-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Trophy size={48} color="#FFD700" style={{ marginTop: '-18px' }} />
          <h1 className="page-title">Leaderboard</h1>
        </div>
        <p className="page-subtitle">
          Top performers ranked by completed problems: Master quantum computing and climb the ranks!
        </p>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1rem 2.5rem',
          borderRadius: '0.75rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          margin: '1.5rem auto 0',
          width: 'fit-content',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Star size={20} color="#00d4ff" style={{ flexShrink: 0 }} />
          <p style={{ 
            color: '#e8e8f0', 
            margin: 0,
            fontSize: '0.95rem',
            fontWeight: '500',
            letterSpacing: '0.3px'
          }}>
            All submitted solutions are manually reviewed for accuracy
          </p>
        </div>
      </div>

      {leaderboardData.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Trophy size={64} color="#b0b0c0" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h2 style={{ color: '#b0b0c0', marginBottom: '1rem' }}>No Leaderboard Data Yet</h2>
          <p style={{ color: '#8a8a9a' }}>
            Be the first to complete problems and appear on the leaderboard!
          </p>
        </div>
      ) : (
        <>
          {/* Sign In Required Message */}
          {!currentUser && (
            <div className="card" style={{ 
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(78, 205, 196, 0.1))',
              border: '2px solid rgba(0, 212, 255, 0.3)',
              textAlign: 'center',
              padding: '2rem'
            }}>
              <h3 style={{ 
                color: '#e8e8f0', 
                margin: 0,
                fontSize: '1.5rem'
              }}>
                Please sign in to join leaderboard
              </h3>
              <p style={{ 
                color: '#c0c0d0', 
                margin: '1.25rem 0 0 0',
                fontSize: '1.15rem',
                fontWeight: '500',
                lineHeight: '1.7',
                letterSpacing: '0.2px'
              }}>
                Sign in to track your progress and compete on the leaderboard
              </p>
            </div>
          )}
          
          {/* Current User Rank Display */}
          {currentUser && !currentUserRank && (
            <div className="card" style={{ 
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(78, 205, 196, 0.1))',
              border: '2px solid rgba(0, 212, 255, 0.3)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div>
                      <h3 style={{ 
                        color: '#e8e8f0', 
                        margin: 0,
                        fontSize: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        You are unranked
                      </h3>
                      <p style={{ 
                        color: '#8a8a9a', 
                        margin: '0.5rem 0 0 0.25rem',
                        fontSize: '0.75rem',
                        fontStyle: 'italic'
                      }}>
                        Complete more problems to get on leaderboard!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {currentUserRank && (
            <div className="card" style={{ 
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(78, 205, 196, 0.1))',
              border: '2px solid rgba(0, 212, 255, 0.3)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <Trophy size={32} color="#FFD700" />
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    {editingName ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '2px solid rgba(0, 212, 255, 0.5)',
                            borderRadius: '0.5rem',
                            padding: '0.5rem 1rem',
                            color: '#e8e8f0',
                            fontSize: '1rem',
                            flex: 1,
                            outline: 'none'
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveName();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleSaveName}
                          style={{
                            background: 'rgba(78, 205, 196, 0.8)',
                            border: 'none',
                            borderRadius: '0.5rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Save size={20} color="#fff" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            background: 'rgba(255, 107, 107, 0.8)',
                            border: 'none',
                            borderRadius: '0.5rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <X size={20} color="#fff" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h3 style={{ 
                          color: '#e8e8f0', 
                          margin: 0,
                          fontSize: '1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          You are ranked #{currentUserRank}
                          <button
                            onClick={handleEditName}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#00d4ff'
                            }}
                            title="Edit your display name"
                          >
                            <Edit2 size={16} />
                          </button>
                        </h3>
                        <p style={{ 
                          color: '#8a8a9a', 
                          margin: '0.5rem 0 0 0',
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}>
                          Click the pencil icon to edit your display name on the Top 25 leaderboard
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Star size={20} color="#FFD700" />
                  <span style={{ color: '#e8e8f0', fontWeight: '600' }}>
                    {leaderboardData[currentUserRank - 1]?.completedCount || 0} problems completed
                  </span>
                </div>
              </div>
            </div>
          )}
        <div className="leaderboard-grid">
          <div className="leaderboard-card card">
            {/* Top 3 Podium */}
            <div className="podium-section">
              {leaderboardData[1] && (
                <div className="podium-card silver" style={{ order: 0 }}>
                  <div className="podium-rank">2</div>
                  <div className="podium-medal">
                    <Medal size={40} color="#C0C0C0" />
                  </div>
                  <div className="podium-name">{leaderboardData[1].displayName}</div>
                  <div className="podium-count">{leaderboardData[1].completedCount} problems</div>
                </div>
              )}
              
              {leaderboardData[0] && (
                <div className="podium-card gold" style={{ order: 1 }}>
                  <div className="podium-rank">1</div>
                  <div className="podium-medal">
                    <Crown size={40} color="#FFD700" />
                  </div>
                  <div className="podium-name">{leaderboardData[0].displayName}</div>
                  <div className="podium-count">{leaderboardData[0].completedCount} problems</div>
                </div>
              )}
              
              {leaderboardData[2] && (
                <div className="podium-card bronze" style={{ order: 2 }}>
                  <div className="podium-rank">3</div>
                  <div className="podium-medal">
                    <Award size={40} color="#CD7F32" />
                  </div>
                  <div className="podium-name">{leaderboardData[2].displayName}</div>
                  <div className="podium-count">{leaderboardData[2].completedCount} problems</div>
                </div>
              )}
            </div>

            {/* Full Leaderboard List */}
            <div className="leaderboard-list">
              <h3 style={{ color: '#e8e8f0', marginBottom: '1.5rem', textAlign: 'center' }}>
                Only the Top 25 Players Are Displayed
              </h3>
              {leaderboardData.slice(0, 25).map((user, index) => {
                const rank = index + 1;
                const isCurrentUser = currentUser && user.userId === currentUser.uid;
                const rankBadgeStyle = getRankBadgeColor(rank);

                return (
                  <div 
                    key={user.userId} 
                    className={`leaderboard-item ${isCurrentUser ? 'current-user' : ''}`}
                  >
                    <div className="leaderboard-rank" style={rankBadgeStyle}>
                      {getRankIcon(rank)}
                    </div>
                    <div className="leaderboard-user">
                      <div className="leaderboard-info">
                        <div className="leaderboard-name">
                          {user.displayName === 'Anonymous' && !user.email ? (
                            <>
                              Anonymous User
                              <span style={{
                                marginLeft: '0.5rem',
                                fontSize: '0.75rem',
                                color: '#8a8a9a',
                                fontStyle: 'italic'
                              }}>
                                (No profile info)
                              </span>
                            </>
                          ) : (
                            user.displayName
                          )}
                          {isCurrentUser && <span className="current-user-badge">You</span>}
                        </div>
                      </div>
                    </div>
                    <div className="leaderboard-stats">
                      <div className="stat-item">
                        <Star size={16} color="#FFD700" />
                        <span>{user.completedCount} problems</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;

