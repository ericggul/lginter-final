// TV2 전용 컬러 유틸리티 모듈
// - 순수 함수만 포함 (React/Hooks 없음)

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export function hsla(h, s, l, a = 1) {
  return `hsla(${Math.round(h)}, ${clamp(Math.round(s), 0, 100)}%, ${clamp(
    Math.round(l),
    0,
    100,
  )}%, ${a})`;
}

export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const v = m[1];
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

export function rgbToHsl(r, g, b) {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
    switch (max) {
      case R:
        h = (G - B) / d + (G < B ? 6 : 0);
        break;
      case G:
        h = (B - R) / d + 2;
        break;
      default:
        h = (R - G) / d + 4;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function describeHexColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return '중립 톤';
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const tone = l > 80 ? '파스텔 ' : s < 25 ? '부드러운 ' : '';
  let name = '중립 톤';
  if (h < 15 || h >= 345) name = '레드';
  else if (h < 35) name = '코랄';
  else if (h < 50) name = '오렌지';
  else if (h < 70) name = '옐로';
  else if (h < 95) name = '라임';
  else if (h < 150) name = '민트';
  else if (h < 185) name = '청록';
  else if (h < 215) name = '블루';
  else if (h < 245) name = '인디고';
  else if (h < 285) name = '보라';
  else if (h < 330) name = '마젠타';
  else name = '핑크';
  return `${tone}${name}`.trim();
}

export function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

export function hexToRgba(hex, opacity = 1) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

export function mixHex(hexA, hexB, ratio = 0.5) {
  const toRgb = (hex) => {
    const m = hex?.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return null;
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  };
  const a = toRgb(hexA);
  const b = toRgb(hexB);
  if (!a || !b) return hexA || hexB;
  const mix = (ai, bi) => Math.round(ai * ratio + bi * (1 - ratio));
  const [r, g, bVal] = [mix(a[0], b[0]), mix(a[1], b[1]), mix(a[2], b[2])];
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(bVal)}`;
}


