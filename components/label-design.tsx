import { LABEL_COLORS, PRODUCTS, type LabelStyle } from '@/lib/moments';
import type { CSSProperties } from 'react';
export function LabelDesign({style='frosted',word='MYCALM',color=1,product=0}:{style?:LabelStyle;word?:string;color?:number;product?:number}){
 const c=LABEL_COLORS[color]||LABEL_COLORS[1];
 return <div className={`label-art label-${style}`} style={{'--tint':c.hex,'--ink':c.ink} as CSSProperties}>
 <div className="label-art-top"><span>Abib</span><small>CALM<br/>WEEKEND</small></div>
 {style==='frosted'?<><span className="label-edition">PERSONAL EDITION / 01</span><strong className="label-personal-word">{word}</strong><span className="label-rule"/><div className="label-art-bottom"><span>{PRODUCTS[product].label}<br/>YOUR SKIN. YOUR PACE.</span><span>30<br/>ML</span></div></>:<><span className="label-dedication">a little calm, for</span><strong className="label-personal-word">{word}</strong><span className="label-sign-off">yours, always.</span><div className="label-art-bottom"><span>{PRODUCTS[product].label}</span><span>N° 02 · 30 ML</span></div></>}
 </div>
}
