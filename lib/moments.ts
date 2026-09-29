// Shared by the browser and the /api/moments route, so keep it free of DOM APIs.

export const PRODUCTS = [
  { name: '수분 세럼', desc: '히알루론산 · 수분 케어', label: 'HYDRATION SERUM', size: '30 ml / 1.01 fl. oz.', available: true },
  { name: '진정 세럼', desc: '어성초 · 데일리 진정', label: 'CALMING SERUM', size: '30 ml / 1.01 fl. oz.', available: true },
  { name: '젠틀 클렌저', desc: '산뜻한 하루의 시작', label: 'GENTLE CLEANSER', size: 'Coming soon', available: false },
] as const;

export const LABEL_COLORS = [
  { name: '클라우드', hex: '#f2f1eb', ink: '#28332c' },
  { name: '글레이셔', hex: '#c4d9ed', ink: '#28332c' },
  { name: '세이지', hex: '#c6d0bc', ink: '#28332c' },
  { name: '잉크', hex: '#303b43', ink: '#ffffff' },
] as const;

export const FRAMES = [
  { name: '클라우드', bg: '#f4f2ed', text: '#202723' },
  { name: '글레이셔', bg: '#bdd3eb', text: '#25384e' },
  { name: '애프터 아워스', bg: '#293732', text: '#f6f4e9' },
] as const;

export const MAX_WORD_LENGTH = 6;
export const DEFAULT_WORD = 'MYCALM';
export const BLOCKED_WORDS = /fuck|shit|씨발|시발|개새끼/i;
export const MOMENT_TTL_MS = 24 * 60 * 60 * 1000;

export type LabelStyle = 'frosted' | 'signature';
export type ReceiveMethod = 'pickup' | 'delivery';

export type PhotoMoment = { kind: 'photo'; image: string; created?: string };
export type DesignMoment = {
  kind: 'design';
  labelStyle?: LabelStyle;
  product: number;
  color: number;
  initials: string;
  method: ReceiveMethod;
  created?: string;
};
export type Moment = PhotoMoment | DesignMoment;
