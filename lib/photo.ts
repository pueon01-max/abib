import { FRAMES } from './moments';

const SHOT_W = 720;
const SHOT_H = 800;

/** Grabs one mirrored, center-cropped JPEG frame from the live video. */
export function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = SHOT_W;
  canvas.height = SHOT_H;
  const ctx = canvas.getContext('2d')!;
  const { videoWidth: w, videoHeight: h } = video;
  const scale = Math.max(SHOT_W / w, SHOT_H / h);
  ctx.translate(SHOT_W, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, (SHOT_W - w * scale) / 2, (SHOT_H - h * scale) / 2, w * scale, h * scale);
  return canvas.toDataURL('image/jpeg', 0.9);
}

/** Average brightness of the frame, 0–255. */
export function measureBrightness(video: HTMLVideoElement): number {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 16;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(video, 0, 0, 16, 16);
  const px = ctx.getImageData(0, 0, 16, 16).data;
  let total = 0;
  for (let i = 0; i < px.length; i += 4) total += (px[i] + px[i + 1] + px[i + 2]) / 3;
  return total / 256;
}

/** Stacks three shots into one printable photo strip. */
export async function composeStrip(shots: string[], frameIndex: number): Promise<string> {
  const frame = FRAMES[frameIndex];
  const pad = 40;
  const width = SHOT_W + pad * 2;
  const height = 2700;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = frame.bg;
  ctx.fillRect(0, 0, width, height);

  for (const [i, src] of shots.entries()) {
    const img = new Image();
    img.src = src;
    await img.decode();
    ctx.drawImage(img, pad, pad + i * (SHOT_H + 25), SHOT_W, SHOT_H);
  }

  ctx.fillStyle = frame.text;
  ctx.font = '70px Georgia';
  ctx.fillText('Abib', pad, 2580);
  ctx.font = '20px Arial';
  ctx.fillText('CALM WEEKEND', 450, 2560);
  ctx.font = '18px Arial';
  ctx.fillText('A LITTLE MOMENT, JUST FOR YOU.', pad, 2640);
  return canvas.toDataURL('image/jpeg', 0.92);
}

export function downloadImage(dataUrl: string, filename = 'Abib-calm-weekend.jpg') {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

/** Uses the native share sheet when available, otherwise copies the link to the clipboard. */
export async function shareMoment({ url, image }: { url: string; image?: string }): Promise<'shared' | 'copied' | 'cancelled'> {
  const text = '#ABIBCALMWEEKEND';
  try {
    if (navigator.share) {
      const data: ShareData = { title: 'My calm weekend', text, url };
      if (image) {
        const blob = await (await fetch(image)).blob();
        const files = [new File([blob], 'Abib-calm-weekend.jpg', { type: 'image/jpeg' })];
        if (navigator.canShare?.({ files })) data.files = files;
      }
      await navigator.share(data);
      return 'shared';
    }
    await navigator.clipboard.writeText(`${url} ${text}`);
    return 'copied';
  } catch (e) {
    if ((e as Error).name === 'AbortError') return 'cancelled';
    throw e;
  }
}
