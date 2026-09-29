'use client';

import { useCallback, useState } from 'react';
import { Toaster } from 'sonner';
import { Button, Sheet } from '@/components/common';
import { Home } from '@/components/screens/home';
import { LabelStudio } from '@/components/screens/label-studio';
import { PhotoBooth } from '@/components/screens/photo-booth';
import { Routine } from '@/components/screens/routine';
import { SavedResult } from '@/components/screens/saved-result';
import { Volume2, VolumeX, Plus, ArrowUpRight } from 'lucide-react';
import { useAmbientSound } from '@/hooks/use-ambient-sound';
import { useIdleReset } from '@/hooks/use-idle-reset';

export type Route = 'home' | 'photo' | 'label' | 'routine';

export function App({ resultId }: { resultId?: string }) {
  const sound = useAmbientSound();
  const [about, setAbout] = useState(false);
  const [route, setRoute] = useState<Route | 'result'>(resultId ? 'result' : 'home');
  // Each navigation remounts the screen, so no photo or form data leaks into the next visitor's session.
  const [visit, setVisit] = useState(0);

  const go = useCallback((next: Route) => {
    if (location.search) history.replaceState(null, '', location.pathname);
    setVisit((v) => v + 1);
    setRoute(next);
    window.scrollTo({ top: 0 });
  }, []);

  const idle = useIdleReset(route === 'photo' || route === 'label', () => go('home'));

  return (
    <div className={`abib-app route-${route}`}>
      <header className="brand-header">
        <button className="brand-wordmark" onClick={()=>go('home')} aria-label="Abib 홈">Abib<span>CALM<br/>WEEKEND</span></button>
        <nav aria-label="체험 메뉴"><button className={route==='photo'?'active':''} onClick={()=>go('photo')}>Photobooth</button><button className={route==='label'?'active':''} onClick={()=>go('label')}>Personal label</button><button className={route==='routine'?'active':''} onClick={()=>go('routine')}>Your routine</button></nav>
        <div className="header-tools"><button onClick={sound.toggle} aria-label={sound.on?'배경음 끄기':'배경음 켜기'}>{sound.on?<Volume2 size={18}/>:<VolumeX size={18}/>}</button><button onClick={()=>setAbout(true)} aria-label="캘름 위켄드 소개"><Plus size={22}/></button></div>
      </header>
      <Toaster position="top-center" toastOptions={{ className: 'font-sans' }} />
      {route === 'home' && <Home key={visit} go={go} />}
      {route === 'photo' && <PhotoBooth key={visit} go={go} />}
      {route === 'label' && <LabelStudio key={visit} go={go} />}
      {route === 'routine' && <Routine key={visit} go={go} />}
      {route === 'result' && resultId && <SavedResult id={resultId} go={go} />}

      <footer className="brand-footer"><button onClick={()=>go('home')} className="footer-wordmark">Abib</button><span>본연의 아름다움, 그 시작.<br/>CALM WEEKEND / SINGAPORE</span><span className="footer-note">브랜드 체험 콘셉트 · 실제 주문·배송은 이뤄지지 않아요.<br/>© 2026 · YOUR PACE LOOKS GOOD ON YOU.</span></footer>
      <Sheet open={about} onClose={()=>setAbout(false)} title={'A little space.\nJust for you.'} description="싱가포르의 주말에서 출발한 아비브 브랜드 체험이에요. 세 컷의 사진과 나만의 라벨로, 일상에서 잠깐 나에게 돌아오는 시간을 만들어 보세요. 저장한 결과는 링크로 24시간 동안 확인할 수 있어요."><Button onClick={()=>{setAbout(false);go('photo')}}>내 순간 남기기</Button></Sheet>
      <Sheet open={idle.warning} onClose={idle.dismiss} title={'아직 체험 중이신가요?'} description="잠시 후 다음 방문자를 위해 처음 화면으로 돌아가요.">
        <Button onClick={idle.dismiss}>계속할게요</Button>
      </Sheet>
    </div>
  );
}
