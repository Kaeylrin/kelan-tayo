import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GalaNavbar } from '../components/gala/GalaNavbar.jsx';
import { Footer } from '../components/shared/Footer.jsx';
import { getSession, getOrCreateProfile } from '../services/authService.js';
import { getGala, joinGala, getGalaPatterns, getExceptions } from '../services/galaService.js';
import { GalaMemberSchedule } from '../components/gala/GalaMemberSchedule.jsx';
import { GalaOverlapView } from '../components/gala/GalaOverlapView.jsx';
import { GalaExceptionManager } from '../components/gala/GalaExceptionManager.jsx';

export function GalaRoomPage() {
  const { galaId } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [gala, setGala] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' | 'overlap' | 'exceptions'

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const sess = await getSession();
        if (!sess) { navigate('/gala'); return; }
        
        const prof = await getOrCreateProfile(sess);
        if (!mounted) return;
        setProfile(prof);

        const galaData = await getGala(galaId);
        if (!galaData) { navigate('/gala/dashboard'); return; }
        setGala(galaData);

        const memberCheck = galaData.gala_members.some(m => m.profile_id === prof.id);
        setIsMember(memberCheck);

        const pats = await getGalaPatterns(galaId);
        setPatterns(pats);

        const exc = await getExceptions(galaId);
        setExceptions(exc);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [galaId, navigate]);

  const handleJoin = async () => {
    setIsLoading(true);
    try {
      await joinGala(galaId, profile.id);
      setIsMember(true);
      const galaData = await getGala(galaId);
      setGala(galaData);
    } catch (err) {
      console.error(err);
      alert('Failed to join gala');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    const pats = await getGalaPatterns(galaId);
    setPatterns(pats);
    const exc = await getExceptions(galaId);
    setExceptions(exc);
    const galaData = await getGala(galaId);
    setGala(galaData);
  };

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
        <span className="loading-text">Loading...</span>
      </div>
    );
  }

  if (!gala) return null;

  const isOwner = gala.created_by === profile?.id;

  return (
    <>
      <GalaNavbar rightSlot={<button className="btn-secondary btn-compact" onClick={() => navigate('/gala/dashboard')}>Back to Dashboard</button>} />
      
      <main className="gala-room-main">
        <div className="gala-room-header card">
          <h1 className="display">{gala.name}</h1>
          <div className="gala-room-meta">
            <span className={`gala-status-badge ${gala.status}`}>
              {gala.status === 'confirmed' ? 'Confirmed' : 'Pending'}
            </span>
            <span>{gala.gala_members.length} members</span>
          </div>
          {!isMember && (
            <button className="btn-primary" onClick={handleJoin} style={{ marginTop: '16px' }}>
              Join this Regular Gala
            </button>
          )}
        </div>

        {isMember && (
          <>
            <div className="gala-tabs">
              <button className={`tab-btn ${activeTab === 'mark' ? 'active' : ''}`} onClick={() => setActiveTab('mark')}>My Weekly Schedule</button>
              <button className={`tab-btn ${activeTab === 'overlap' ? 'active' : ''}`} onClick={() => setActiveTab('overlap')}>Group Overlap</button>
              <button className={`tab-btn ${activeTab === 'exceptions' ? 'active' : ''}`} onClick={() => setActiveTab('exceptions')}>Exceptions</button>
            </div>

            <div className="gala-tab-content">
              {activeTab === 'mark' && (
                <GalaMemberSchedule 
                  gala={gala} 
                  profile={profile} 
                  initialPatterns={patterns.filter(p => p.profile_id === profile.id)} 
                  onSave={refreshData} 
                />
              )}
              {activeTab === 'overlap' && (
                <GalaOverlapView 
                  gala={gala} 
                  patterns={patterns} 
                  isOwner={isOwner} 
                  onRefresh={refreshData} 
                />
              )}
              {activeTab === 'exceptions' && (
                <GalaExceptionManager 
                  gala={gala} 
                  profile={profile} 
                  exceptions={exceptions} 
                  isOwner={isOwner} 
                  onRefresh={refreshData} 
                />
              )}
            </div>
          </>
        )}
      </main>
      <Footer onOpenLegal={() => {}} />
    </>
  );
}
