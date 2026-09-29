import { useEffect, useRef, useState } from 'react';

/** Soft generated brown noise; the AudioContext is created on first toggle to satisfy autoplay rules. */
export function useAmbientSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => () => void ctxRef.current?.close(), []);

  function toggle() {
    const ctx = ctxRef.current;
    if (!ctx) {
      ctxRef.current = createNoise();
      setOn(true);
    } else if (on) {
      ctx.suspend();
      setOn(false);
    } else {
      ctx.resume();
      setOn(true);
    }
  }

  return { on, toggle };
}

function createNoise() {
  const ctx = new AudioContext();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    last = (last + (Math.random() * 2 - 1) * 0.02) / 1.02;
    data[i] = last * 3;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const gain = ctx.createGain();
  gain.gain.value = 0.045;
  source.connect(gain).connect(ctx.destination);
  source.start();
  return ctx;
}
