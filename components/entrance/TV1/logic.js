// 감정 키워드 → 그라데이션 매핑 객체
const EMOTION_GRADIENTS = {
  // 1️⃣ 고에너지-부정
  '긴장': 'linear-gradient(220deg, hsl(328, 95%, 77%) 0%, hsl(0, 100%, 60%) 10%, hsl(328, 95%, 77%) 55%, hsl(297, 84%, 97%) 95%)',
  '짜증': 'linear-gradient(220deg, hsl(328, 95%, 77%) 0%, hsl(0, 100%, 60%) 10%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '놀라움': 'linear-gradient(220deg, hsl(328, 95%, 77%) 0%, hsl(18, 100%, 60%) 10%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '경계': 'linear-gradient(220deg, hsl(328, 95%, 77%) 0%, hsl(46, 100%, 60%) 10%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '충격': 'linear-gradient(220deg, hsl(328, 95%, 77%) 0%, hsl(0, 100%, 60%) 10%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '분노': 'linear-gradient(220deg, hsl(328, 95%, 77%) 0%, hsl(0, 100%, 60%) 10%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '당혹': 'linear-gradient(220deg, hsl(328, 95%, 77%) 0%, hsl(13, 100%, 60%) 10%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  
  // 2️⃣ 고에너지-인지
  '포커스': 'linear-gradient(214deg, hsl(328, 95%, 77%) 0%, hsl(290, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '명료': 'linear-gradient(327deg, hsl(328, 95%, 77%) 0%, hsl(300, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '자각': 'linear-gradient(327deg, hsl(328, 95%, 77%) 0%, hsl(45, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '집중': 'linear-gradient(327deg, hsl(328, 95%, 77%) 0%, hsl(271, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '몰입': 'linear-gradient(286deg, hsl(328, 95%, 77%) 0%, hsl(243, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '호기심': 'linear-gradient(250deg, hsl(328, 95%, 77%) 0%, hsl(267, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '흥미': 'linear-gradient(310deg, hsl(328, 95%, 77%) 0%, hsl(315, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '영감': 'linear-gradient(135deg, hsl(328, 95%, 77%) 0%, hsl(214, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '진지함': 'linear-gradient(207deg, hsl(328, 95%, 77%) 0%, hsl(293, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  
  // 3️⃣ 고에너지-긍정
  '설렘': 'linear-gradient(249deg, hsl(328, 95%, 77%) 0%, hsl(302, 100%, 60%) 10%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '기대감': 'linear-gradient(220deg, hsl(328, 95%, 77%) 0%, hsl(307, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '발돋움': 'linear-gradient(341deg, hsl(328, 95%, 77%) 0%, hsl(337, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '경쾌': 'linear-gradient(288deg, hsl(328, 95%, 77%) 0%, hsl(187, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '감격': 'linear-gradient(288deg, hsl(328, 95%, 77%) 0%, hsl(16, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '흥분': 'linear-gradient(205deg, hsl(328, 95%, 77%) 0%, hsl(298, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '활력': 'linear-gradient(295deg, hsl(328, 95%, 77%) 0%, hsl(307, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '기쁨': 'linear-gradient(19deg, hsl(328, 95%, 77%) 0%, hsl(51, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '자기확신': 'linear-gradient(226deg, hsl(328, 95%, 77%) 0%, hsl(86, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  
  // 4️⃣ 저에너지-부정
  '허무': 'linear-gradient(213deg, hsl(328, 95%, 77%) 0%, hsl(237, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '무기력': 'linear-gradient(226deg, hsl(328, 95%, 77%) 0%, hsl(242, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '피로': 'linear-gradient(255deg, hsl(328, 95%, 77%) 0%, hsl(218, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '무력': 'linear-gradient(215deg, hsl(328, 95%, 77%) 0%, hsl(199, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '소진': 'linear-gradient(261deg, hsl(328, 95%, 77%) 0%, hsl(216, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '번아웃': 'linear-gradient(290deg, hsl(328, 95%, 77%) 0%, hsl(241, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  
  // 5️⃣ 관계적 상실/불안
  '향수': 'linear-gradient(135deg, hsl(328, 95%, 77%) 0%, hsl(217, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '애틋함': 'linear-gradient(193deg, hsl(328, 95%, 77%) 0%, hsl(287, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '회피': 'linear-gradient(157deg, hsl(328, 95%, 77%) 0%, hsl(210, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '고독': 'linear-gradient(280deg, hsl(328, 95%, 77%) 0%, hsl(207, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '후회': 'linear-gradient(228deg, hsl(328, 95%, 77%) 0%, hsl(244, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '회한': 'linear-gradient(221deg, hsl(328, 95%, 77%) 0%, hsl(21, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '실망': 'linear-gradient(135deg, hsl(328, 95%, 77%) 0%, hsl(242, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '갈망': 'linear-gradient(202deg, hsl(328, 95%, 77%) 0%, hsl(198, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '두려움': 'linear-gradient(199deg, hsl(328, 95%, 77%) 0%, hsl(244, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '찝찝해': 'linear-gradient(200deg, hsl(328, 95%, 77%) 0%, hsl(240, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  
  // 6️⃣ 이완/안정
  '맑음': 'linear-gradient(226deg, hsl(328, 95%, 77%) 0%, hsl(156, 75%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '조용함': 'linear-gradient(83deg, hsl(328, 95%, 77%) 0%, hsl(148, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '고요함': 'linear-gradient(100deg, hsl(328, 95%, 77%) 0%, hsl(151, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '담담': 'linear-gradient(317deg, hsl(328, 95%, 77%) 0%, hsl(191, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '편유': 'linear-gradient(208deg, hsl(328, 95%, 77%) 0%, hsl(98, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '여유': 'linear-gradient(270deg, hsl(328, 95%, 77%) 0%, hsl(123, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '잔잔함': 'linear-gradient(238deg, hsl(328, 95%, 77%) 0%, hsl(140, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '느긋': 'linear-gradient(235deg, hsl(328, 95%, 77%) 0%, hsl(88, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '침착함': 'linear-gradient(219deg, hsl(328, 95%, 77%) 0%, hsl(203, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '균형감': 'linear-gradient(216deg, hsl(328, 95%, 77%) 0%, hsl(130, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '편안': 'linear-gradient(115deg, hsl(328, 95%, 77%) 0%, hsl(156, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '충족감': 'linear-gradient(135deg, hsl(328, 95%, 77%) 0%, hsl(112, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '뿌듯함': 'linear-gradient(247deg, hsl(328, 95%, 77%) 0%, hsl(72, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '만족': 'linear-gradient(135deg, hsl(328, 95%, 77%) 0%, hsl(174, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '안정감': 'linear-gradient(220deg, hsl(328, 95%, 77%) 0%, hsl(183, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '평온': 'linear-gradient(103deg, hsl(328, 95%, 77%) 0%, hsl(200, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '온화함': 'linear-gradient(38deg, hsl(328, 95%, 77%) 0%, hsl(51, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '완화': 'linear-gradient(165deg, hsl(328, 95%, 77%) 0%, hsl(80, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '선선함': 'linear-gradient(135deg, hsl(328, 95%, 77%) 0%, hsl(195, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '평정심': 'linear-gradient(45deg, hsl(328, 95%, 77%) 0%, hsl(37, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '차분함': 'linear-gradient(209deg, hsl(328, 95%, 77%) 0%, hsl(74, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '차분': 'linear-gradient(226deg, hsl(328, 95%, 77%) 0%, hsl(74, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  
  // 7️⃣ 정서적 위안
  '편애': 'linear-gradient(253deg, hsl(328, 95%, 77%) 0%, hsl(42, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '수줍음': 'linear-gradient(71deg, hsl(328, 95%, 77%) 0%, hsl(42, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '미온': 'linear-gradient(92deg, hsl(328, 95%, 77%) 0%, hsl(39, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '온기': 'linear-gradient(93deg, hsl(328, 95%, 77%) 0%, hsl(24, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '감미로움': 'linear-gradient(326deg, hsl(328, 95%, 77%) 0%, hsl(57, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '위안': 'linear-gradient(135deg, hsl(328, 95%, 77%) 0%, hsl(82, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '포용': 'linear-gradient(173deg, hsl(328, 95%, 77%) 0%, hsl(270, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '포근함': 'linear-gradient(76deg, hsl(328, 95%, 77%) 0%, hsl(43, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '충만함': 'linear-gradient(85deg, hsl(328, 95%, 77%) 0%, hsl(52, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '진정': 'linear-gradient(183deg, hsl(328, 95%, 77%) 0%, hsl(45, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  
  // 8️⃣ 신체적 쾌적/해소
  '회복': 'linear-gradient(323deg, hsl(328, 95%, 77%) 0%, hsl(180, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '서늘함': 'linear-gradient(95deg, hsl(328, 95%, 77%) 0%, hsl(181, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '산뜻함': 'linear-gradient(235deg, hsl(328, 95%, 77%) 0%, hsl(43, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '기력회복': 'linear-gradient(135deg, hsl(328, 95%, 77%) 0%, hsl(52, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '해소': 'linear-gradient(171deg, hsl(328, 95%, 77%) 0%, hsl(155, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '시원함': 'linear-gradient(156deg, hsl(328, 95%, 77%) 0%, hsl(180, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '상쾌함': 'linear-gradient(226deg, hsl(328, 95%, 77%) 0%, hsl(242, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '청량': 'linear-gradient(35deg, hsl(328, 95%, 77%) 0%, hsl(157, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '갈증': 'linear-gradient(69deg, hsl(328, 95%, 77%) 0%, hsl(317, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  
  // 9️⃣ 모호/둔감
  '은은함': 'linear-gradient(135deg, hsl(328, 95%, 77%) 0%, hsl(58, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '심심함': 'linear-gradient(303deg, hsl(328, 95%, 77%) 0%, hsl(67, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '관조': 'linear-gradient(135deg, hsl(328, 95%, 77%) 0%, hsl(190, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '시큰둥함': 'linear-gradient(235deg, hsl(328, 95%, 77%) 0%, hsl(203, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '무심함': 'linear-gradient(86deg, hsl(328, 95%, 77%) 0%, hsl(77, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '무색': 'linear-gradient(62deg, hsl(328, 95%, 77%) 0%, hsl(54, 12%, 62%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '희미함': 'linear-gradient(30deg, hsl(328, 95%, 77%) 0%, hsl(51, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '아득함': 'linear-gradient(31deg, hsl(328, 95%, 77%) 0%, hsl(226, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '꿈결': 'linear-gradient(32deg, hsl(328, 95%, 77%) 0%, hsl(73, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '몽환': 'linear-gradient(49deg, hsl(328, 95%, 77%) 0%, hsl(273, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '흐릿함': 'linear-gradient(164deg, hsl(328, 95%, 77%) 0%, hsl(38, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  
  // 🔟 부정-내향
  '실소': 'linear-gradient(131deg, hsl(328, 95%, 77%) 0%, hsl(270, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '도취': 'linear-gradient(226deg, hsl(328, 95%, 77%) 0%, hsl(307, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '감상': 'linear-gradient(226deg, hsl(328, 95%, 77%) 0%, hsl(153, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '흐트러짐': 'linear-gradient(191deg, hsl(328, 95%, 77%) 0%, hsl(191, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '공허': 'linear-gradient(147deg, hsl(328, 95%, 77%) 0%, hsl(212, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '체념': 'linear-gradient(233deg, hsl(328, 95%, 77%) 0%, hsl(188, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '가라앉음': 'linear-gradient(99deg, hsl(328, 95%, 77%) 0%, hsl(218, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '억눌림': 'linear-gradient(178deg, hsl(328, 95%, 77%) 0%, hsl(271, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '음울': 'linear-gradient(276deg, hsl(328, 95%, 77%) 0%, hsl(203, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
};

// 감정 키워드로 그라데이션을 가져오는 함수 (정확한 매칭 우선)
function getEmotionGradient(emotion) {
  let s = String(emotion || '').trim();
  
  if (!s) {
    console.warn('⚠️ getEmotionGradient: empty emotion');
    return 'linear-gradient(226deg, hsl(328, 95%, 77%) 0%, hsl(242, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)';
  }
  
  // 특정 키워드 변환 (서버에서 변환된 키워드 처리)
  if (s === '상쾌') {
    s = '상쾌함'; // 상쾌 → 상쾌함으로 변환
  }
  
  // 1. 정확한 키워드 매칭 (가장 우선) - EMOTION_GRADIENTS에 직접 접근
  if (EMOTION_GRADIENTS[s]) {
    console.log('✅ getEmotionGradient EXACT match:', s, '→', EMOTION_GRADIENTS[s].substring(0, 60));
    return EMOTION_GRADIENTS[s];
  }
  
  // 2. EMOTION_GRADIENTS의 모든 키를 순회하여 정확히 일치하는 키 찾기
  for (const [key, gradient] of Object.entries(EMOTION_GRADIENTS)) {
    if (s === key) {
      console.log('✅ getEmotionGradient loop match:', s, '→', key, '→', gradient.substring(0, 60));
      return gradient;
    }
  }
  
  // 3. 부분 문자열 매칭 (키워드가 입력에 정확히 포함되는 경우만)
  // 예: "흐트러짐" 입력 시 "흐트러짐" 키워드 찾기
  for (const [key, gradient] of Object.entries(EMOTION_GRADIENTS)) {
    // 키워드가 입력에 포함되거나, 입력이 키워드에 포함되는 경우
    if (s.includes(key) || key.includes(s)) {
      // 너무 짧은 매칭 방지 (최소 2글자)
      if (key.length >= 2 && s.length >= 2) {
        console.log('✅ getEmotionGradient partial match:', s, '→', key, '→', gradient.substring(0, 60));
        return gradient;
      }
    }
  }
  
  // 매칭 실패 시 기본 그라데이션 반환 (블롭 생성 보장)
  console.warn('⚠️ getEmotionGradient NO match for:', s, '→ using default gradient');
  console.warn('⚠️ Available keys:', Object.keys(EMOTION_GRADIENTS).slice(0, 10).join(', '), '...');
  return 'linear-gradient(226deg, hsl(328, 95%, 77%) 0%, hsl(242, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)';
}

// 감정 키워드를 블롭 타입으로 매핑하는 함수
// EMOTION_GRADIENTS의 모든 키워드를 다양한 블롭 타입으로 매핑
function mapEmotionToBlobType(emotion) {
  const s = String(emotion || '').toLowerCase().trim();
  const original = String(emotion || '').trim();
  
  // EMOTION_GRADIENTS에 있는 키워드인지 먼저 확인
  if (EMOTION_GRADIENTS[original]) {
    // EMOTION_GRADIENTS에 있는 키워드를 감정 카테고리별로 블롭 타입 매핑
    
    // 1️⃣ 고에너지-부정: 긴장, 짜증, 놀라움, 경계, 충격, 분노, 당혹
    if (['긴장', '짜증', '놀라움', '경계', '충격', '분노', '당혹'].includes(original)) {
      if (original === '놀라움') return 'Wonder';
      if (original === '짜증' || original === '분노' || original === '충격') return 'Annoyed';
      return 'Upset';
    }
    
    // 2️⃣ 고에너지-인지: 포커스, 명료, 자각, 집중, 몰입, 호기심, 흥미, 영감, 진지함
    if (['포커스', '명료', '자각', '집중', '몰입', '호기심', '흥미', '영감', '진지함'].includes(original)) {
      if (original === '흥미' || original === '호기심') return 'Interest';
      return 'Interest';
    }
    
    // 3️⃣ 고에너지-긍정: 설렘, 기대감, 발돋움, 경쾌, 감격, 흥분, 활력, 기쁨, 자기확신
    if (['설렘', '기대감', '발돋움', '경쾌', '감격', '흥분', '활력', '기쁨', '자기확신'].includes(original)) {
      if (original === '자기확신') return 'SelfConfident';
      if (original === '경쾌') return 'Playful';
      return 'Happy';
    }
    
    // 4️⃣ 저에너지-부정: 허무, 무기력, 피로, 무력, 소진, 번아웃
    if (['허무', '무기력', '피로', '무력', '소진', '번아웃'].includes(original)) {
      return 'Sad';
    }
    
    // 5️⃣ 관계적 상실/불안: 향수, 애틋함, 회피, 고독, 후회, 회한, 실망, 갈망, 두려움, 찝찝해
    if (['향수', '애틋함', '회피', '고독', '후회', '회한', '실망', '갈망', '두려움', '찝찝해'].includes(original)) {
      if (original === '찝찝해') return 'Upset';
      return 'Sad';
    }
    
    // 6️⃣ 이완/안정: 맑음, 조용함, 고요함, 담담, 편유, 여유, 잔잔함, 느긋, 침착함, 균형감, 편안, 충족감, 뿌듯함, 만족, 안정감, 평온, 온화함, 완화, 선선함, 평정심, 차분함, 차분
    if (['맑음', '조용함', '고요함', '담담', '편유', '여유', '잔잔함', '느긋', '침착함', '균형감', '편안', '충족감', '뿌듯함', '만족', '안정감', '평온', '온화함', '완화', '선선함', '평정심', '차분함', '차분'].includes(original)) {
      if (original === '맑음') return 'Interest';
      if (original === '뿌듯함') return 'Proud';
      return 'Sad';
    }
    
    // 7️⃣ 정서적 위안: 편애, 수줍음, 미온, 온기, 감미로움, 위안, 포용, 포근함, 충만함, 진정
    if (['편애', '수줍음', '미온', '온기', '감미로움', '위안', '포용', '포근함', '충만함', '진정'].includes(original)) {
      if (original === '수줍음') return 'Shy';
      return 'Proud';
    }
    
    // 8️⃣ 신체적 쾌적/해소: 회복, 서늘함, 산뜻함, 기력회복, 해소, 시원함, 상쾌함, 청량, 갈증
    if (['회복', '서늘함', '산뜻함', '기력회복', '해소', '시원함', '상쾌함', '청량', '갈증'].includes(original)) {
      if (original === '상쾌함') return 'Playful';
      if (original === '갈증') return 'Hungry';
      return 'Happy';
    }
    
    // 9️⃣ 모호/둔감: 은은함, 심심함, 관조, 시큰둥함, 무심함, 무색, 희미함, 아득함, 꿈결, 몽환, 흐릿함
    if (['은은함', '심심함', '관조', '시큰둥함', '무심함', '무색', '희미함', '아득함', '꿈결', '몽환', '흐릿함'].includes(original)) {
      if (original === '심심함') return 'Sad';
      return 'Interest';
    }
    
    // 🔟 부정-내향: 실소, 도취, 감상, 흐트러짐, 공허, 체념, 가라앉음, 억눌림, 음울
    if (['실소', '도취', '감상', '흐트러짐', '공허', '체념', '가라앉음', '억눌림', '음울'].includes(original)) {
      if (original === '흐트러짐') return 'Chaotic';
      return 'Sad';
    }
  }
  
  // 기존 패턴 매칭 (부분 문자열 포함)
  if (s === '기쁨' || s.includes('행복') || s.includes('좋아') || s.includes('신나') || s.includes('즐거') || s.includes('설렘')) return 'Happy';
  if (s === '슬픔' || s.includes('슬퍼') || s.includes('우울') || s.includes('서운') || s.includes('눈물') || s.includes('울적')) return 'Sad';
  if (s === '짜증' || s === '분노' || s.includes('빡') || s.includes('열받') || s.includes('화남')) return 'Annoyed';
  if (s.includes('신기') || s.includes('놀람') || s.includes('놀라')) return 'Wonder';
  if (s.includes('흥미') || s.includes('관심')) return 'Interest';
  if (s.includes('장난') || s.includes('장난스러')) return 'Playful';
  if (s.includes('언짢') || s.includes('불만') || s.includes('찝찝')) return 'Upset';
  if (s.includes('뿌듯') || s.includes('자랑')) return 'Proud';
  if (s.includes('부끄러') || s.includes('수줍')) return 'Shy';
  if (s.includes('정신없') || s.includes('혼란')) return 'Chaotic';
  if (s.includes('배고픔') || s.includes('배고프') || s.includes('배고')) return 'Hungry';
  if (s === '상쾌' || s === '상쾌함' || s.includes('청량') || s.includes('상큼') || s.includes('산뜻')) return 'Playful'; // 상쾌/상쾌함 → Playful
  if (s.includes('맑음')) return 'Interest'; // 맑음 → Interest
  if (s === '차분' || s.includes('편안') || s.includes('고요') || s.includes('평온') || s.includes('안정')) return 'Sad';
  if (s === '지루' || s.includes('무료') || s.includes('심심')) return 'Sad';
  if (s === '답답' || s.includes('막막')) return 'Annoyed';
  if (s.includes('무기력')) return 'Sad'; // 무기력 → Sad
  if (s.includes('자기확신')) return 'SelfConfident'; // 자기확신 → SelfConfident
  
  // 기본값: 감정 키워드가 매칭되지 않으면 기본 블롭 타입 반환 (블롭 생성 보장)
  return 'Interest';
}

// ============================================
// 열 구조 정의 - 수정 가능한 값들
// ============================================

// 1열: 상단 블롭 6개 (고정)
const COLUMN_1_TOP = 39.791667; // 상단 블롭 6개의 top 값 (vw)

// 5열: Now 시점 (blobSpawnPoint)
const COLUMN_5_TOP = 44.6191665; // Now 텍스트 중심과 정렬 (vw)

// ============================================
// 2,3,4열 그룹 설정 - 이 값들을 수정하면 2,3,4열의 모든 블롭이 함께 움직임
// ============================================
// 2열 top 값: 이 값을 변경하면 2열에 있는 6개 블롭이 모두 함께 움직임
const COLUMN_2_TOP = 23.79; // 2열 top 값 (vw) - 수정 가능

// 2,3,4열 간 간격: 이 값을 변경하면 3열과 4열의 위치가 자동으로 조정됨
// 블롭 높이(5.920985vw)보다 큰 값으로 설정해야 블롭이 겹치지 않음
// 권장값: 6.0vw 이상
const COLUMN_2_3_4_GAP = 7; // 2열과 3열, 3열과 4열 간 간격 (vw) - 수정 가능

// 블롭 높이 참고용 (수정 불가)
const BLOB_HEIGHT = 5.920985; // 블롭 높이 (vw) - 블롭은 transform: translateY(-50%)를 사용하므로 중심이 top 값에 위치

// ============================================
// 각 열의 top 위치 정의 (2열 기준으로 3열, 4열 자동 계산)
// ============================================
// 현재 각 열의 top 값:
// 1열: 39.791667vw
// 2열: 23.79vw
// 3열: 30.79vw (23.79 + 7)
// 4열: 37.79vw (23.79 + 14)
// 5열: 44.6191665vw
const COLUMN_TOPS = {
  1: COLUMN_1_TOP,                    // 39.791667vw (1열: 상단 블롭 6개)
  2: COLUMN_2_TOP,                    // 23.79vw (2열: COLUMN_2_TOP 값 사용)
  3: COLUMN_2_TOP + COLUMN_2_3_4_GAP,  // 30.79vw (3열: 2열 + 간격, 자동 계산)
  4: COLUMN_2_TOP + (COLUMN_2_3_4_GAP * 2), // 37.79vw (4열: 2열 + 간격*2, 자동 계산)
  5: COLUMN_5_TOP                      // 44.6191665vw (5열: Now 시점)
};

// 블롭 위치 계산 상수
const BLOB_SPAWN_POINT = {
  top: COLUMN_5_TOP, // Now 시점 (5열)
  left: 19.610417 // 짜증 블롭과 동일한 left 값
};
const BLOB_SPACING = 3; // 상단 블롭 간격과 동일
const ROW_HEIGHT = 4.8322915; // (spawn point top - 짜증 블롭 top) / 2 = (26.2375 - 16.572917) / 2
const RIGHT_MARGIN = 7.817708; // Now와 화면 왼쪽 거리
const MAX_RIGHT = 100 - RIGHT_MARGIN; // 92.182292vw - 블롭의 오른쪽 면이 이 값을 넘으면 안됨

// 시간 표시 관련 상수 (더 이상 사용하지 않음 - 각 열의 top 값 사용)
const FIRST_TIME_MARKER_TOP = 35.354167; // 12:00가 있던 자리 (vw) - 레거시
const TIME_MARKER_ROW_HEIGHT = 4.8322915; // 시간 표시 간 간격 (vw) - 레거시

// 고정 블롭 18개 초기화 함수 (2,3,4열에 각각 6개씩)
// 1열은 visibleBlobs로 이미 렌더링되므로 제외
// 1열 블롭 6개: '짜증', '무기력', '맑음', '설렘', '상쾌함', '자기확신' (제외)
// 2,3,4열에는 모두 서로 다른 18개의 감정 키워드 사용
export function initializeFixedBlobs(visibleBlobs, calculateBlobWidth) {
  const fixedBlobs = [];
  
  // 각 열별로 서로 다른 감정 키워드 6개씩 할당 (총 18개, 모두 다름)
  // 1열 블롭 제외: '짜증', '무기력', '맑음', '설렘', '상쾌함', '자기확신'
  const columnEmotions = {
    2: ['긴장', '놀라움', '경계', '충격', '분노', '당혹'], // 고에너지-부정
    3: ['포커스', '명료', '자각', '집중', '몰입', '호기심'], // 고에너지-인지
    4: ['기대감', '발돋움', '경쾌', '감격', '흥분', '활력']  // 고에너지-긍정
  };
  
  // 각 열(2,3,4)에 6개씩 배치 (총 18개)
  for (let col = 2; col <= 4; col++) {
    const columnTop = COLUMN_TOPS[col];
    const startLeft = 19.610417; // Annoyed 시작 위치 (1열과 동일)
    const endRight = 84; // 오른쪽 끝 위치 (1열과 동일)
    const availableWidth = endRight - startLeft;
    
    // 해당 열의 감정 키워드 배열
    const emotionTexts = columnEmotions[col];
    
    // 각 열 내 블롭 너비 계산
    const blobWidths = emotionTexts.map(text => calculateBlobWidth(text));
    const totalBlobWidth = blobWidths.reduce((sum, width) => sum + width, 0);
    const uniformSpacing = (availableWidth - totalBlobWidth) / 4.5; // 1열과 동일한 간격 계산
    
    // 각 열 내 블롭 배치
    let currentLeft = startLeft;
    emotionTexts.forEach((emotionText, index) => {
      // 각 감정 키워드에 맞는 그라데이션 가져오기
      const gradient = getEmotionGradient(emotionText);
      // 각 감정 키워드에 맞는 블롭 타입 결정
      const blobType = mapEmotionToBlobType(emotionText);
      
      fixedBlobs.push({
        id: `fixed-${col}-${emotionText}-${index}`,
        blobType: blobType,
        text: emotionText,
        gradient: gradient,
        top: columnTop,
        left: currentLeft,
        column: col,
        isFixed: true,
        rowIndex: 0
      });
      
      currentLeft += blobWidths[index] + uniformSpacing;
    });
  }
  
  return fixedBlobs;
}

// 같은 열 내에서 블롭 위치 계산 (가로 배치)
// 반환값: { top, left, rowIndex, isColumnFull }
function calculatePositionInColumn(column, existingBlobsInColumn, newText, calculateBlobWidth) {
  const columnTop = COLUMN_TOPS[column];
  const newBlobWidth = calculateBlobWidth(newText);
  
  // 해당 열에 블롭이 없는 경우
  if (!existingBlobsInColumn || existingBlobsInColumn.length === 0) {
    return {
      top: columnTop,
      left: BLOB_SPAWN_POINT.left,
      rowIndex: 0,
      isColumnFull: false
    };
  }
  
  // 해당 열의 마지막 블롭 찾기
  const lastBlob = existingBlobsInColumn[existingBlobsInColumn.length - 1];
  const lastBlobWidth = calculateBlobWidth(lastBlob.text);
  
  // 같은 줄에 배치 시도
  let newLeft = lastBlob.left + lastBlobWidth + BLOB_SPACING;
  let newTop = columnTop;
  let newRowIndex = lastBlob.rowIndex || 0;
  let isColumnFull = false;
  
  // 오른쪽 경계 체크
  if (newLeft + newBlobWidth > MAX_RIGHT) {
    // 다음 줄로 이동 (같은 열 내)
    newLeft = BLOB_SPAWN_POINT.left;
    newTop = columnTop; // 같은 열이므로 top은 동일
    newRowIndex = (lastBlob.rowIndex || 0) + 1;
    
    // 6개 이상이면 열이 꽉 찬 것으로 간주 (한 줄에 6개 기준)
    if (existingBlobsInColumn.length >= 6) {
      isColumnFull = true;
    }
  }
  
  return {
    top: newTop,
    left: newLeft,
    rowIndex: newRowIndex,
    isColumnFull: isColumnFull
  };
}

// 새로운 블롭의 위치를 계산하는 함수
// 시간대별 열 결정 및 같은 열 내 배치
export function calculateNewBlobPosition(existingBlobs, newText, calculateBlobWidth, currentHour) {
  // 고정 블롭 제외 (isFixed가 true인 블롭 제외)
  const dynamicBlobs = existingBlobs.filter(blob => !blob.isFixed);
  
  // 시간대별 열 결정
  const targetColumn = getColumnForHour(currentHour, dynamicBlobs);
  
  // 해당 열의 동적 블롭들만 필터링
  const blobsInColumn = dynamicBlobs.filter(blob => blob.column === targetColumn);
  
  // 같은 열 내에서 위치 계산
  const position = calculatePositionInColumn(targetColumn, blobsInColumn, newText, calculateBlobWidth);
  
  return {
    ...position,
    column: targetColumn
  };
}

// 시간대별로 열 번호를 결정하는 함수
// 최신 시간대는 5열(Now), 이전 시간대는 4열 → 3열 → 2열 순서
function getColumnForHour(currentHour, existingBlobs) {
  // 기존 블롭들 중 가장 최근 시간대 찾기
  let maxHour = -1;
  const hourColumns = new Map(); // hour => column
  
  if (existingBlobs && existingBlobs.length > 0) {
    existingBlobs.forEach(blob => {
      if (blob.hour !== undefined) {
        if (blob.hour > maxHour) {
          maxHour = blob.hour;
        }
        // 기존 블롭의 시간대별 열 매핑 확인
        if (blob.column !== undefined && !hourColumns.has(blob.hour)) {
          hourColumns.set(blob.hour, blob.column);
        }
      }
    });
  }
  
  // 현재 시간대가 이미 존재하는 경우, 해당 열 사용
  if (hourColumns.has(currentHour)) {
    return hourColumns.get(currentHour);
  }
  
  // 현재 시간대가 새로운 경우
  if (maxHour === -1 || currentHour > maxHour) {
    // 새로운 시간대가 시작됨 → 5열(Now) 사용
    return 5;
  } else {
    // 이전 시간대의 블롭들 → 4, 3, 2열 중 비어있는 열 사용
    const usedColumns = new Set(Array.from(hourColumns.values()));
    
    // 4열부터 역순으로 비어있는 열 찾기
    for (let col = 4; col >= 2; col--) {
      if (!usedColumns.has(col)) {
        return col;
      }
    }
    
    // 모든 열이 사용 중이면 4열 사용 (가장 가까운 열)
    return 4;
  }
}

// 시간 변경 시 블롭 이동 함수
// 이전 시간대의 블롭들을 위 열로 이동 (5열→4열, 4열→3열, 3열→2열)
function moveBlobsToPreviousColumn(prevBlobs, previousHour) {
  return prevBlobs.map(blob => {
    // 고정 블롭은 이동하지 않음
    if (blob.isFixed) {
      return blob;
    }
    
    // 이전 시간대의 블롭만 이동
    if (blob.hour === previousHour) {
      const currentColumn = blob.column || 5;
      // 5열→4열, 4열→3열, 3열→2열, 2열→1열
      const newColumn = Math.max(1, currentColumn - 1);
      return {
        ...blob,
        column: newColumn,
        top: COLUMN_TOPS[newColumn],
        // left는 유지 (같은 열 내에서 위치 유지)
      };
    }
    
    return blob;
  });
}

// 시간 표시 생성 함수
// 시간 변경 시 이전 시간대의 열에 시간 표시 생성
function createTimeMarker(currentHour, previousHour, existingTimeMarkers, existingBlobs) {
  // 시간이 변경되었는지 확인
  if (currentHour === previousHour) {
    return null; // 같은 시간대면 시간 표시 생성 안 함
  }
  
  // 이전 시간대의 열 결정 (이전 시간대 블롭이 이동한 열)
  const previousHourBlobs = existingBlobs.filter(blob => !blob.isFixed && blob.hour === previousHour);
  if (previousHourBlobs.length === 0) {
    return null; // 이전 시간대 블롭이 없으면 시간 표시 생성 안 함
  }
  
  // 이전 시간대 블롭이 있는 열 (이동 후 열)
  const targetColumn = previousHourBlobs[0].column;
  const top = COLUMN_TOPS[targetColumn];
  
  // 이미 해당 시간대의 시간 표시가 있는지 확인
  const existingMarker = existingTimeMarkers.find(marker => marker.hour === previousHour);
  if (existingMarker) {
    return null; // 이미 존재하면 null 반환
  }
  
  return {
    hour: previousHour, // 이전 시간대 표시
    top: top,
    column: targetColumn,
    visible: true,
    timestamp: Date.now()
  };
}

export function createSocketHandlers({ setKeywords, unifiedFont, setTv2Color, setTopTexts, setVisibleBlobs, setNewBlobs, calculateBlobWidth, setTimeMarkers }) {
  // track unique users to shift top row only when a brand-new user speaks
  const seenUserIds = new Set();
  const onEntranceNewVoice = (data) => {
    console.log('📺 TV1 Component received entrance-new-voice:', data);
    // 원본 텍스트를 우선 사용, 없으면 text/emotion 사용, "중립"이면 원본 텍스트 사용
    const rawText = data.originalText || data.text || data.emotion || '알 수 없음';
    const text = (rawText === '중립' && data.originalText) ? data.originalText : rawText;
    console.log('📺 TV1 Processing text:', text, '(raw:', rawText, ', originalText:', data.originalText, ')');
    
    const fontSize = (Math.random() * 0.35 + 0.95).toFixed(2);
    const fontFamily = unifiedFont;
    const fontStyle = 'normal';
    const fontWeight = 800;
    setKeywords(prev => [{
      id: Date.now() + Math.random(),
      text: text,
      fontSize: `${fontSize}rem`,
      fontFamily,
      fontStyle,
      fontWeight,
      timestamp: Date.now()
    }, ...prev].slice(0, 18));

    // Play keyword blob sfx once per new keyword
    try {
      if (typeof window !== 'undefined') {
        const sfx = new Audio('/api/sfx?name=keywordblobtv1');
        // Let the browser policy decide if playback is allowed (may require prior user gesture)
        sfx.play().catch(() => {});
      }
    } catch {}

    // 감정 키워드를 블롭 타입으로 매핑하고 표시
    const blobType = mapEmotionToBlobType(text);
    const gradient = getEmotionGradient(text);
    console.log('📺 TV1 Processing:', {
      text: text,
      blobType: blobType,
      gradient: gradient ? gradient.substring(0, 80) + '...' : 'NOT FOUND'
    });
    
    // 상단 블롭은 절대 수정하지 않음 (고정된 6개 블롭: 짜증, 무기력, 설렘, 맑음, 상쾌함, 자기확신)
    // 새로운 블롭 배열에 추가 (시간대별 열 배치)
    if (blobType && gradient && setNewBlobs && calculateBlobWidth) {
      const currentTimestamp = Date.now();
      const currentDate = new Date(currentTimestamp);
      const currentHour = currentDate.getHours(); // 0-23
      
      setNewBlobs((prevBlobs) => {
        // 고정 블롭 제외한 동적 블롭만 필터링
        const dynamicBlobs = prevBlobs.filter(blob => !blob.isFixed);
        
        // 이전 시간대 확인 (동적 블롭 중 가장 최근 시간대)
        let previousHour = null;
        if (dynamicBlobs.length > 0) {
          const hours = dynamicBlobs.map(blob => blob.hour).filter(h => h !== undefined);
          if (hours.length > 0) {
            previousHour = Math.max(...hours);
          }
        }
        
        // 시간 변경 감지 및 블롭 이동
        let updatedBlobs = prevBlobs;
        if (previousHour !== null && currentHour !== previousHour && currentHour > previousHour) {
          // 시간이 변경되었고, 새로운 시간대가 더 최신인 경우
          updatedBlobs = moveBlobsToPreviousColumn(prevBlobs, previousHour);
        }
        
        // 새 블롭 위치 계산 (업데이트된 블롭 배열 기준)
        const position = calculateNewBlobPosition(updatedBlobs, text, calculateBlobWidth, currentHour);
        const newBlob = {
          id: currentTimestamp + Math.random(),
          blobType: blobType,
          text: text,
          gradient: gradient,
          top: position.top,
          left: position.left,
          rowIndex: position.rowIndex,
          column: position.column,
          timestamp: currentTimestamp,
          hour: currentHour,
          isFixed: false
        };
        
        console.log('📺 TV1 Creating new blob:', {
          text: newBlob.text,
          blobType: newBlob.blobType,
          column: newBlob.column,
          hour: newBlob.hour,
          gradient: newBlob.gradient ? newBlob.gradient.substring(0, 80) + '...' : 'MISSING'
        });
        
        // 최종 업데이트된 블롭 배열
        const finalBlobs = [...updatedBlobs, newBlob];
        
        // 시간 표시 생성 체크
        if (setTimeMarkers && previousHour !== null && currentHour !== previousHour) {
          setTimeMarkers((prevMarkers) => {
            // 이전 시간대의 열에 시간 표시 생성
            const marker = createTimeMarker(currentHour, previousHour, prevMarkers, finalBlobs);
            if (marker) {
              // 시간 표시 추가 (이전 시간대의 열에 배치됨)
              return [...prevMarkers, marker];
            }
            return prevMarkers;
          });
        }
        
        return finalBlobs;
      });
    }

    // newest keyword goes to the leftmost top container; shift right
    const uid = String(data?.userId || '');
    const isNewUser = uid && !seenUserIds.has(uid);
    if (isNewUser) {
      seenUserIds.add(uid);
      setTopTexts((prev) => [text, prev[0], prev[1], prev[2]].slice(0, 4));
    } else {
      // for existing users, just update the first container text
      setTopTexts((prev) => [text, prev[1], prev[2], prev[3]]);
    }
  };

  const onDeviceDecision = (data) => {
    if (data?.device === 'sw2' && data.lightColor) setTv2Color(data.lightColor);
  };

  const onDeviceNewDecision = (msg) => {
    const env = msg?.env;
    if (!env) return;
    if ((msg?.target === 'tv2' || msg?.target === 'sw2') && env.lightColor) setTv2Color(env.lightColor);
  };

  return { onEntranceNewVoice, onDeviceDecision, onDeviceNewDecision };
}


