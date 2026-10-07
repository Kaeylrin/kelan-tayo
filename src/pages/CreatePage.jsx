import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Navbar } from '../components/shared/Navbar.jsx';
import { CreateView } from '../components/shared/CreateView.jsx';
import { Footer } from '../components/shared/Footer.jsx';
import { Toast } from '../components/shared/Toast.jsx';
import { useToast } from '../hooks/useToast.js';

import { LAST_ROOM_KEY, LAST_USER_KEY } from '../constants/config.js';
import { formatDateISO } from '../utils/storage.js';
import { readStorage, writeStorage, saveDeviceMemberId } from '../utils/deviceMemory.js';

import { createRoom, getRoomByCode } from '../services/roomService.js';

const MAX_RANGE_DAYS = 62;

function rangeFromToday(days) {
  const start = new Date();
  const end = new Date(start);
  end.setDate(start.getDate() + days - 1);
  return [formatDateISO(start), formatDateISO(end)];
}

export function CreatePage() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState(() => readStorage(LAST_USER_KEY) || '');
  const [planName, setPlanName] = useState('');
  const [preset, setPreset] = useState('7');
  const [startDate, setStartDate] = useState(() => rangeFromToday(7)[0]);
  const [endDate, setEndDate] = useState(() => rangeFromToday(7)[1]);
  const [joinCode, setJoinCode] = useState('');
  const [preferredStart, setPreferredStart] = useState('08:00');
  const [preferredEnd, setPreferredEnd] = useState('22:00');
  const [isLoading, setIsLoading] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = useRef(null);
  const [toast, showToast] = useToast();

  const handlePresetChange = (p) => {
    setPreset(p);
    if (p === '7' || p === '14') {
      const [start, end] = rangeFromToday(Number(p));
      setStartDate(start);
      setEndDate(end);
    }
  };

  const validate = () => {
    if (!userName.trim()) return 'Please enter your name!';
    if (!planName.trim()) return 'Please enter a plan name!';
    if (!startDate || !endDate) return 'Please pick your dates.';
    if (endDate < startDate) return 'The end date must be on or after the start date.';
    const days = (Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86400000 + 1;
    if (days > MAX_RANGE_DAYS) return `Plans can cover at most ${MAX_RANGE_DAYS} days.`;
    if (preferredStart && preferredEnd && preferredEnd <= preferredStart) return 'Preferred hours must end after they start.';
    return null;
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (honeypot) return; // Silent rejection for bots
    const problem = validate();
    if (problem) { showToast(problem); return; }
    if (!turnstileToken) { showToast('Verifying security connection... please wait a second and try again.'); return; }
    setIsLoading(true);
    try {
      const { room, member } = await createRoom({
        name: planName.trim(),
        creatorName: userName.trim(),
        dateFrom: startDate,
        dateTo: endDate,
        preferredStart,
        preferredEnd,
        turnstileToken,
      });

      saveDeviceMemberId(room.id, member.id);
      writeStorage(LAST_USER_KEY, userName.trim());
      writeStorage(LAST_ROOM_KEY, room.room_code);
      navigate(`/room/${room.room_code}`);
    } catch (err) {
      console.error('Create plan failed:', err);
      showToast(err.message || 'Could not create the plan. Please try again.');
      // Turnstile tokens are single-use; get a fresh one for any retry.
      setTurnstileToken(null);
      turnstileRef.current?.reset();
      setIsLoading(false);
    }
  };

  const handleJoinPlan = async (e) => {
    e.preventDefault();
    const raw = joinCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!raw) return;
    const code = raw.startsWith('KLTY-') ? raw : `KLTY-${raw}`;
    if (!/^KLTY-[A-Z0-9]{3,10}$/.test(code)) { showToast('That room code does not look right.'); return; }
    setIsLoading(true);
    try {
      const room = await getRoomByCode(code);
      if (room) {
        writeStorage(LAST_ROOM_KEY, room.room_code);
        navigate(`/room/${room.room_code}`);
        return;
      }
      showToast('Room not found or link is invalid.');
    } catch {
      showToast('Error loading room.');
    }
    setIsLoading(false);
  };

  return (
    <>
      <Navbar />
      <Toast message={toast} />
      {isLoading && (
        <div className="loading-overlay" role="status">
          <div className="loading-spinner" />
          <span className="loading-text">Loading...</span>
        </div>
      )}
      <main className="page-main">
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
          isSubmitting={isLoading}
          preferredStart={preferredStart}
          setPreferredStart={setPreferredStart}
          preferredEnd={preferredEnd}
          setPreferredEnd={setPreferredEnd}
          honeypot={honeypot}
          setHoneypot={setHoneypot}
          setTurnstileToken={setTurnstileToken}
          turnstileRef={turnstileRef}
        />
      </main>
      <Footer />
    </>
  );
}
