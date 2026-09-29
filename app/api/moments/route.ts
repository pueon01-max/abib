import { env } from 'cloudflare:workers';
import { BLOCKED_WORDS, LABEL_COLORS, MAX_WORD_LENGTH, MOMENT_TTL_MS, PRODUCTS, type Moment } from '@/lib/moments';

const MAX_BODY_BYTES = 6_000_000;
const ID_PATTERN = /^[a-f0-9-]{36}$/;
const JPEG_DATA_URL = /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/;

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

function bucket() {
  const b = env.BUCKET;
  if (!b) throw new Error('R2 binding `BUCKET` is unavailable');
  return b;
}

/** Returns a clean Moment, or null if the payload is not one we accept. */
function parseMoment(data: unknown): Moment | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const created = new Date().toISOString();

  if (d.kind === 'photo') {
    return typeof d.image === 'string' && JPEG_DATA_URL.test(d.image) ? { kind: 'photo', image: d.image, created } : null;
  }
  if (d.kind === 'design') {
    const { product, color, initials, method } = d;
    const labelStyle=d.labelStyle??'frosted';
    if(labelStyle!=='frosted'&&labelStyle!=='signature')return null;
    if (typeof product !== 'number' || PRODUCTS[product]?.available !== true) return null;
    if (typeof color !== 'number' || !(color in LABEL_COLORS)) return null;
    if (typeof initials !== 'string' || !initials || initials.length > MAX_WORD_LENGTH || BLOCKED_WORDS.test(initials)) return null;
    if (method !== 'pickup' && method !== 'delivery') return null;
    return { kind: 'design', product, color, initials, method, labelStyle, created };
  }
  return null;
}

export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return json({ error: 'Image is too large' }, 413);
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return json({ error: 'Image is too large' }, 413);

  let moment: Moment | null;
  try {
    moment = parseMoment(JSON.parse(text));
  } catch {
    moment = null;
  }
  if (!moment) return json({ error: 'Invalid moment' }, 400);

  try {
    const id = crypto.randomUUID();
    await bucket().put(`moments/${id}`, JSON.stringify(moment), { httpMetadata: { contentType: 'application/json' } });
    return json({ id });
  } catch (e) {
    console.error('Moment save unavailable', e);
    return json({ error: 'Unable to save this moment' }, 503);
  }
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id || !ID_PATTERN.test(id)) return json({ error: 'Not found' }, 404);

  try {
    const obj = await bucket().get(`moments/${id}`);
    if (!obj) return json({ error: 'Not found' }, 404);
    const data = await obj.json<Moment>();
    // Also configure an R2 lifecycle rule: this check only removes objects that someone opens.
    if (!data.created || Date.now() - new Date(data.created).getTime() > MOMENT_TTL_MS) {
      await bucket().delete(`moments/${id}`);
      return json({ error: 'Expired' }, 410);
    }
    return json(data);
  } catch (e) {
    console.error('Moment load unavailable', e);
    return json({ error: 'Unavailable' }, 503);
  }
}
