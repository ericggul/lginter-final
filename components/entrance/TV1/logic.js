// 감정 키워드 → 그라데이션 매핑 객체
const EMOTION_GRADIENTS = {
  // 1️⃣ 고에너지-부정
  '긴장': 'linear-gradient(148deg, hsl(328, 95%, 77%) 0%, hsl(0, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '짜증': 'linear-gradient(220deg, hsl(328, 95%, 77%) 0%, hsl(0, 100%, 60%) 10%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '놀라움': 'linear-gradient(258deg, hsl(328, 95%, 77%) 0%, hsl(18, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '경계': 'linear-gradient(163deg, hsl(328, 95%, 77%) 0%, hsl(46, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '충격': 'linear-gradient(154deg, hsl(328, 95%, 77%) 0%, hsl(0, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '분노': 'linear-gradient(196deg, hsl(328, 95%, 77%) 0%, hsl(0, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '당혹': 'linear-gradient(245deg, hsl(328, 95%, 77%) 0%, hsl(13, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  
  // 2️⃣ 고에너지-인지
  '포커스': 'linear-gradient(214deg, hsl(328, 95%, 77%) 0%, hsl(290, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '명료': 'linear-gradient(327deg, hsl(328, 95%, 77%) 0%, hsl(300, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '자각': 'linear-gradient(153deg, hsl(328, 95%, 77%) 0%, hsl(45, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '집중': 'linear-gradient(162deg, hsl(328, 95%, 77%) 0%, hsl(271, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '몰입': 'linear-gradient(286deg, hsl(328, 95%, 77%) 0%, hsl(243, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '호기심': 'linear-gradient(250deg, hsl(328, 95%, 77%) 0%, hsl(267, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '흥미': 'linear-gradient(310deg, hsl(328, 95%, 77%) 0%, hsl(315, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '영감': 'linear-gradient(135deg, hsl(328, 95%, 77%) 0%, hsl(214, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '진지함': 'linear-gradient(207deg, hsl(328, 95%, 77%) 0%, hsl(293, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  
  // 3️⃣ 고에너지-긍정
  '설렘': 'linear-gradient(249deg, hsl(328, 95%, 77%) 0%, hsl(302, 100%, 60%) 10%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '기대감': 'linear-gradient(22deg, hsl(328, 95%, 77%) 0%, hsl(307, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '발돋움': 'linear-gradient(341deg, hsl(328, 95%, 77%) 0%, hsl(337, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '경쾌': 'linear-gradient(288deg, hsl(328, 95%, 77%) 0%, hsl(187, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
  '감격': 'linear-gradient(77deg, hsl(328, 95%, 77%) 0%, hsl(16, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
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

// 감정 키워드로 그라데이션을 가져오는 함수 (유사 키워드 매칭 포함)
function getEmotionGradient(emotion) {
  const s = String(emotion || '').trim();
  
  // 정확한 매칭 먼저 시도
  if (EMOTION_GRADIENTS[s]) {
    return EMOTION_GRADIENTS[s];
  }
  
  // 유사 키워드 매칭 (부분 문자열 포함)
  for (const [key, gradient] of Object.entries(EMOTION_GRADIENTS)) {
    if (s.includes(key) || key.includes(s)) {
      return gradient;
    }
  }
  
  // 매칭 실패 시 null 반환 (기본 그라데이션 사용)
  return null;
}

// 감정 키워드를 블롭 타입으로 매핑하는 함수
// 서버의 toEmotionKeyword 함수가 반환하는 값들을 기반으로 매핑
function mapEmotionToBlobType(emotion) {
  const s = String(emotion || '').toLowerCase().trim();
  
  // 서버에서 반환하는 감정 키워드 기반 매핑
  if (s === '기쁨' || s.includes('행복') || s.includes('좋아') || s.includes('신나') || s.includes('즐거') || s.includes('설렘')) return 'Happy';
  if (s === '슬픔' || s.includes('슬퍼') || s.includes('우울') || s.includes('서운') || s.includes('눈물') || s.includes('울적')) return 'Sad';
  if (s === '짜증' || s === '분노' || s.includes('빡') || s.includes('열받') || s.includes('화남')) return 'Annoyed';
  if (s.includes('신기') || s.includes('놀람') || s.includes('놀라')) return 'Wonder';
  if (s.includes('흥미') || s.includes('관심')) return 'Interest';
  if (s.includes('장난') || s.includes('장난스러')) return 'Playful';
  if (s.includes('언짢') || s.includes('불만')) return 'Upset';
  if (s.includes('뿌듯') || s.includes('자랑')) return 'Proud';
  if (s.includes('부끄러') || s.includes('수줍')) return 'Shy';
  if (s.includes('정신없') || s.includes('혼란')) return 'Chaotic';
  if (s.includes('배고픔') || s.includes('배고프') || s.includes('배고')) return 'Hungry';
  
  // 서버에서 반환하는 다른 키워드들도 매핑 시도
  if (s === '상쾌' || s.includes('청량') || s.includes('상큼') || s.includes('산뜻') || s.includes('맑음')) return 'Happy';
  if (s === '차분' || s.includes('편안') || s.includes('고요') || s.includes('평온') || s.includes('안정')) return 'Sad'; // 차분한 감정은 Sad 블롭 사용
  if (s === '지루' || s.includes('무료') || s.includes('심심')) return 'Sad';
  if (s === '답답' || s.includes('막막')) return 'Annoyed';
  
  // 기본값: 감정 키워드가 매칭되지 않으면 null 반환
  return null;
}

// 블롭 위치 계산 상수
const BLOB_SPAWN_POINT = {
  top: 26.2375, // Now 텍스트와 동일한 top 값
  left: 19.610417 // 짜증 블롭과 동일한 left 값
};
const BLOB_SPACING = 3; // 상단 블롭 간격과 동일
const ROW_HEIGHT = 4.8322915; // (spawn point top - 짜증 블롭 top) / 2 = (26.2375 - 16.572917) / 2
const RIGHT_MARGIN = 7.817708; // Now와 화면 왼쪽 거리
const MAX_RIGHT = 100 - RIGHT_MARGIN; // 92.182292vw - 블롭의 오른쪽 면이 이 값을 넘으면 안됨

// 시간 표시 관련 상수
const FIRST_TIME_MARKER_TOP = 35.354167; // 12:00가 있던 자리 (vw)
const TIME_MARKER_ROW_HEIGHT = 4.8322915; // 시간 표시 간 간격 (vw)

// 새로운 블롭의 위치를 계산하는 함수
// 기존 블롭 배열과 새 블롭의 텍스트를 받아서 위치 계산
export function calculateNewBlobPosition(existingBlobs, newText, calculateBlobWidth) {
  const newBlobWidth = calculateBlobWidth(newText);
  
  // 첫 번째 블롭인 경우 spawn point 위치 반환
  if (!existingBlobs || existingBlobs.length === 0) {
    return {
      top: BLOB_SPAWN_POINT.top,
      left: BLOB_SPAWN_POINT.left,
      rowIndex: 0
    };
  }
  
  // 마지막 블롭의 정보 가져오기
  const lastBlob = existingBlobs[existingBlobs.length - 1];
  const lastBlobWidth = calculateBlobWidth(lastBlob.text);
  
  // 같은 줄에 배치 시도
  let newLeft = lastBlob.left + lastBlobWidth + BLOB_SPACING;
  let newTop = lastBlob.top;
  let newRowIndex = lastBlob.rowIndex;
  
  // 오른쪽 경계 체크: 블롭의 오른쪽 면이 MAX_RIGHT를 넘는지 확인
  if (newLeft + newBlobWidth > MAX_RIGHT) {
    // 다음 줄로 이동
    newLeft = BLOB_SPAWN_POINT.left;
    newTop = lastBlob.top + ROW_HEIGHT;
    newRowIndex = lastBlob.rowIndex + 1;
  }
  
  return {
    top: newTop,
    left: newLeft,
    rowIndex: newRowIndex
  };
}

// 시간 표시의 top 위치를 계산하는 함수
function calculateTimeMarkerTop(timeMarkers) {
  if (!timeMarkers || timeMarkers.length === 0) {
    return FIRST_TIME_MARKER_TOP; // 첫 번째 시간 표시는 12:00 자리
  }
  
  // 마지막 시간 표시의 top에서 ROW_HEIGHT만큼 아래
  const lastMarker = timeMarkers[timeMarkers.length - 1];
  return lastMarker.top + TIME_MARKER_ROW_HEIGHT;
}

// 시간 표시 생성 함수
function createTimeMarker(currentHour, existingTimeMarkers) {
  // 이미 해당 시간대의 시간 표시가 있는지 확인
  const existingMarker = existingTimeMarkers.find(marker => marker.hour === currentHour);
  if (existingMarker) {
    return null; // 이미 존재하면 null 반환
  }
  
  // 시간 표시의 top 위치 계산
  const top = calculateTimeMarkerTop(existingTimeMarkers);
  
  return {
    hour: currentHour,
    top: top,
    visible: true,
    timestamp: Date.now()
  };
}

export function createSocketHandlers({ setKeywords, unifiedFont, setTv2Color, setTopTexts, setVisibleBlobs, setNewBlobs, calculateBlobWidth, setTimeMarkers }) {
  // track unique users to shift top row only when a brand-new user speaks
  const seenUserIds = new Set();
  const onEntranceNewVoice = (data) => {
    console.log('📺 TV1 Component received entrance-new-voice:', data);
    const text = data.text || data.emotion || '알 수 없음';
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
    
    // 기존 블롭 타입별 표시 (디폴트 블롭 등)
    if (blobType && setVisibleBlobs) {
      setVisibleBlobs((prev) => ({
        ...prev,
        [blobType]: {
          visible: true,
          text: text,
          gradient: gradient, // 그라데이션 정보 추가
          timestamp: Date.now()
        }
      }));
    }
    
    // 새로운 블롭 배열에 추가 (spawn point에서 시작)
    if (blobType && gradient && setNewBlobs && calculateBlobWidth) {
      const currentTimestamp = Date.now();
      const currentDate = new Date(currentTimestamp);
      const currentHour = currentDate.getHours(); // 0-23
      
      setNewBlobs((prevBlobs) => {
        const position = calculateNewBlobPosition(prevBlobs, text, calculateBlobWidth);
        const newBlob = {
          id: currentTimestamp + Math.random(),
          blobType: blobType,
          text: text,
          gradient: gradient,
          top: position.top,
          left: position.left,
          rowIndex: position.rowIndex,
          timestamp: currentTimestamp,
          hour: currentHour // 시간 정보 추가
        };
        
        // 시간 표시 생성 체크
        if (setTimeMarkers) {
          setTimeMarkers((prevMarkers) => {
            // 기존에 없는 시간대만 체크
            const existingHours = new Set(prevMarkers.map(m => m.hour));
            
            // 새로운 시간대인지 확인
            if (!existingHours.has(currentHour)) {
              const marker = createTimeMarker(currentHour, prevMarkers);
              if (marker) {
                // 시간 순서대로 정렬
                const sortedMarkers = [...prevMarkers, marker].sort((a, b) => a.hour - b.hour);
                
                // top 위치를 다시 계산 (정렬 후 순서에 맞게)
                return sortedMarkers.map((m, index) => ({
                  ...m,
                  top: FIRST_TIME_MARKER_TOP + (index * TIME_MARKER_ROW_HEIGHT)
                }));
              }
            }
            
            return prevMarkers;
          });
        }
        
        return [...prevBlobs, newBlob];
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


