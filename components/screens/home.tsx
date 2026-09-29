'use client';
import { useRef, type CSSProperties } from 'react';
import { ArrowUpRight, ArrowDown, Camera, Plus } from 'lucide-react';
import { Bottle, PhotoStrip } from '@/components/visuals';
import type { Route } from '@/components/app';

export function Home({go}:{go:(r:Route)=>void}){
 const hero=useRef<HTMLElement>(null);
 return <main className="brand-home"><section ref={hero} className="campaign-hero" onPointerMove={e=>{if(e.pointerType!=='mouse')return;const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--mx',String((e.clientX-r.left)/r.width-.5));e.currentTarget.style.setProperty('--my',String((e.clientY-r.top)/r.height-.5))}} onPointerLeave={e=>{e.currentTarget.style.setProperty('--mx','0');e.currentTarget.style.setProperty('--my','0')}}>
 <img className="campaign-image" src="/images/campaign.webp" alt="빛과 물결에 둘러싸인 아이스 블루 아비브 세럼" fetchPriority="high"/><div className="campaign-wash"/>
 <div className="campaign-kicker"><span>ABIB CALM WEEKEND</span><span>AN OPEN INVITATION TO SLOW DOWN.</span></div>
 <div className="campaign-copy"><p className="campaign-small">YOUR SKIN. YOUR PACE.</p><h1>Less noise.<br/><em>More you.</em></h1><p className="campaign-description">잠깐, 나에게 돌아오는 주말.<br/>사진 한 장, 작은 문구 하나로 남기는 나만의 아비브.</p></div><div className="campaign-actions"><button onClick={()=>go('photo')} className="campaign-button"><Camera size={17}/> 포토부스 시작하기 <ArrowUpRight size={19}/></button><button onClick={()=>go('label')} className="campaign-button secondary">나만의 라벨 만들기 <ArrowUpRight size={19}/></button></div>
 <div className="hero-floating-strip"><PhotoStrip/><span className="handwritten">just as<br/>you are.</span></div>
 <div className="campaign-foot"><span>01 — A LITTLE SPACE FOR YOURSELF</span><button onClick={()=>document.getElementById('experiences')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}>EXPLORE YOUR WEEKEND <ArrowDown size={15}/></button><span>SINGAPORE / CALM EDITION</span></div>
 </section>
 <section className="editorial-intro" id="experiences"><span className="eyebrow">LESS, BUT BETTER.</span><h2>Leave the rush.<br/>Keep the <em>feeling.</em></h2><p>더 많이 채우기보다, 온전히 나에게 머무는 시간.<br/>당신다운 순간을 만들고 가져가세요.</p></section>
 <section className="experience-diptych"><button className="editorial-card photo-editorial" onClick={()=>go('photo')}><img src="/images/portrait.webp" alt="포토부스에서 편안하게 나를 담는 순간" loading="lazy"/><div className="editorial-shade"/><div className="editorial-top"><span>01 / THE CALM PHOTOBOOTH</span><span>ABOUT 2 MIN</span></div><div className="card-photo-strip"><PhotoStrip frame={2}/></div><div className="editorial-card-caption"><div><h3>Keep this<br/><em>version of you.</em></h3><p>세 컷에 담는 지금의 나.</p></div><span className="circle-arrow"><ArrowUpRight size={28}/></span></div></button><button className="editorial-card label-editorial" onClick={()=>go('label')}><div className="editorial-top"><span>02 / THE PERSONAL LABEL STUDIO</span><span>ABOUT 3 MIN</span></div><span className="label-background-type" aria-hidden="true">yours.</span><div className="editorial-bottle"><Bottle word="ONLYME" color={1}/></div><div className="editorial-small-bottle"><Bottle word="MYCALM" color={2}/></div><div className="editorial-card-caption"><div><h3>A little less.<br/><em>A little more you.</em></h3><p>하나의 색, 여섯 글자. 나만의 아비브.</p></div><span className="circle-arrow"><ArrowUpRight size={28}/></span></div></button></section>
 <section className="routine-invitation"><div><span className="eyebrow">TAKE THE CALM WITH YOU</span><h2>A softer everyday.</h2><p>오늘의 기분을, 내일의 루틴으로.</p></div><button className="text-link" onClick={()=>go('routine')}>나에게 맞는 루틴 찾기 <ArrowUpRight size={24}/></button></section>
 </main>
}
