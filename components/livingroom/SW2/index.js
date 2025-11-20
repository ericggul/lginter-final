import * as S from './styles';
import { useSW2Logic } from './logic';

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
          >
            {/* 온도/모드 텍스트 제거, 사용자 키워드만 중앙에 표시 */}
            <span>{keyword}</span>
          </Component>
        );
      })}
      {/* If background frame image is unavailable, pass empty to avoid 404 */}
      <S.FrameBg $url="" />
      <S.TopStatus>
        <span>사용자 {participantCount}명을 위한 조율중</span>
        <S.Dots aria-hidden="true">
          <S.Dot $visible={dotCount >= 1}>.</S.Dot>
          <S.Dot $visible={dotCount >= 2}>.</S.Dot>
          <S.Dot $visible={dotCount >= 3}>.</S.Dot>
        </S.Dots>
      </S.TopStatus>

      {/* Compact album card */}
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

      {/* Hidden audio element */}
      {audioSrc ? <audio ref={audioRef} src={audioSrc} autoPlay loop playsInline preload="auto" /> : null}
    </S.Root>
  );
}
