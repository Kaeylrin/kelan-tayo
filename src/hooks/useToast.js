import { useState, useRef, useCallback, useEffect } from 'react';

/** Small toast state helper. Returns [message, showToast]. */
export function useToast(duration = 2800) {
  const [message, setMessage] = useState('');
  const timer = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(timer.current);
    setMessage(msg);
    timer.current = setTimeout(() => setMessage(''), duration);
  }, [duration]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return [message, showToast];
}
