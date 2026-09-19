import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GalaNavbar } from '../components/gala/GalaNavbar.jsx';
import { Footer } from '../components/shared/Footer.jsx';
import { getSession, signOut, getOrCreateProfile } from '../services/authService.js';
import { listMyGalas, createGala } from '../services/galaService.js';
import { formatDateISO } from '../utils/storage.js';

export function GalaDashboardPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [galas, setGalas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create form state
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const today = new Date();
    setNewStartDate(formatDateISO(today));

    const loadData = async () => {
      try {
        const sess = await getSession();
        if (!sess) {
          navigate('/gala');
          return;
        }
        if (!mounted) return;
        setSession(sess);
        const prof = await getOrCreateProfile(sess);
        setProfile(prof);
        const myGalas = await listMyGalas(prof.id);
        setGalas(myGalas);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/gala');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newStartDate) return;
    setIsSubmitting(true);
    try {
      const newGala = await createGala(profile.id, newName.trim(), newStartDate, newEndDate || null);
      navigate(`/gala/${newGala.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create gala');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <GalaNavbar rightSlot={<button className="btn-secondary btn-compact" onClick={handleSignOut}>Sign Out</button>} />
      
      {isLoading ? (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <span className="loading-text">Loading...</span>
        </div>
      ) : (
        <main className="gala-dashboard-main">
          <div className="gala-dashboard-header">
            <h1 className="display">My Regular Galas</h1>
            <button className="btn-primary" onClick={() => setIsCreating(true)}>Create a Regular Gala</button>
          </div>

          {isCreating && (
            <div className="gala-create-form-container card">
              <h3>Create New Regular Gala</h3>
              <form onSubmit={handleCreate} className="gala-create-form">
                <div className="field-group">
                  <label>Gala Name</label>
                  <input type="text" className="field" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Badminton Squad" required disabled={isSubmitting} />
                </div>
                <div className="field-group">
                  <label>Start Date</label>
                  <input type="date" className="field" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} required disabled={isSubmitting} />
                </div>
                <div className="field-group">
                  <label>End Date (Optional)</label>
                  <input type="date" className="field" value={newEndDate} onChange={e => setNewEndDate(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="gala-create-actions">
                  <button type="button" className="btn-secondary" onClick={() => setIsCreating(false)} disabled={isSubmitting}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="gala-list">
            {galas.length === 0 && !isCreating ? (
              <p className="gala-empty">You don't have any Regular Galas yet. Create one to get started!</p>
            ) : (
              galas.map(gala => (
                <Link to={`/gala/${gala.gala_id}`} key={gala.gala_id} className="gala-card card">
                  <div className="gala-card-header">
                    <h3 className="gala-card-title">{gala.regular_galas.name}</h3>
                    <span className={`gala-status-badge ${gala.regular_galas.status}`}>
                      {gala.regular_galas.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                  <div className="gala-card-meta">
                    Created by {gala.regular_galas.created_by === profile.id ? 'You' : 'Someone else'}
                  </div>
                </Link>
              ))
            )}
          </div>
        </main>
      )}

      <Footer onOpenLegal={() => {}} />
    </>
  );
}
