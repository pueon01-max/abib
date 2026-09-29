'use client';

import { useState, type FormEvent } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, ChoiceList, Field, inputClass, Notice, QrCard, Screen, StepCount, Title } from '@/components/common';
import { LabelDesign } from '@/components/label-design';
import { Bottle, ProductStage } from '@/components/visuals';
import { saveMoment, type SavedLink } from '@/lib/api';
import { BLOCKED_WORDS, DEFAULT_WORD, LABEL_COLORS, MAX_WORD_LENGTH, PRODUCTS, type ReceiveMethod, type LabelStyle } from '@/lib/moments';
import { shareMoment } from '@/lib/photo';
import type { Route } from '@/components/app';

const STEPS = ['product', 'color', 'word', 'receive', 'done'] as const;
type Step = (typeof STEPS)[number];

const isContact = (v: string) => /^\S+@\S+\.\S+$/.test(v) || /^[+\d\s()-]{7,20}$/.test(v);

export function LabelStudio({ go }: { go: (r: Route) => void }) {
  const [step, setStep] = useState<Step>('product');
  const [product, setProduct] = useState(0);
  const [color, setColor] = useState(1);
  const [labelStyle,setLabelStyle]=useState<LabelStyle>('frosted');
  const [word, setWord] = useState('');
  const [method, setMethod] = useState<ReceiveMethod>('pickup');
  const [notify, setNotify] = useState<'pager' | 'sms'>('pager');
  // Contact and address are only validated for the demo flow; they are never sent to the server.
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [link, setLink] = useState<SavedLink | null>(null);

  const index = STEPS.indexOf(step);
  const shownWord = word || DEFAULT_WORD;
  const blocked = BLOCKED_WORDS.test(word);
  const needsContact = method === 'delivery' || notify === 'sms';

  const back = () => (index > 0 && step !== 'done' ? setStep(STEPS[index - 1]) : go('home'));

  // The form is taller than the screen, so bring the error into view.
  function fail(message: string) {
    setError(message);
    requestAnimationFrame(() => document.getElementById('receive-error')?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setError('');
    if (method === 'delivery' && (!address.trim() || !contact.trim())) return fail('주소와 연락처를 입력해 주세요.');
    if (needsContact && !isContact(contact.trim())) return fail('올바른 이메일이나 전화번호를 입력해 주세요.');
    setSaving(true);
    try {
      setLink(await saveMoment({ kind: 'design', product, color, labelStyle, initials: shownWord, method }));
      setContact('');
      setAddress('');
      setStep('done');
    } catch {
      fail('디자인을 저장하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  async function share() {
    if (!link) return;
    try {
      const result = await shareMoment({ url: link.url });
      if (result === 'copied') toast.success('링크와 해시태그를 복사했어요.');
    } catch {
      toast.error('지금은 공유할 수 없어요.');
    }
  }

  const scene = <ProductStage labelStyle={labelStyle} product={product} color={color} word={shownWord} complete={step === 'done'} />;
  const counter = step !== 'done' && <StepCount step={index + 1} total={4} />;

  if (step === 'product')
    return (
      <Screen scene={scene} className={`label-experience label-step-${step}`} onBack={back} right={counter} cta={<Button onClick={() => setStep('color')}>다음</Button>}>
        <Title english="Your little essential." eyebrow="나만의 라벨" sub="지금 피부에 필요한 것 하나만요.">
          {'어떤 제품으로\n만들까요?'}
        </Title>
        <ChoiceList
          label="제품"
          value={product}
          onChange={setProduct}
          options={PRODUCTS.map((p, i) => ({ value: i, title: p.name, desc: p.desc, disabled: !p.available, badge: p.available ? undefined : '준비 중' }))}
        />
        <p className="mt-4 text-[13px] text-grey-500">제품 패키지는 체험용 콘셉트 이미지예요.</p>
      </Screen>
    );

  if (step === 'color')
    return (
      <Screen scene={scene} className={`label-experience label-step-${step}`} onBack={back} right={counter} cta={<Button onClick={() => setStep('word')}>다음</Button>}>
        <Title english="Two ways to be you." sub="반투명한 프로스트, 부드러운 시그니처. 당신다운 라벨을 골라보세요.">라벨의 분위기를 골라주세요</Title>
        <RadioGroup aria-label="라벨 디자인" value={labelStyle} onValueChange={v=>setLabelStyle(v as LabelStyle)} className="label-style-options">{(['frosted','signature'] as const).map((variant,i)=><label key={variant} className={labelStyle===variant?'selected':''}><div className="label-style-sample"><LabelDesign style={variant} word={shownWord} color={color} product={product}/></div><div className="label-style-name"><span>0{i+1} / {variant.toUpperCase()}</span><RadioGroupItem value={variant}/></div><p>{i===0?'반투명 필름 · 선명한 이니셜':'밀크 화이트 · 나만의 서명'}</p></label>)}</RadioGroup>
        
        <RadioGroup aria-label="라벨 색상" value={String(color)} onValueChange={v=>setColor(Number(v))} className="label-swatches">
          {LABEL_COLORS.map((c,i)=><label key={c.name} className={color===i?'selected':''}><RadioGroupItem value={String(i)} style={{background:c.hex}} aria-label={c.name}/><span>{c.name}</span></label>)}
        </RadioGroup>
      </Screen>
    );

  if (step === 'word')
    return (
      <Screen scene={scene} className={`label-experience label-step-${step}`} onBack={back} right={counter} cta={<Button disabled={blocked} onClick={() => setStep('receive')}>이대로 할게요</Button>}>
        <Title english="A word, just yours." sub={`이니셜이나 짧은 마음을 남겨보세요. 최대 ${MAX_WORD_LENGTH}글자.`}>{'라벨에 넣을\n문구를 적어주세요'}</Title>
        
        <div className="label-word-preview"><LabelDesign style={labelStyle} word={shownWord} color={color} product={product}/></div>
        <Field label="나의 문구" hint={<span className={blocked ? 'text-[#e42939]' : ''}>{blocked ? '다른 문구로 바꿔주세요.' : `${word.length}/${MAX_WORD_LENGTH} · 비워두면 ${DEFAULT_WORD}`}</span>}>
          <input
            className={`${inputClass} text-[22px] font-semibold tracking-[0.1em] uppercase`}
            maxLength={MAX_WORD_LENGTH}
            value={word}
            placeholder={DEFAULT_WORD}
            onChange={(e) => setWord(e.target.value.toUpperCase())}
            autoComplete="off"
          />
        </Field>
      </Screen>
    );

  if (step === 'receive')
    return (
      <Screen scene={scene} className={`label-experience label-step-${step}`}
        onBack={back}
        right={counter}
        cta={
          <Button type="submit" form="receive-form" disabled={saving}>
            {saving ? '저장하는 중…' : '디자인 저장하기'}
          </Button>
        }
      >
        <Title english="From here, to you.">{'어떻게\n받아볼까요?'}</Title>
        <div className="mb-6 flex items-center gap-4 rounded-2xl bg-grey-50 p-4">
          <Bottle labelStyle={labelStyle} product={product} color={color} word={shownWord} className="h-20 shrink-0" />
          <div className="text-[15px] text-grey-600">
            <p className="text-[17px] font-semibold text-grey-900">{PRODUCTS[product].name}</p>
            {labelStyle.toUpperCase()} · {LABEL_COLORS[color].name} · {shownWord}
          </div>
        </div>
        <form id="receive-form" onSubmit={submit} className="flex flex-col gap-6">
          <ChoiceList
            label="수령 방법"
            value={method}
            onChange={setMethod}
            options={[
              { value: 'pickup', title: '현장에서 받기', desc: '약 15분 소요' },
              { value: 'delivery', title: '배송으로 받기', desc: '주소를 입력해요' },
            ]}
          />
          {method === 'pickup' && (
            <ChoiceList
              label="알림 방법"
              value={notify}
              onChange={setNotify}
              options={[
                { value: 'pager', title: '진동벨로 알려주세요' },
                { value: 'sms', title: '문자로 알려주세요' },
              ]}
            />
          )}
          {needsContact && (
            <Field label={method === 'pickup' ? '전화번호' : '이메일 또는 전화번호'}>
              <input className={inputClass} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="hello@example.com / +65 …" maxLength={100} />
            </Field>
          )}
          {method === 'delivery' && (
            <Field label="배송 주소">
              <textarea className={`${inputClass} min-h-24 resize-none`} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="도로명, 동·호수, 우편번호" maxLength={300} />
            </Field>
          )}
          {error && (
            <div id="receive-error">
              <Notice tone="error">{error}</Notice>
            </div>
          )}
          <Notice>체험용 화면이에요. 실제 제작·배송은 접수되지 않고, 입력한 연락처와 주소는 저장하지 않아요.</Notice>
        </form>
      </Screen>
    );

  return (
    <Screen scene={scene} className={`label-experience label-step-${step}`}
      onBack={() => go('home')}
      cta={
        <>
          <Button onClick={() => go('routine')}>나에게 맞는 루틴 찾기</Button>
          <Button variant="ghost" onClick={() => go('home')}>
            처음으로
          </Button>
        </>
      }
    >
      <Title english="Made by you." sub="체험용 디자인이에요. 실제 주문은 아니에요.">{'나만의 아비브가\n완성됐어요'}</Title>
      
      {link && <QrCard qr={link.qr} title="QR로 다시 보기" desc="휴대폰에서 완성한 디자인을 확인하세요. 24시간 동안 유효해요." />}
      <Button variant="weak" size="md" className="mt-3 w-full" onClick={share}>
        <Share2 size={18} /> 공유하기
      </Button>
    </Screen>
  );
}
