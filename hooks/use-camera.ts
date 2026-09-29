import { useCallback, useEffect, useRef, useState } from 'react';
export type CameraStatus = 'idle' | 'loading' | 'ready' | 'denied';
function explain(error: unknown): string {
 const name = error instanceof Error ? error.name : '';
 if(name==='NotAllowedError'||name==='SecurityError')return '카메라 사용이 허용되지 않았어요. 주소창의 사이트 설정에서 카메라를 허용하거나, 아래 기기 카메라·사진 버튼을 이용해 주세요.';
 if(name==='NotFoundError'||name==='DevicesNotFoundError')return '연결된 카메라를 찾지 못했어요. 기기 카메라로 찍거나 사진을 선택해 주세요.';
 if(name==='NotReadableError'||name==='TrackStartError')return '다른 앱에서 카메라를 사용 중이거나 연결할 수 없어요. 다른 카메라 앱을 닫은 뒤 다시 시도해 주세요.';
 if(name==='AbortError')return '카메라 연결이 중단됐어요. 다시 시도해 주세요.';
 return '카메라를 시작하지 못했어요. 새 브라우저 창에서 열거나 기기 카메라·사진을 이용해 주세요.';
}
export function useCamera(){
 const videoRef=useRef<HTMLVideoElement|null>(null),streamRef=useRef<MediaStream|null>(null),tokenRef=useRef(0),cleanupRef=useRef<()=>void>(()=>{});
 const [status,setStatus]=useState<CameraStatus>('idle'),[playable,setPlayable]=useState(false),[error,setError]=useState('');
 const release=useCallback(()=>{tokenRef.current++;cleanupRef.current();cleanupRef.current=()=>{};streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;if(videoRef.current)videoRef.current.srcObject=null},[]);
 const stop=useCallback(()=>{release();setStatus('idle');setPlayable(false);setError('')},[release]);
 const attachVideo=useCallback((video:HTMLVideoElement|null)=>{
  cleanupRef.current();cleanupRef.current=()=>{};videoRef.current=video;setPlayable(false);
  if(!video||!streamRef.current)return;
  const stream=streamRef.current,token=tokenRef.current;
  const ready=()=>{if(token===tokenRef.current&&video.videoWidth>0&&video.videoHeight>0){setPlayable(true);setError('')}};
  const failed=()=>{if(token===tokenRef.current){setPlayable(false);setError('카메라 영상에 문제가 생겼어요. 다시 연결하거나 기기 카메라·사진을 이용해 주세요.')}};
  video.muted=true;video.playsInline=true;video.autoplay=true;
  video.addEventListener('loadeddata',ready);video.addEventListener('playing',ready);video.addEventListener('error',failed);
  video.srcObject=stream;
  video.play().then(ready).catch(()=>{if(token===tokenRef.current)setError('카메라 영상 재생이 멈췄어요. 아래 ‘영상 재생’을 눌러 주세요.')});
  cleanupRef.current=()=>{video.removeEventListener('loadeddata',ready);video.removeEventListener('playing',ready);video.removeEventListener('error',failed)};
 },[]);
 const resume=useCallback(async()=>{const video=videoRef.current;if(!video)return;try{await video.play();if(video.videoWidth){setPlayable(true);setError('')}}catch{setError('영상을 재생할 수 없어요. 기기 카메라·사진을 이용해 주세요.')}},[]);
 const start=useCallback(async():Promise<boolean>=>{
  release();setPlayable(false);setError('');setStatus('loading');const token=tokenRef.current;
  if(!window.isSecureContext){setError('현재 창에서는 실시간 카메라를 사용할 수 없어요. HTTPS 주소를 새 브라우저 창에서 열거나, 기기 카메라·사진을 이용해 주세요.');setStatus('denied');return false}
  if(!navigator.mediaDevices?.getUserMedia){setError('이 브라우저는 실시간 카메라를 지원하지 않아요. Safari·Chrome에서 열거나 기기 카메라·사진을 이용해 주세요.');setStatus('denied');return false}
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{
   const request=navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'user'},width:{ideal:960},height:{ideal:1280}}});
   request.then(s=>{if(token!==tokenRef.current)s.getTracks().forEach(t=>t.stop())},()=>{});
   const stream=await Promise.race([request,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('CameraTimeout')),25000)})]);
   if(token!==tokenRef.current){stream.getTracks().forEach(t=>t.stop());return false}
   streamRef.current=stream;setStatus('ready');if(videoRef.current)attachVideo(videoRef.current);return true;
  }catch(e){if(token!==tokenRef.current)return false;release();setStatus('denied');setError(e instanceof Error&&e.message==='CameraTimeout'?'카메라 권한 응답을 기다리다 시간이 지났어요. 권한 창을 확인하고 다시 눌러 주세요.':explain(e));return false}
  finally{if(timer)clearTimeout(timer)}
 },[release,attachVideo]);
 useEffect(()=>release,[release]);
 return {videoRef,attachVideo,status,playable,error,start,stop,resume};
}
