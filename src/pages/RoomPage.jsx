import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Navbar } from '../components/shared/Navbar.jsx';
import { MarkScheduleView } from '../components/room/MarkScheduleView.jsx';
import { DashboardView } from '../components/room/DashboardView.jsx';
import { ConfirmDateModal, ConfirmDialog } from '../components/shared/Modals.jsx';
import { Footer } from '../components/shared/Footer.jsx';
import { BotCheck } from '../components/shared/BotCheck.jsx';
import { Toast } from '../components/shared/Toast.jsx';
import { useToast } from '../hooks/useToast.js';

import { LAST_ROOM_KEY, LAST_USER_KEY } from '../constants/config.js';
import { formatDateISO, getDatesArray, hourToClock } from '../utils/storage.js';
import { getDeviceMemberId, saveDeviceMemberId, forgetDeviceMember, readStorage, writeStorage, removeStorage } from '../utils/deviceMemory.js';

import { getRoomByCode, confirmRoom, unlockRoom } from '../services/roomService.js';
import { joinRoom, deleteMember, listMembers } from '../services/memberService.js';
import { saveAvailability, getRoomAvailability } from '../services/availabilityService.js';
import { supabase } from '../utils/supabaseClient.js';

const normalizeCode = (code) => {
  const upper = code.trim().toUpperCase();
  return upper.startsWith('KLTY-') ? upper : `KLTY-${upper}`;
};

export function RoomPage() {
  const { code } = useParams();
  return <Room key={code} code={code} />;
}

