'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button, Notice, Screen, Title } from '@/components/common';
import { Bottle, ProductStage } from '@/components/visuals';
import { loadMoment } from '@/lib/api';
import { LABEL_COLORS, PRODUCTS, type Moment } from '@/lib/moments';
import { downloadImage } from '@/lib/photo';
import type { Route } from '@/components/app';

type State = { status: 'loading' } | { status: 'error' } | { status: 'ok'; moment: Moment };

/** Opened from a QR code: /?result=<id> */
export function SavedResult({ id, go }: { id: string; go: (r: Route) => void }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    loadMoment(id)
      .then((moment) => active && setState({ status: 'ok', moment }))
      .catch(() => active && setState({ status: 'error' }));
    return () => {
      active = false;
    };
  }, [id]);

  const moment = state.status === 'ok' ? state.moment : null;

  return (
    <Screen scene={moment?.kind==='design'?<ProductStage labelStyle={moment.labelStyle} product={moment.product} color={moment.color} word={moment.initials} complete/>:moment?.kind==='photo'?<div className="saved-photo-world"><img src={moment.image} alt="저장한 아비브 포토 스트립"/></div>:undefined}
      cta={
        <>
          {moment?.kind === 'photo' && (
            <Button onClick={() => downloadImage(moment.image)}>
              <Download size={18} /> 사진 다운로드
            </Button>
          )}
          <Button variant={moment?.kind === 'photo' ? 'ghost' : 'primary'} onClick={() => go('home')}>
            나도 해보기
          </Button>
        </>
      }
    >
      <Title english="Yours to keep." eyebrow="ABIB CALM WEEKEND">{'간직하고 싶은\n오늘의 순간'}</Title>
      {state.status === 'loading' && <p className="text-[17px] text-grey-500">불러오는 중이에요…</p>}
      {state.status === 'error' && <Notice tone="error">만료되었거나 찾을 수 없는 링크예요. 새로 체험해 보세요.</Notice>}
      
      {moment?.kind === 'design' && (
        <>
          <p className="mt-6 text-[20px] font-bold text-grey-900">{PRODUCTS[moment.product].name}</p>
          <p className="mt-1 text-[15px] text-grey-600">
            {(moment.labelStyle||'frosted').toUpperCase()} · {LABEL_COLORS[moment.color].name} · {moment.method === 'pickup' ? '현장 수령' : '배송'} 선택 · 체험용 디자인
          </p>
        </>
      )}
    </Screen>
  );
}
