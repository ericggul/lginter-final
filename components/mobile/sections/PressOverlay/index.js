import * as S from './styles';

export default function PressOverlay({
  onActivateVoice,
  active = false,
}) {
  const handleActivate = (e) => {
    try {
      e?.preventDefault?.();
      e?.stopPropagation?.();
    } catch {}
    if (typeof onActivateVoice === 'function') onActivateVoice();
  };


  return (
    <S.Container
      $active={active}
      onTouchStart={handleActivate}
      onMouseDown={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleActivate(e);
      }}
      role="button"
      tabIndex={0}
      aria-label="tap anywhere to speak"
    >
      <S.HitArea>
        <S.RingPulse $anim={active ? 'softRipple 1600ms ease-out infinite' : 'none'} />
        <S.RingPulse $anim={active ? 'softRipple 1600ms ease-out infinite 800ms' : 'none'} />
        <S.Dot $anim={active ? 'glowPulse 1.2s ease-in-out infinite' : 'none'} />
      </S.HitArea>
    </S.Container>
  );
}