function Room({ code }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('mark');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState(() => readStorage(LAST_USER_KEY) || '');
  const [busySlots, setBusySlots] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModalData, setConfirmModalData] = useState(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = useRef(null);
  const [toast, showToast] = useToast();

  const loadRoomData = useCallback(async () => {
    try {
      const room = await getRoomByCode(normalizeCode(code));
      if (!room) {
        showToast('Room not found.');
        navigate('/create', { replace: true });
        return;
      }
      const members = await listMembers(room.id);
      setCurrentRoom({ ...room, participantCount: members.length });
      writeStorage(LAST_ROOM_KEY, room.room_code);

      const memberId = getDeviceMemberId(room.id);
      const myMember = memberId ? members.find((m) => m.id === memberId) : null;
      if (myMember) {
        setCurrentUser({ id: myMember.id, display_name: myMember.display_name });
        setUserName(myMember.display_name);
        const availData = await getRoomAvailability(room.id);
        const mine = new Set();
        availData
          .filter((a) => a.members?.id === memberId)
          .forEach((row) => (row.busy_hours || []).forEach((hr) => mine.add(`${row.date}_${hr}`)));
        setBusySlots(mine);
      } else if (memberId) {
        // This device's member was removed from the room; start fresh.
        forgetDeviceMember(room.id);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading room.');
    } finally {
      setIsLoading(false);
    }
  }, [code, navigate, showToast]);

  // loadRoomData only sets state after its first await.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadRoomData(); }, [loadRoomData]);

  // Realtime lock subscription
  useEffect(() => {
    if (!currentRoom?.id) return;
    const channel = supabase
      .channel(`room-${currentRoom.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${currentRoom.id}` }, (payload) => {
        setCurrentRoom((prev) => prev ? {
          ...prev,
          status: payload.new.status,
          confirmed_date: payload.new.confirmed_date,
          confirmed_start: payload.new.confirmed_start,
          confirmed_end: payload.new.confirmed_end,
        } : null);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentRoom?.id]);

  const handleSaveSchedule = async () => {
    if (!currentRoom) return;
    const trimmed = userName.trim();
    if (!trimmed) { showToast('Please enter your display name first!'); return; }
    if (!currentUser && !turnstileToken) { showToast('Verifying you are human... please try again in a second.'); return; }
    setIsLoading(true);
    try {
      writeStorage(LAST_USER_KEY, trimmed);
      let memberId = currentUser?.id;
      if (!memberId) {
        const member = await joinRoom(currentRoom.id, trimmed, turnstileToken);
        setTurnstileToken(null);
        memberId = member.id;
        setCurrentUser(member);
        saveDeviceMemberId(currentRoom.id, member.id);
      }
      const slotsByDate = {};
      getDatesArray(currentRoom.date_from, currentRoom.date_to).forEach((d) => { slotsByDate[formatDateISO(d)] = []; });
      busySlots.forEach((slot) => {
        const [dStr, hour] = slot.split('_');
        if (slotsByDate[dStr]) slotsByDate[dStr].push(parseInt(hour, 10));
      });
      await saveAvailability(memberId, currentRoom.id, slotsByDate);
      const members = await listMembers(currentRoom.id);
      setCurrentRoom((prev) => ({ ...prev, participantCount: members.length }));
      showToast(`Schedule saved for ${trimmed}!`);
      setActiveTab('dashboard');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save schedule.');
      if (!currentUser) {
        setTurnstileToken(null);
        turnstileRef.current?.reset();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    setIsLoading(true);
    try {
      if (currentRoom && currentUser) {
        await deleteMember(currentRoom.id, currentUser.id);
        forgetDeviceMember(currentRoom.id);
      }
      removeStorage(LAST_ROOM_KEY);
      showToast('Left the plan.');
      navigate('/create');
    } catch (err) {
      showToast(err.message || 'Failed to leave the plan.');
      setIsLoading(false);
    }
  };

  const copyShareLink = () => {
    if (!currentRoom) return;
    const url = `${window.location.origin}/room/${currentRoom.room_code}`;
    navigator.clipboard?.writeText(url)
      .then(() => showToast('Room link copied to clipboard!'))
      .catch(() => showToast(url));
  };

  const handleConfirmDate = async () => {
    setIsLoading(true);
    try {
      const { date, startHour, endHour } = confirmModalData;
      const updated = await confirmRoom(currentRoom.id, currentUser.id, date, hourToClock(startHour), hourToClock(endHour));
      setCurrentRoom((prev) => ({ ...prev, ...updated }));
      setConfirmModalData(null);
      showToast('Plan confirmed and locked!');
    } catch (err) {
      showToast(err.message || 'Error confirming plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async () => {
    setIsLoading(true);
    try {
      const updated = await unlockRoom(currentRoom.id, currentUser.id);
      setCurrentRoom((prev) => ({ ...prev, ...updated }));
      showToast('Room unlocked!');
    } catch (err) {
      showToast(err.message || 'Error unlocking.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentRoom) {
    return (
      <>
        <Navbar />
        <Toast message={toast} />
        <main className="page-main">
          <div className="page-loading" role="status">
            <div className="loading-spinner" />
            <div className="loading-text">Loading room...</div>
          </div>
        </main>
      </>
    );
  }

  const roomForViews = {
    ...currentRoom,
    code: currentRoom.room_code,
    startDate: currentRoom.date_from,
    endDate: currentRoom.date_to,
  };

  return (
    <>
      <Navbar
        isRoomPage
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLeaveRoom={currentUser ? () => setLeaveOpen(true) : handleLeaveRoom}
      />
      <Toast message={toast} />
      {isLoading && (
        <div className="loading-overlay" role="status">
          <div className="loading-spinner" />
          <span className="loading-text">Loading...</span>
        </div>
      )}
      <main className="page-main room-main">
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
        {activeTab === 'mark' && !currentUser && currentRoom.status !== 'confirmed' && (
          <BotCheck ref={turnstileRef} action="join-room" onToken={setTurnstileToken} />
        )}
        {activeTab === 'dashboard' && (
          <DashboardView
            room={roomForViews}
            currentUser={currentUser}
            onRefresh={loadRoomData}
            onLockInDate={setConfirmModalData}
            onUnlockRoom={handleUnlock}
            showToast={showToast}
          />
        )}
      </main>

      {confirmModalData && (
        <ConfirmDateModal
          dateDetails={confirmModalData}
          planName={currentRoom.name}
          busy={isLoading}
          onClose={() => setConfirmModalData(null)}
          onConfirm={handleConfirmDate}
        />
      )}

      {leaveOpen && (
        <ConfirmDialog
          title="Leave this plan?"
          confirmLabel="Leave plan"
          danger
          busy={isLoading}
          onClose={() => setLeaveOpen(false)}
          onConfirm={handleLeaveRoom}
        >
          <p>Your name and marked schedule will be removed from “{currentRoom.name}”.</p>
        </ConfirmDialog>
      )}

      <Footer />
    </>
  );
}
