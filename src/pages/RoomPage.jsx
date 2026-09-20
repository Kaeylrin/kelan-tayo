import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Navbar } from '../components/shared/Navbar.jsx';
import { MarkScheduleView } from '../components/room/MarkScheduleView.jsx';
import { DashboardView } from '../components/room/DashboardView.jsx';
import { ConfirmDateModal } from '../components/shared/Modals.jsx';
import { Footer } from '../components/shared/Footer.jsx';

import { LAST_ROOM_KEY, LAST_USER_KEY } from '../constants/config.js';
import { formatDateISO, getDatesArray } from '../utils/storage.js';

import { getRoomByCode, confirmRoom, unlockRoom } from '../services/roomService.js';
import { joinRoom, deleteMember, listMembers } from '../services/memberService.js';
import { saveAvailability, getRoomAvailability } from '../services/availabilityService.js';
import { supabase } from '../utils/supabaseClient.js';

export function RoomPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('mark');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [busySlots, setBusySlots] = useState(new Set());
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModalData, setConfirmModalData] = useState(null);

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

  const loadRoomData = useCallback(async (roomCode) => {
    setIsLoading(true);
    try {
      const normalCode = roomCode.toUpperCase().startsWith('KLTY-')
        ? roomCode.toUpperCase()
        : `KLTY-${roomCode.toUpperCase()}`;
      const room = await getRoomByCode(normalCode);
      if (!room) {
        showToast('Room not found.');
        navigate('/create');
        return;
      }
      const members = await listMembers(room.id);
      setCurrentRoom({ ...room, participantCount: members.length });
      localStorage.setItem(LAST_ROOM_KEY, room.room_code);

      const savedUser = localStorage.getItem(LAST_USER_KEY);
      if (savedUser) setUserName(savedUser);

      const memberId = getDeviceMemberId(room.id);
      if (memberId) {
        const myMember = members.find(m => m.id === memberId);
        if (myMember) setCurrentUser({ id: memberId, display_name: myMember.display_name || savedUser || '' });

        const availData = await getRoomAvailability(room.id);
        const myAvailRows = availData.filter(a => a.members?.id === memberId);
        const newSet = new Set();
        myAvailRows.forEach(row => {
          if (row.busy_hours) row.busy_hours.forEach(hr => newSet.add(`${row.date}_${hr}`));
        });
        setBusySlots(newSet);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading room.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (code) loadRoomData(code);
  }, [code, loadRoomData]);

  // Realtime lock subscription
  useEffect(() => {
    if (!currentRoom?.id) return;
    const channel = supabase
      .channel(`room-${currentRoom.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${currentRoom.id}` }, (payload) => {
        setCurrentRoom(prev => prev ? {
          ...prev,
          status: payload.new.status,
          confirmed_date: payload.new.confirmed_date,
          confirmed_start: payload.new.confirmed_start,
          confirmed_end: payload.new.confirmed_end,
        } : null);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [currentRoom?.id]);

  const handleSaveSchedule = async () => {
    if (!currentRoom) return;
    const trimmed = userName.trim();
    if (!trimmed) { showToast('Please enter your display name first!'); return; }
    setIsLoading(true);
    try {
      localStorage.setItem(LAST_USER_KEY, trimmed);
      let memberId = currentUser?.id;
      if (!memberId) {
        const member = await joinRoom(currentRoom.id, trimmed);
        memberId = member.id;
        setCurrentUser(member);
        saveDeviceMemberId(currentRoom.id, member.id);
      }
      const busyArray = Array.from(busySlots);
      const slotsByDate = {};
      const dates = getDatesArray(currentRoom.date_from, currentRoom.date_to);
      dates.forEach(d => { slotsByDate[formatDateISO(d)] = []; });
      busyArray.forEach(slot => {
        const [dStr, hour] = slot.split('_');
        if (slotsByDate[dStr]) slotsByDate[dStr].push(parseInt(hour, 10));
      });
      for (const [dStr, hours] of Object.entries(slotsByDate)) {
        await saveAvailability(memberId, currentRoom.id, dStr, hours);
      }
      // Refresh participant count
      const members = await listMembers(currentRoom.id);
      setCurrentRoom(prev => ({ ...prev, participantCount: members.length }));
      showToast(`Schedule saved for ${trimmed}!`);
      setTimeout(() => setActiveTab('dashboard'), 350);
    } catch (err) {
      console.error(err);
      showToast('Failed to save schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    setIsLoading(true);
    try {
      if (currentRoom && currentUser) await deleteMember(currentRoom.id, currentUser.id);
      localStorage.removeItem(LAST_ROOM_KEY);
      showToast('Left the plan.');
      navigate('/create');
    } catch (e) {
      showToast('Failed to leave plan properly.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareLink = () => {
    if (!currentRoom) return;
    const url = `${window.location.origin}/room/${currentRoom.room_code}`;
    navigator.clipboard.writeText(url)
      .then(() => showToast('Room link copied to clipboard!'))
      .catch(() => showToast('Link copied!'));
  };

  if (isLoading && !currentRoom) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading room...</div>
      </div>
    );
  }

  if (!currentRoom) return null;

  const roomForViews = {
    ...currentRoom,
    code: currentRoom.room_code,
    startDate: currentRoom.date_from,
    endDate: currentRoom.date_to,
  };

  return (
    <>
      <Navbar
        isRoomPage={true}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRoom={currentRoom}
        onShowToast={showToast}
        onLeaveRoom={handleLeaveRoom}
      />
      {toastMessage && <div className="toast">{toastMessage}</div>}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading...</span>
        </div>
      )}
      <main>
        {activeTab === 'mark' && (
          <MarkScheduleView
            room={roomForViews}
            userName={userName}
            setUserName={setUserName}
            busySlots={busySlots}
            setBusySlots={setBusySlots}
            handleSaveSchedule={handleSaveSchedule}
            copyShareLink={copyShareLink}
            isLocked={currentRoom.status === 'confirmed'}
          />
        )}
        {activeTab === 'dashboard' && (
          <DashboardView
            room={roomForViews}
            currentUser={currentUser}
            onRefresh={() => loadRoomData(code)}
            onLockInDate={(details) => setConfirmModalData(details)}
            onUnlockRoom={async () => {
              setIsLoading(true);
              try {
                const updated = await unlockRoom(currentRoom.id, currentUser.id);
                setCurrentRoom(updated);
                showToast('Room unlocked!');
              } catch { showToast('Error unlocking.'); }
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
            } catch (e) {
              showToast('Error confirming plan.');
            }
            setIsLoading(false);
          }}
        />
      )}

      <Footer />
    </>
  );
}

