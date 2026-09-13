import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { LandingView } from './components/LandingView.jsx';
import { MarkScheduleView } from './components/MarkScheduleView.jsx';
import { DashboardView } from './components/DashboardView.jsx';
import { ConfirmDateModal, LegalModal } from './components/Modals.jsx';
import { Footer } from './components/Footer.jsx';

import { LAST_ROOM_KEY, LAST_USER_KEY } from './constants/config.js';
import { formatDateISO, getDatesArray } from './utils/storage.js';

import { createRoom, getRoomByCode, updateRoomCreator, confirmRoom, unlockRoom } from './services/roomService.js';
import { joinRoom, deleteMember, listMembers } from './services/memberService.js';
import { saveAvailability, getRoomAvailability } from './services/availabilityService.js';
import { supabase } from './utils/supabaseClient';

import './styles/App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // { id, display_name }
  const [userName, setUserName] = useState('');
  const [busySlots, setBusySlots] = useState(new Set());
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [confirmModalData, setConfirmModalData] = useState(null);
  const [legalModalType, setLegalModalType] = useState(null);

  // Plan creation form state
  const [planName, setPlanName] = useState('');
  const [preset, setPreset] = useState('7');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  // Helper to manage device memory of memberships
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

  // On mount
  useEffect(() => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + 6);
    setStartDate(formatDateISO(today));
    setEndDate(formatDateISO(end));

    const savedUser = localStorage.getItem(LAST_USER_KEY);
    if (savedUser) setUserName(savedUser);

    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('room') || params.get('code');
      
      let targetCode = codeParam;
      if (!targetCode) {
        targetCode = localStorage.getItem(LAST_ROOM_KEY);
      }

      if (targetCode) {
        const raw = targetCode.toUpperCase();
        const code = raw.startsWith('KLTY-') ? raw : `KLTY-${raw}`;
        await loadRoomData(code);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!currentRoom?.id) return;
    
    const channel = supabase
      .channel(`room-${currentRoom.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${currentRoom.id}`
      }, (payload) => {
        // Only update status and confirmed details to lock it in realtime
        setCurrentRoom(prev => prev ? { 
            ...prev, 
            status: payload.new.status,
            confirmed_date: payload.new.confirmed_date,
            confirmed_start: payload.new.confirmed_start,
            confirmed_end: payload.new.confirmed_end
        } : null);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoom?.id]);

  const loadRoomData = async (code) => {
    setIsLoading(true);
    try {
      const room = await getRoomByCode(code);
      if (room) {
        const members = await listMembers(room.id);
        const participantCount = members.length;
        setCurrentRoom({ ...room, participantCount });
        localStorage.setItem(LAST_ROOM_KEY, room.room_code);
        
        // Restore user session for this room if exists
        const memberId = getDeviceMemberId(room.id);
        if (memberId) {
          const myMember = members.find(m => m.id === memberId);
          if (myMember) setCurrentUser({ id: memberId, display_name: myMember.display_name || userName });
          
          // Also fetch their current busy slots
          const availData = await getRoomAvailability(room.id);
          const myAvailRows = availData.filter(a => a.members?.id === memberId);
          
          const newSet = new Set();
          myAvailRows.forEach(row => {
             if (row.busy_hours) {
                 row.busy_hours.forEach(hr => {
                     newSet.add(`${row.date}_${hr}`);
                 });
             }
          });
          setBusySlots(newSet);
        }
        
        setActiveTab('mark');
      } else {
        showToast('Room not found or link is invalid.');
        localStorage.removeItem(LAST_ROOM_KEY);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading room.');
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!userName.trim()) { showToast('Please enter your name!'); return; }
    if (!planName.trim()) { showToast('Please enter a plan name!'); return; }
    
    setIsLoading(true);
    try {
      // 1. Create Room
      const room = await createRoom(planName.trim(), startDate, endDate);
      // 2. Join as first member
      const member = await joinRoom(room.id, userName.trim());
      // 3. Set as creator
      const updatedRoom = await updateRoomCreator(room.id, member.id);
      
      saveDeviceMemberId(room.id, member.id);
      localStorage.setItem(LAST_USER_KEY, userName.trim());
      
      setCurrentRoom(updatedRoom);
      setCurrentUser(member);
      setBusySlots(new Set());
      localStorage.setItem(LAST_ROOM_KEY, updatedRoom.room_code);
      
      showToast(`Plan created! Room code: ${updatedRoom.room_code}`);
      setActiveTab('mark');
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
    await loadRoomData(code);
  };

  const handleLeaveRoom = async () => {
    setIsLoading(true);
    try {
      if (currentRoom && currentUser) {
        await deleteMember(currentRoom.id, currentUser.id);
      }
      setCurrentRoom(null);
      setCurrentUser(null);
      localStorage.removeItem(LAST_ROOM_KEY);
      setBusySlots(new Set());
      showToast('Left the plan.');
    } catch (e) {
      console.error(e);
      showToast('Failed to leave plan properly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!currentRoom) return;
    const trimmed = userName.trim();
    if (!trimmed) { showToast('Please enter your display name first!'); return; }
    
    setIsLoading(true);
    try {
      localStorage.setItem(LAST_USER_KEY, trimmed);
      let memberId = currentUser?.id;
      
      // If not joined yet, join now
      if (!memberId) {
        const member = await joinRoom(currentRoom.id, trimmed);
        memberId = member.id;
        setCurrentUser(member);
        saveDeviceMemberId(currentRoom.id, member.id);
      }
      
      // For MVP we just save one big JSON of all dates to one 'date' row, 
      // or we map it properly if the schema expects per-date rows.
      // Wait, the schema says: "date: date, busy_hours: jsonb" per date!
      // This means we must save a row per date.
      const busyArray = Array.from(busySlots);
      
      // Group by date
      const slotsByDate = {};
      const dates = getDatesArray(currentRoom.date_from, currentRoom.date_to);
      dates.forEach(d => { slotsByDate[formatDateISO(d)] = []; });
      
      busyArray.forEach(slot => {
        const [dStr, hour] = slot.split('_');
        if (slotsByDate[dStr]) slotsByDate[dStr].push(parseInt(hour, 10));
      });
      
      // Save for each date
      for (const [dStr, hours] of Object.entries(slotsByDate)) {
        await saveAvailability(memberId, currentRoom.id, dStr, hours);
      }
      
      showToast(`Schedule saved for ${trimmed}!`);
      setTimeout(() => setActiveTab('dashboard'), 350);
    } catch (err) {
      console.error(err);
      showToast('Failed to save schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareLink = () => {
    if (!currentRoom) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${currentRoom.room_code}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Room link copied to clipboard!');
    }).catch(() => {
      showToast('Link copied!');
    });
  };

  return (
    <>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRoom={currentRoom}
        onShowToast={showToast}
      />
      {toastMessage && <div className="toast">{toastMessage}</div>}
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading...</span>
        </div>
      )}

      <main>
        {activeTab === 'landing' && (
          <LandingView
            currentRoom={currentRoom}
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
            handleLeaveRoom={handleLeaveRoom}
            goToMark={() => setActiveTab('mark')}
            goToDash={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'mark' && currentRoom && (
          <MarkScheduleView
            room={{
              ...currentRoom,
              code: currentRoom.room_code,
              startDate: currentRoom.date_from,
              endDate: currentRoom.date_to
            }}
            userName={userName}
            setUserName={setUserName}
            busySlots={busySlots}
            setBusySlots={setBusySlots}
            handleSaveSchedule={handleSaveSchedule}
            copyShareLink={copyShareLink}
            isLocked={currentRoom.status === 'confirmed'}
          />
        )}

        {activeTab === 'dashboard' && currentRoom && (
          <DashboardView
            room={{
              ...currentRoom,
              code: currentRoom.room_code,
              startDate: currentRoom.date_from,
              endDate: currentRoom.date_to
            }}
            currentUser={currentUser}
            onRefresh={() => loadRoomData(currentRoom.room_code)}
            onLockInDate={(details) => setConfirmModalData(details)}
            onUnlockRoom={async () => {
                // To be handled inside Dashboard or here
                setIsLoading(true);
                try {
                  const updated = await unlockRoom(currentRoom.id, currentUser.id);
                  setCurrentRoom(updated);
                  showToast('Room unlocked!');
                } catch(e) { showToast('Error unlocking.'); }
                setIsLoading(false);
            }}
          />
        )}
      </main>

      {confirmModalData && (
        <ConfirmDateModal
          dateDetails={confirmModalData}
          planName={currentRoom?.name || ''}
          onClose={() => setConfirmModalData(null)}
          onConfirm={async () => {
            setIsLoading(true);
            try {
              const { date, startH, endH } = confirmModalData;
              const updated = await confirmRoom(currentRoom.id, currentUser.id, date, startH, endH);
              setCurrentRoom(updated);
              setConfirmModalData(null);
              showToast('Plan confirmed and locked!');
            } catch(e) {
              console.error(e);
              showToast('Error confirming plan.');
            }
            setIsLoading(false);
          }}
        />
      )}

      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
      <Footer onOpenLegal={(type) => setLegalModalType(type)} />
    </>
  );
}
