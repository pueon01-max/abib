'use client';

import { useState } from 'react';
import { Button, ChoiceList, Screen, Title } from '@/components/common';
import { Bottle, ProductStage } from '@/components/visuals';
import type { Route } from '@/components/app';

const CONCERNS = [
  { id: 'dry', title: '수분이 필요해요', desc: '당기거나 건조하게 느껴져요', emoji: '💧', ritual: '수분 루틴', product: 0, middle: '수분을 얇게 레이어링해요' },
  { id: 'sensitive', title: '편안한 케어가 필요해요', desc: '오늘은 피부가 예민해요', emoji: '🌿', ritual: '진정 루틴', product: 1, middle: '케어는 단순하게 유지해요' },
  { id: 'simple', title: '가볍게 시작하고 싶어요', desc: '단계를 줄이고 싶어요', emoji: '☁️', ritual: '미니멀 루틴', product: 0, middle: '가볍게 보습해요' },
] as const;
type Concern = (typeof CONCERNS)[number]['id'];

export function Routine({ go }: { go: (r: Route) => void }) {
  const [concern, setConcern] = useState<Concern>('dry');
  const [showResult, setShowResult] = useState(false);
  const picked = CONCERNS.find((c) => c.id === concern)!;

  if (!showResult)
    return (
      <Screen className="routine-experience" scene={<ProductStage product={picked.product} word={showResult?"MYCALM":"YOURDAY"} color={1} complete={showResult}/>} onBack={() => go('home')} cta={<Button onClick={() => setShowResult(true)}>내 루틴 보기</Button>}>
        <Title english="Listen to your skin." eyebrow="오늘의 피부 루틴" sub="지금 가장 가까운 느낌을 골라주세요.">
          {'오늘 피부에\n무엇이 필요한가요?'}
        </Title>
        <ChoiceList
          label="피부 고민"
          value={concern}
          onChange={setConcern}
          options={CONCERNS.map((c) => ({ value: c.id, title: c.title, desc: c.desc,  }))}
        />
      </Screen>
    );

  const steps = [
    { title: '부드럽게 세안해요', desc: '미지근한 물로 가볍게 마무리해요.' },
    { title: picked.middle, desc: '피부에 잘 맞는 보습제를 얇게 발라주세요.' },
    { title: '자외선을 막아요', desc: '낮에는 자외선 차단제로 루틴을 마무리해요.' },
  ];

  return (
    <Screen className="routine-experience" scene={<ProductStage product={picked.product} word={showResult?"MYCALM":"YOURDAY"} color={1} complete={showResult}/>}
      onBack={() => setShowResult(false)}
      cta={
        <>
          <Button onClick={() => go('home')}>처음으로</Button>
          <Button variant="ghost" onClick={() => setShowResult(false)}>
            다시 고르기
          </Button>
        </>
      }
    >
      <Title english="Keep your calm." eyebrow={picked.ritual} sub="많이 더하기보다, 필요한 것만.">
        {'나를 위한\n세 단계 루틴'}
      </Title>
      <ol className="flex flex-col gap-6">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-[15px] font-bold text-white">{i + 1}</span>
            <div>
              <p className="text-[17px] font-semibold text-grey-900">{s.title}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-grey-600">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-10 text-[13px] leading-relaxed text-grey-500">
        일반적인 스킨케어 안내이며 피부 진단이 아니에요. 사용 중 불편함이 있으면 중단해 주세요.
      </p>
    </Screen>
  );
}
