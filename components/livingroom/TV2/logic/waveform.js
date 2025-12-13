// TV2 오디오 파형 시각화용 순수 계산 로직
// - AnalyserNode에서 주파수 데이터를 읽어 bars 개수만큼 막대 높이 배열로 변환

export function computeWaveformFromAnalyser(analyser, bars = 32) {
  if (!analyser) return new Array(bars).fill(0);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);

  const newWaveformData = [];
  let globalMax = 0;

  // 로그 스케일로 샘플링하여 저주파수와 고주파수를 모두 포함
  for (let i = 0; i < bars; i++) {
    const ratio = i / (bars - 1);
    const logIndex = Math.floor(Math.pow(dataArray.length, ratio) - 1);
    const nextRatio = (i + 1) / (bars - 1);
    const nextLogIndex =
      i < bars - 1
        ? Math.floor(Math.pow(dataArray.length, nextRatio) - 1)
        : dataArray.length;

    let max = 0;
    for (let j = Math.max(0, logIndex); j < Math.min(nextLogIndex, dataArray.length); j++) {
      max = Math.max(max, dataArray[j] || 0);
    }
    globalMax = Math.max(globalMax, max);
    newWaveformData.push(max);
  }

  // 글로벌 레벨에 따라 자동 게인 걸어서 좀 더 적극적으로 움직이도록
  const minHeight = 8;
  const maxHeight = 160;
  const normGlobal = globalMax / 255 || 0.0001;
  const gain = normGlobal < 0.4 ? 0.4 / normGlobal : 1;

  return newWaveformData.map((raw) => {
    const norm = (raw / 255) * gain;
    const clamped = Math.max(0, Math.min(1, norm));
    // 살짝 감마를 줘서 작은 변화도 잘 보이게
    const gamma = Math.pow(clamped, 0.7);
    return Math.max(minHeight, Math.min(maxHeight, gamma * maxHeight));
  });
}


