import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import * as S from './styles';
import { T1_HEAD_TEXT, T2_HEAD_TEXT, T3_HEAD_TEXT } from './logic';

// 블롭 3개가 항상 둥실둥실 떠 있는 기본 배경
export function BlobBackground() {
  return (
    <S.BlobLayer>
      <S.BlobTinyTL />
      <S.BlobTR />
      <S.BlobBL />
    </S.BlobLayer>
  );
}

export function TopMessage({ stage }) {
  const showT1 = stage === 't1';
  const showT2 = stage === 't2';
  const showT3 = stage === 't3';
  return (
    <>
      {/* T1 */}
      <S.TopMessageBase $active={showT1}>{T1_HEAD_TEXT}</S.TopMessageBase>
      {/* T2 */}
      <S.TopMessageT2 $active={showT2}>{T2_HEAD_TEXT}</S.TopMessageT2>
      {/* T3 (triggered by scan) */}
      <S.TopMessageT3 $active={showT3}>{T3_HEAD_TEXT}</S.TopMessageT3>
    </>
  );
}

export function BetweenIcon({ src, active }) {
  if (!src) return null;
  return <S.BetweenIcon src={src} alt="" draggable={false} $active={!!active} />;
}

export function QrFloat({ value }) {
  return (
    <S.QRFloat>
      <QRCodeSVG value={value} size={0} level="H" bgColor="transparent" fgColor="#111827" />
    </S.QRFloat>
  );
}

export function FuronMark({ src }) {
  const style = src ? { backgroundImage: `url(${src})` } : undefined;
  return <S.FuronMark style={style} />;
}


