import * as S from './styles';
import { useSW2Logic } from './logic';

function emotionToHsl(keyword) {
  const k = String(keyword || '').trim();
  // Common Korean emotion words → gentle HSL (no neon)
  if (/설렘|기쁨|행복|즐거/.test(k)) return { h: 320, s: 70, l: 70 };
  if (/사랑|로맨틱|애정/.test(k)) return { h: 340, s: 62, l: 68 };
  if (/평온|편안|차분|고요|잔잔|여유|안정/.test(k)) return { h: 200, s: 50, l: 72 };
  if (/집중|포커스|몰입|진지/.test(k)) return { h: 265, s: 60, l: 64 };
  if (/상쾌|청량|신선|맑음|산뜻/.test(k)) return { h: 185, s: 58, l: 66 };
  if (/피곤|무기력|지침|번아웃|소진/.test(k)) return { h: 215, s: 22, l: 70 };
  if (/짜증|분노|화|불안|초조|긴장/.test(k)) return { h: 8, s: 70, l: 62 };
  if (/슬픔|우울|서운|외로|아파/.test(k)) return { h: 235, s: 40, l: 68 };
  // fallback: derive hue from string hash for variety
  let h = 280; let s = 55; let l = 62;
  try {
    let hash = 0;
    for (let i = 0; i < k.length; i += 1) hash = (hash * 31 + k.charCodeAt(i)) >>> 0;
    h = 20 + (hash % 320);
    s = 40 + (hash % 40);
    l = 58 + (hash % 18);
  } catch {}
  return { h, s, l };
}

export default function SW2Controls() {
  const {
    blobConfigs,
    keywords,
    dotCount,
    title,
    artist,
    coverSrc,
    audioSrc,
    audioRef,
    participantCount,
    blobRefs,
  } = useSW2Logic();

  return (
    <S.Root>
      {blobConfigs.map((blob, idx) => {
        const Component = S[blob.componentKey];
        const keyword = keywords[idx] || blob.labelBottom;
        const hsl = emotionToHsl(keyword);
        return (
          <Component
            key={blob.id}
            ref={(node) => {
              if (node) {
                blobRefs.current[blob.id] = node;
                node.style.setProperty('--blob-top', `${blob.anchor.y}vw`);
                node.style.setProperty('--blob-left', `${blob.anchor.x}vw`);
                node.style.setProperty('--blob-size', `${blob.size.base}vw`);
              } else {
                delete blobRefs.current[blob.id];
              }
            }}
            style={{ '--blob-h': hsl.h, '--blob-s': `${hsl.s}%`, '--blob-l': `${hsl.l}%` }}
          >
            <span>{keyword}</span>
          </Component>
        );
      })}
      <S.FrameBg $url="" />
      <S.TopStatus>
        <span>사용자 {participantCount}명을 위한 조율중</span>
        <S.Dots aria-hidden="true">
          <S.Dot $visible={dotCount >= 1}>.</S.Dot>
          <S.Dot $visible={dotCount >= 2}>.</S.Dot>
          <S.Dot $visible={dotCount >= 3}>.</S.Dot>
        </S.Dots>
      </S.TopStatus>

      <S.AlbumCard>
        {coverSrc ? (
          <S.AlbumImage
            src={coverSrc}
            alt={title || 'cover'}
            onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
            onLoad={(e) => { e.currentTarget.style.visibility = 'visible'; }}
            style={{ visibility: 'visible' }}
          />
        ) : (
          <S.AlbumPlaceholder />
        )}
      </S.AlbumCard>
      <S.CaptionWrap>
        <S.HeadText>{title || ' '}</S.HeadText>
        <S.SubText>{artist || ' '}</S.SubText>
      </S.CaptionWrap>

      {audioSrc ? <audio ref={audioRef} src={audioSrc} autoPlay loop playsInline preload="auto" /> : null}
    </S.Root>
  );
}
