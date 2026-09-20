import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Navbar } from '../components/shared/Navbar.jsx';
import { CreateView } from '../components/shared/CreateView.jsx';
import { Footer } from '../components/shared/Footer.jsx';
import { LegalModal } from '../components/shared/Modals.jsx';

import { LAST_ROOM_KEY, LAST_USER_KEY } from '../constants/config.js';
import { formatDateISO } from '../utils/storage.js';

import { createRoom, getRoomByCode, updateRoomCreator } from '../services/roomService.js';
import { joinRoom, listMembers } from '../services/memberService.js';

export function CreatePage() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [planName, setPlanName] = useState('');
  const [preset, setPreset] = useState('7');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [preferredStart, setPreferredStart] = useState('08:00');
  const [preferredEnd, setPreferredEnd] = useState('22:00');
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [legalModalType, setLegalModalType] = useState(null);
  const [honeypot, setHoneypot] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  const getDeviceMemberId = (roomId) => {
    try {
      const memory = JSON.parse(localStorage.getItem('kelan_memberships') || '{}');
      return memory[roomId] || null;
    } catch { return null; }
  };

  const saveDeviceMemberId = (roomId, memberId) => {
    try {
      const memory = JSON.parse(localStorage.getItem('kelan_memberships') || '{}');
      memory[roomId] = memberId;
      localStorage.setItem('kelan_memberships', JSON.stringify(memory));
    } catch {}
  };

  useEffect(() => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + 6);
    setStartDate(formatDateISO(today));
    setEndDate(formatDateISO(end));
    const savedUser = localStorage.getItem(LAST_USER_KEY);
    if (savedUser) setUserName(savedUser);
  }, []);

  const handlePresetChange = (p) => {
    setPreset(p);
    const base = new Date();
    if (p === '7') {
      const end = new Date(base);
      end.setDate(base.getDate() + 6);
      setStartDate(formatDateISO(base));
      setEndDate(formatDateISO(end));
    } else if (p === '14') {
      const end = new Date(base);
      end.setDate(base.getDate() + 13);
      setStartDate(formatDateISO(base));
      setEndDate(formatDateISO(end));
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (honeypot) return; // Silent rejection for bots
    if (!userName.trim()) { showToast('Please enter your name!'); return; }
    if (!planName.trim()) { showToast('Please enter a plan name!'); return; }
    setIsLoading(true);
    try {
      const room = await createRoom(planName.trim(), startDate, endDate, preferredStart || null, preferredEnd || null);
      const member = await joinRoom(room.id, userName.trim());
      const updatedRoom = await updateRoomCreator(room.id, member.id);

      saveDeviceMemberId(room.id, member.id);
      localStorage.setItem(LAST_USER_KEY, userName.trim());
      localStorage.setItem(LAST_ROOM_KEY, updatedRoom.room_code);

      showToast(`Plan created! Room code: ${updatedRoom.room_code}`);
      setTimeout(() => navigate(`/room/${updatedRoom.room_code}`), 350);
    } catch (err) {
      console.error('Supabase Error:', err);
      showToast(`Error: ${err.message || 'Check console for details'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinPlan = async (e) => {
    e.preventDefault();
    const raw = joinCode.trim().toUpperCase();
    if (!raw) return;
    const code = raw.startsWith('KLTY-') ? raw : `KLTY-${raw}`;
    setIsLoading(true);
    try {
      const room = await getRoomByCode(code);
      if (room) {
        localStorage.setItem(LAST_ROOM_KEY, room.room_code);
        navigate(`/room/${room.room_code}`);
      } else {
        showToast('Room not found or link is invalid.');
      }
    } catch (err) {
      showToast('Error loading room.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar isLandingPage={false} isRoomPage={false} />
      {toastMessage && <div className="toast">{toastMessage}</div>}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading...</span>
        </div>
      )}
      <main>
        <CreateView
          creatorName={userName}
          setCreatorName={setUserName}
          planName={planName}
          setPlanName={setPlanName}
          preset={preset}
          handlePresetChange={handlePresetChange}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          handleCreatePlan={handleCreatePlan}
          handleJoinPlan={handleJoinPlan}
          preferredStart={preferredStart}
          setPreferredStart={setPreferredStart}
          preferredEnd={preferredEnd}
          setPreferredEnd={setPreferredEnd}
          honeypot={honeypot}
          setHoneypot={setHoneypot}
        />
      </main>
      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
      <Footer onOpenLegal={(type) => setLegalModalType(type)} />
    </>
  );
}
