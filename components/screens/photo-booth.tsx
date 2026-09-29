'use client';

import { useEffect, useRef, useState, type ReactNode, type ChangeEvent } from 'react';
import { Camera, Clock, Download, Lock, RotateCcw, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, ChoiceList, Notice, QrCard, Screen, StepCount, Title } from '@/components/common';
import { PhotoStrip, PhotoStage } from '@/components/visuals';
import { useCamera } from '@/hooks/use-camera';
import { saveMoment, type SavedLink } from '@/lib/api';
import { FRAMES } from '@/lib/moments';
import { captureFrame, composeStrip, downloadImage, measureBrightness, shareMoment } from '@/lib/photo';
import type { Route } from '@/components/app';

const MAX_SESSIONS = 3;
const SHOTS = 3;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Step = 'intro' | 'capture' | 'frame' | 'done';

export function PhotoBooth({ go }: { go: (r: Route) => void }) {
  const { videoRef, attachVideo, status: cameraStatus, playable, error: cameraError, start: startCamera, stop: stopCamera, resume } = useCamera();
  const [step, setStep] = useState<Step>('intro');
  const [shots, setShots] = useState<string[]>([]);
  const [sessions, setSessions] = useState(0);
  const [frame, setFrame] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [dim, setDim] = useState(false);
  const [saving, setSaving] = useState(false);
  const [strip, setStrip] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing,setImporting]=useState(false);
  const [imported,setImported]=useState<string[]>([]);
  const [link, setLink] = useState<SavedLink | null>(null);

  // Bumped on unmount so an in-flight countdown stops touching state.
  const runRef = useRef(0);
  useEffect(() => () => void runRef.current++, []);

  useEffect(() => {
    if (cameraStatus !== 'ready') return;
    const id = setInterval(() => {
      const v = videoRef.current;
      if (v?.videoWidth) setDim(measureBrightness(v) < 45);
    }, 2000);
    return () => clearInterval(id);
  }, [cameraStatus, videoRef]);

  async function openCamera() {
    if (await startCamera()) setStep('capture');
  }

  async function takePhotos() {
    if(capturing) return;
    if(!videoRef.current?.videoWidth){toast.error('카메라를 준비하고 있어요. 잠시 후 다시 눌러주세요.');return;}
    const run = ++runRef.current;
    setCapturing(true);
    const out: string[] = [];
    for (let i = 0; i < SHOTS; i++) {
      for (let n = 3; n > 0; n--) {
        if (run !== runRef.current) return;
        setCount(n);
        await sleep(1000);
      }
      const video = videoRef.current;
      if (run !== runRef.current) return;
      if (!video?.videoWidth) { setCapturing(false); setCount(null); toast.error('카메라 연결을 확인하고 다시 시도해 주세요.'); return; }
      setCount(null);
      out.push(captureFrame(video));
      setFlash(true);
      await sleep(150);
      setFlash(false);
    }
    stopCamera();
    setShots(out);
    setSessions((s) => s + 1);
    setCapturing(false);
    setStep('frame');
  }

  async function save() {
    if(saving) return;
    setSaving(true);
    try {
      const image = await composeStrip(shots, frame);
      setStrip(image);
      setLink(await saveMoment({ kind: 'photo', image }));
      setStep('done');
    } catch {
      toast.error('저장하지 못했어요. 사진은 그대로 있으니 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  async function share() {
    if (!link) return;
    try {
      const result = await shareMoment({ url: link.url, image: strip });
      if (result === 'copied') toast.success('링크와 해시태그를 복사했어요.');
    } catch {
      toast.error('공유할 수 없어요. 사진은 다운로드할 수 있어요.');
    }
  }

  const back = () => {
    if (step === 'capture' && !capturing) {
      stopCamera();
      setStep(shots.length ? 'frame' : 'intro');
    } else go('home');
  };

  async function importPhotos(e:ChangeEvent<HTMLInputElement>){
    const files=Array.from(e.target.files||[]);e.target.value='';if(!files.length||importing)return;
    setImporting(true);
    try{
      const next=[...imported];
      for(const file of files.slice(0,3-next.length)){
        if(!file.type.startsWith('image/'))throw Error('사진 파일을 선택해 주세요.');
        if(file.size>20000000)throw Error('사진은 한 장당 20MB 이하로 선택해 주세요.');
        const url=URL.createObjectURL(file);
        try{const image=new Image();image.src=url;await image.decode();const c=document.createElement('canvas');c.width=720;c.height=800;const ctx=c.getContext('2d')!;ctx.fillStyle='#f4f2ed';ctx.fillRect(0,0,720,800);const scale=Math.max(720/image.naturalWidth,800/image.naturalHeight);ctx.drawImage(image,(720-image.naturalWidth*scale)/2,(800-image.naturalHeight*scale)/2,image.naturalWidth*scale,image.naturalHeight*scale);next.push(c.toDataURL('image/jpeg',.9))}finally{URL.revokeObjectURL(url)}
      }
      if(next.length===3){stopCamera();setShots(next);setImported([]);setStep('frame')}else{setImported(next);toast.info(`${next.length}/3장 선택했어요. 나머지 사진을 추가해 주세요.`)}
    }catch(e){toast.error(e instanceof Error?e.message:'사진을 읽지 못했어요. JPG 또는 PNG로 다시 시도해 주세요.')}
    finally{setImporting(false)}
  }
  const importControl=<><input ref={fileRef} type="file" accept="image/*" capture="user" multiple onChange={importPhotos} className="sr-only" aria-label="촬영하거나 사진 3장 선택"/><Button variant="weak" disabled={importing} onClick={()=>fileRef.current?.click()}>{importing?'사진을 준비하는 중…':imported.length?`사진 추가하기 · ${imported.length}/3장`:'기기 카메라·사진으로 시작'}</Button>{imported.length>0&&<Button variant="ghost" onClick={()=>setImported([])}>선택한 사진 초기화</Button>}</>;

  const scene = step==='capture' ? <PhotoStage><div className="camera-viewport">
          {cameraStatus === 'ready' && <video ref={attachVideo} muted playsInline autoPlay className="size-full object-cover" />}
          <div className="pointer-events-none absolute inset-[14%_16%] rounded-[45%] border border-white/50" />
          {count !== null && (
            <div key={count} aria-live="assertive" className="animate-countdown absolute inset-0 grid place-items-center text-[120px] font-bold text-white drop-shadow-lg">
              {count}
            </div>
          )}
          {flash && <div className="animate-out fade-out absolute inset-0 bg-white duration-150" />}
        </div></PhotoStage> : <PhotoStage shots={shots} frame={frame} printing={step==='done'}/>;

  if (step === 'intro')
    return (
      <Screen scene={scene} className={`photo-experience photo-step-${step}`}
        onBack={() => go('home')}
        right={<StepCount step={1} total={3} />}
        cta={
          <>
            <Button onClick={openCamera} disabled={cameraStatus === 'loading'}>
              {cameraStatus === 'loading' ? '카메라 여는 중…' : cameraStatus === 'denied' ? '카메라 다시 시도하기' : '카메라 켜기'}
            </Button>
            {importControl}
            <Button variant="ghost" onClick={() => go('routine')}>
              카메라 없이 루틴 추천 받기
            </Button>
          </>
        }
      >
        <Title english="Come as you are." eyebrow="포토부스" sub="카메라 앞에서 잠시 쉬어가세요.">
          {'세 컷으로 남기는\n오늘의 나'}
        </Title>
        <ul className="flex flex-col gap-5">
          <InfoRow icon={<Camera size={20} />} title="사진 세 장을 찍어요" desc="포즈를 바꾸며 편하게 남겨보세요" />
          <InfoRow icon={<Clock size={20} />} title="3초 카운트다운" desc="각 사진은 카운트다운 후 찍혀요" />
          <InfoRow icon={<Lock size={20} />} title="저장 전까지 기기에만 있어요" desc="저장하면 24시간 동안 링크로 볼 수 있어요" />
        </ul>
        {cameraError && (
          <div className="mt-8">
            <Notice tone="error">{cameraError}</Notice><a href="/" target="_blank" rel="noopener noreferrer" className="camera-open-link">사이트를 새 창에서 열기 ↗</a>
          </div>
        )}
      </Screen>
    );

  if (step === 'capture')
    return (
      <Screen scene={scene} className={`photo-experience photo-step-${step}`}
        onBack={back}
        right={<StepCount step={1} total={3} />}
        cta={
          <Button onClick={takePhotos} disabled={capturing || !playable}>
            {capturing ? '촬영 중이에요…' : !playable ? '카메라 영상 준비 중…' : '촬영 시작'}
          </Button>
        }
      >
        {cameraError&&<div className="mb-5"><Notice tone="error">{cameraError}</Notice><Button variant="weak" onClick={resume}>영상 재생</Button></div>}
        <Title english="Breathe. Be you." sub={`${sessions + 1}번째 촬영 · 최대 ${MAX_SESSIONS}번`}>{'편하게,\n지금의 나를 담아요'}</Title>

        {dim && (
          <div className="mt-4">
            <Notice>조금 더 밝은 곳에서 찍어보세요.</Notice>
          </div>
        )}
      </Screen>
    );

  if (step === 'frame') {
    const left = MAX_SESSIONS - sessions;
    return (
      <Screen scene={scene} className={`photo-experience photo-step-${step}`}
        onBack={() => go('home')}
        right={<StepCount step={2} total={3} />}
        cta={
          <>
            <Button onClick={save} disabled={saving}>
              {saving ? '저장하는 중…' : '이 사진 저장하기'}
            </Button>
            <Button variant="ghost" onClick={openCamera} disabled={left <= 0 || saving}>
              <RotateCcw size={16} />
              {left > 0 ? `다시 찍기 (${left}번 남음)` : '다시 찍기를 모두 사용했어요'}
            </Button>
          </>
        }
      >
        <Title english="Frame the feeling." sub="가장 나다운 색을 골라보세요.">{'프레임을\n골라주세요'}</Title>
        {cameraError&&<Notice tone="error">{cameraError}</Notice>}
        <ChoiceList
          label="프레임 색상"
          value={frame}
          onChange={setFrame}
          options={FRAMES.map((f, i) => ({
            value: i,
            title: f.name,
            leading: <span className="h-8 w-6 shrink-0 rounded-md border" style={{ background: f.bg, borderColor: f.text }} />,
          }))}
        />
      </Screen>
    );
  }

  return (
    <Screen scene={scene} className={`photo-experience photo-step-${step}`}
      onBack={() => go('home')}
      right={<StepCount step={3} total={3} />}
      cta={
        <>
          <Button onClick={() => go('routine')}>나에게 맞는 루틴 찾기</Button>
          <Button variant="ghost" onClick={() => go('home')}>
            처음으로
          </Button>
        </>
      }
    >
      <Title english="A moment to keep." sub="오늘의 나를 휴대폰으로 가져가세요.">{'사진을\n저장했어요'}</Title>
      {link && <QrCard qr={link.qr} title="QR을 스캔하세요" desc="휴대폰에서 바로 열 수 있어요. 링크는 24시간 동안 유효해요." />}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="weak" size="md" onClick={() => downloadImage(strip)}>
          <Download size={18} /> 다운로드
        </Button>
        <Button variant="weak" size="md" onClick={share}>
          <Share2 size={18} /> 공유하기
        </Button>
      </div>
    </Screen>
  );
}

function InfoRow({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <li className="flex items-start gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-grey-100 text-grey-700">{icon}</span>
      <span>
        <span className="block text-[17px] font-semibold text-grey-900">{title}</span>
        <span className="mt-0.5 block text-[15px] text-grey-600">{desc}</span>
      </span>
    </li>
  );
}
