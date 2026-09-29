import { useCallback, useEffect, useRef, useState } from 'react';

const WARN_AFTER_MS = 105_000;
const RESET_AFTER_MS = 120_000;

/** Kiosk guard: warns after inactivity, then calls onReset so the next visitor starts fresh. */
export function useIdleReset(active: boolean, onReset: () => void) {
  const rearmRef = useRef<() => void>(() => {});
  const [warning, setWarning] = useState(false);
  const onResetRef = useRef(onReset);
  useEffect(() => {
    onResetRef.current = onReset;
  });

  useEffect(() => {
    if (!active) return;
    let warnTimer: ReturnType<typeof setTimeout>;
    let resetTimer: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(warnTimer);
      clearTimeout(resetTimer);
      warnTimer = setTimeout(() => setWarning(true), WARN_AFTER_MS);
      resetTimer = setTimeout(() => {
        setWarning(false);
        onResetRef.current();
      }, RESET_AFTER_MS);
    };
    const onActivity = () => {
      setWarning(false);
      arm();
    };
    rearmRef.current = onActivity;
    arm();
    window.addEventListener('pointerdown', onActivity);
    window.addEventListener('keydown', onActivity);
    return () => {
      rearmRef.current = () => {};
      clearTimeout(warnTimer);
      clearTimeout(resetTimer);
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('keydown', onActivity);
    };
  }, [active]);

  return { warning: active && warning, dismiss: () => { setWarning(false); rearmRef.current(); } };
}
