import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import * as S from './styles';
import { DEFAULT_TOP_MESSAGE } from './logic';

export function BlobBackground({ active }) {
  return (
    <S.BlobLayer>
      <S.BlobTinyTL />
      <S.BlobTR />
      <S.BlobBL />
    </S.BlobLayer>
  );
}

// text: 현재 상단 문구 문자열 (logic에서 관리), tip: 모바일 안내 active 여부
export function TopMessage({ text, tip }) {
  return (
    <>
      {/* 기본 QR 안내 문구 */}
      <S.TopMessageBase $active={!tip}>{DEFAULT_TOP_MESSAGE}</S.TopMessageBase>
      {/* Tip 활성화 시에만 보이는 모바일 안내 문구 */}
      <S.TopMessageTip $active={tip}>{text}</S.TopMessageTip>
    </>
  );
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


