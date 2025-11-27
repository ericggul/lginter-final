import styled from 'styled-components';
import { useEffect, useMemo, useState } from 'react';
import { fonts } from '../sections/styles/tokens';

const ReasonRoot = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  padding: 2rem;
  box-sizing: border-box;
  overflow: auto;
`;

const ReasonInner = styled.div`
  width: 86%;
  margin: 0 auto;
  word-break: keep-all;
  overflow-wrap: break-word;
  text-align: center;
  font-family: ${fonts.ui};
  color: #111;
  opacity: ${(p) => (p.$fade ? 0 : 1)};
  filter: ${(p) => (p.$fade ? 'blur(6px)' : 'none')};
  transition: opacity 1200ms ease, filter 1200ms ease;
`;

const ReasonParagraph = styled.p`
  font-size: 1.25rem;
  line-height: 1.6;
  font-weight: ${(p) => (p.$strong ? 800 : 500)};
  margin-top: ${(p) => (p.$first ? 0 : '1.5rem')};
`;

const Caret = styled.span`
  display: inline-block;
  width: 2px;
  height: 1.2rem;
  background: #000;
  margin-left: 3px;
  animation: blink 1s infinite;
  vertical-align: middle;
`;

const Bold = styled.span`
  font-weight: 800;
`;

const SwapWrap = styled.span`
  position: relative;
  display: inline-block;
  min-width: 3ch;
`;

const SwapFront = styled.span`
  position: absolute; left: 0; top: 0;
  white-space: nowrap;
  opacity: ${(p) => (p.$show ? 1 : 0)};
  transition: opacity 600ms ease;
`;

const SwapBack = styled.span`
  position: relative;
  white-space: nowrap;
  opacity: ${(p) => (p.$show ? 1 : 0)};
  transition: opacity 600ms ease;
`;

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const v = m[1];
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}
function rgbToHsl(r, g, b) {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
    switch (max) {
      case R: h = (G - B) / d + (G < B ? 6 : 0); break;
      case G: h = (B - R) / d + 2; break;
      case B: h = (R - G) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function approximateKoreanColorName(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return '부드러운 색감';
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const tone = l >= 75 ? '밝은 ' : l <= 30 ? '짙은 ' : s < 25 ? '중립적인 ' : '';
  let hueName = '색';
  if (h < 15 || h >= 345) hueName = '레드';
  else if (h < 35) hueName = '오렌지';
  else if (h < 55) hueName = '옐로우';
  else if (h < 100) hueName = '옐로우그린';
  else if (h < 155) hueName = '그린';
  else if (h < 190) hueName = '민트';
  else if (h < 220) hueName = '스카이블루';
  else if (h < 245) hueName = '블루';
  else if (h < 285) hueName = '인디고';
  else if (h < 325) hueName = '퍼플';
  else hueName = '마젠타';
  const pretty = {
    레드: '따뜻한 레드',
    오렌지: '살구빛 오렌지',
    옐로우: '밝은 옐로우',
    옐로우그린: '라임그린',
    그린: '포레스트 그린',
    민트: '민트',
    스카이블루: '스카이블루',
    블루: '딥 블루',
    인디고: '인디고',
    퍼플: '부드러운 퍼플',
    마젠타: '로지 마젠타',
  }[hueName] || '부드러운 색감';
  return `${tone}${pretty}`.trim();
}

function ColorSwap({ hex, enabled }) {
  const [showHex, setShowHex] = useState(true);
  const colorWord = useMemo(() => approximateKoreanColorName(hex), [hex]);
  useEffect(() => {
    // reset to hex whenever token or enable changes
    setShowHex(true);
    if (!enabled) return;
    const t = setTimeout(() => setShowHex(false), 2000);
    return () => clearTimeout(t);
  }, [hex, enabled]);
  return (
    <SwapWrap>
      <SwapFront $show={showHex}>#{String(hex).replace('#', '')}</SwapFront>
      <SwapBack $show={!showHex}>{colorWord}</SwapBack>
    </SwapWrap>
  );
}

export default function ReasonPanel({ typedReason, fullTypedText, paragraphs, showHighlights, fadeText, typingDone }) {
  if (!fullTypedText) return null;
  const typed = typedReason || '';
  const total = fullTypedText ? fullTypedText.length : 0;
  const isTyping = Boolean(fullTypedText) && typed.length < total;
  const newlineLen = 2; // "\n\n"
  let remaining = typed.length;
  let activeIdx = 0;
  const displayBlocks = paragraphs.map((para, i) => {
    if (remaining <= 0) return '';
    const take = Math.min(para.length, remaining);
    const out = para.slice(0, take);
    remaining -= take;
    if (remaining > 0 && i < paragraphs.length - 1) {
      remaining = Math.max(0, remaining - newlineLen);
    }
    if (remaining > 0) activeIdx = i + 1; else activeIdx = i;
    return out;
  });
  const keywordRegex = /(\d+°C|\d+%|#[A-Fa-f0-9]{6}|온도|습도|조명|음악|색상)/g;

  return (
    <ReasonRoot>
      <ReasonInner $fade={fadeText}>
        {displayBlocks.map((block, idx) => (
          <ReasonParagraph key={idx} $first={idx === 0} $strong={idx === 0}>
            {showHighlights
              ? block.split(keywordRegex).map((part, i) => {
                  if (/^#[A-Fa-f0-9]{6}$/.test(part)) {
                    const enabled = !isTyping && (typeof typingDone === 'boolean' ? typingDone : true);
                    return <ColorSwap key={i} hex={part} enabled={enabled} />;
                  }
                  return keywordRegex.test(part)
                    ? <Bold key={i}>{part}</Bold>
                    : <span key={i}>{part}</span>;
                })
              : block}
            {isTyping && idx === activeIdx ? <Caret /> : null}
          </ReasonParagraph>
        ))}
      </ReasonInner>
    </ReasonRoot>
  );
}


