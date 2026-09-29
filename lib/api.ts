import QRCode from 'qrcode';
import type { Moment } from './moments';

export type SavedLink = { id: string; url: string; qr: string };

export async function saveMoment(moment: Moment): Promise<SavedLink> {
  const res = await fetch('/api/moments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(moment),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  const { id } = (await res.json()) as { id: string };
  const url = `${location.origin}/?result=${id}`;
  // The moment is already saved; a QR failure should not look like a save failure.
  const qr = await QRCode.toDataURL(url, { margin: 1, width: 240, color: { dark: '#191f28', light: '#ffffff' } }).catch(() => '');
  return { id, url, qr };
}

export async function loadMoment(id: string): Promise<Moment> {
  const res = await fetch(`/api/moments?id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Load failed: ${res.status}`);
  return (await res.json()) as Moment;
}
