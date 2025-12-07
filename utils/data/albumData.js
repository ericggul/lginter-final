// 번호(1-16) 기반 앨범 데이터 통합 관리
// 사용자 규칙 기준으로 정확히 매핑
// AI 디시전 시스템(MUSIC_CATALOG)과의 호환성 유지

import { MUSIC_CATALOG } from './musicCatalog';

// 번호(1-16)를 primary key로 하는 통합 데이터
export const ALBUM_DATA_BY_NUMBER = {
  1: {
    songName: 'Life_is',
    artist: 'Scott_Burkely',
    displayTitle: 'Life is',
    displayArtist: 'Scott Burkely',
    imgURL: '1.png',
    songURL: '1.mp3',
    gradient: {
      colors: ['#D54C47', '#E89D4F', '#F5E266', '#486ECE', '#7C79A8'],
      stops: [0, 136.73, 223.27, 270, 360],
    },
    catalogId: 'life-is-scott',
    catalogTitle: 'Life is',
  },
  2: {
    songName: 'Glow',
    artist: 'Scott_Burkely',
    displayTitle: 'Glow',
    displayArtist: 'Scott Burkely',
    imgURL: '2.png',
    songURL: '2.mp3',
    gradient: {
      colors: ['#5BE0CD', '#EDBED0', '#88F0E7', '#F1DCD3', '#EFF3DD'],
      stops: [0, 121.15, 223.27, 270, 360],
    },
    catalogId: 'glow-scott',
    catalogTitle: 'Glow',
  },
  3: {
    songName: 'Clean_Soul_Calming',
    artist: 'Kevin_MacLeod',
    displayTitle: 'Clean Soul',
    displayArtist: 'Kevin MacLeod',
    imgURL: '3.png',
    songURL: '3.mp3',
    gradient: {
      colors: ['#512715', '#B56C34', '#F5E7C5', '#7FC7C1', '#013639'],
      stops: [0, 136.73, 223.27, 287.31, 360],
    },
    catalogId: 'clean-soul',
    catalogTitle: 'Clean Soul',
  },
  4: {
    songName: 'Borealis',
    artist: 'Scott_Buckley',
    displayTitle: 'Borealis',
    displayArtist: 'Scott Buckley',
    imgURL: '4.png',
    songURL: '4.mp3',
    gradient: {
      colors: ['#6C91AD', '#ABC7E4', '#EED8CA', '#C0DBB2', '#F0EFDD'],
      stops: [0, 136.73, 223.27, 270, 360],
    },
    catalogId: 'borealis',
    catalogTitle: 'Borealis',
  },
  5: {
    songName: 'Happy_Stroll',
    artist: '331music',
    displayTitle: 'happy stroll',
    displayArtist: '331music',
    imgURL: '5.png',
    songURL: '5.mp3',
    gradient: {
      colors: ['#F9B800', '#FF6B00', '#B35D1B', '#C8C291', '#F0EFDD'],
      stops: [0, 136.73, 223.27, 270, 360],
    },
    catalogId: 'happy-stroll',
    catalogTitle: 'happy stroll',
  },
  6: {
    songName: 'Ukulele_Dance',
    artist: 'Derek_Fiechter&Brandon_Fiechter',
    displayTitle: 'Ukulele Dance',
    displayArtist: 'Derek Fiechter & Brandon Fiechter',
    imgURL: '6.png',
    songURL: '6.mp3',
    gradient: {
      colors: ['#F25828', '#F7C8A8', '#FEFCEA', '#F3E4A6', '#E1DED1'],
      stops: [0, 136.73, 223.27, 270, 360],
    },
    catalogId: 'ukulele-dance',
    catalogTitle: 'Ukulele Dance',
  },
  7: {
    songName: 'Happy_Alley',
    artist: 'Kevin_MacLeod',
    displayTitle: 'Happy Alley',
    displayArtist: 'Kevin MacLeod',
    imgURL: '7.png',
    songURL: '7.mp3',
    gradient: {
      colors: ['#62D8DD', '#AEABE4', '#FDFA8C', '#E2FBD5', '#A2D6AE'],
      stops: [0, 136.73, 223.27, 270, 360],
    },
    catalogId: 'happy-alley',
    catalogTitle: 'Happy Alley',
  },
  8: {
    songName: 'Sunny_Side_Up',
    artist: 'Victor_Lundberg',
    displayTitle: 'sunny side up',
    displayArtist: 'Victor Lundberg',
    imgURL: '8.png',
    songURL: '8.mp3',
    gradient: {
      colors: ['#FF6F4B', '#ABC7E4', '#A2D6AE', '#E2FBD5', '#F0EFDD'],
      stops: [0, 136.73, 223.27, 270, 360],
    },
    catalogId: 'sunny-side-up',
    catalogTitle: 'sunny side up',
  },
  9: {
    songName: 'New_Beginnings',
    artist: 'Tokyo_Music_Walker',
    displayTitle: 'New Beginnings',
    displayArtist: 'Tokyo Music Walker',
    imgURL: '9.png',
    songURL: '9.mp3',
    gradient: {
      colors: ['#B1C9AC', '#EDE2BA', '#F28700', '#F44600', '#A6A33B'],
      stops: [0, 136.73, 223.27, 270, 360],
    },
    catalogId: 'new-beginnings',
    catalogTitle: 'New Beginnings',
  },
  10: {
    songName: 'Solstice',
    artist: 'Scott_Buckley',
    displayTitle: 'Solstice',
    displayArtist: 'Scott Buckley',
    imgURL: '10.png',
    songURL: '10.mp3',
    gradient: {
      colors: ['#BE7D52', '#CAD6D8', '#DECCA1', '#FEF5F3', '#FDF8E8'],
      stops: [0, 136.73, 223.27, 270, 360],
    },
    catalogId: 'solstice',
    catalogTitle: 'Solstice',
  },
  11: {
    songName: 'Solace',
    artist: 'Scott_Buckley',
    displayTitle: 'Solace',
    displayArtist: 'Scott Buckley',
    imgURL: '11.png',
    songURL: '11.mp3',
    gradient: {
      colors: ['#2069CA', '#ABC7E4', '#D7DDE5', '#E2E2E2', '#E4E3FA'],
      stops: [0, 136.73, 223.27, 270, 360],
    },
    catalogId: 'solace',
    catalogTitle: 'Solace',
  },
  12: {
    songName: 'The_Travelling_Symphony',
    artist: 'Savfk',
    displayTitle: 'the travelling symphony',
    displayArtist: 'savfk',
    imgURL: '12.png',
    songURL: '12.mp3',
    gradient: {
      colors: ['#334971', '#A5B6C1', '#BAD1C7', '#E5EDE0', '#355162'],
      stops: [0, 136.73, 223.27, 270, 360],
    },
    catalogId: 'travelling-symphony',
    catalogTitle: 'the travelling symphony',
  },
  13: {
    songName: 'Amberlight',
    artist: 'Scott_Buckley',
    displayTitle: 'Amberlight',
    displayArtist: 'Scott Buckley',
    imgURL: '13.png',
    songURL: '13.mp3',
    gradient: {
      colors: ['#B5E3E8', '#ABC7E4', '#D6EFD8', '#FFE2BE', '#F7F7F7'],
      stops: [0, 136.73, 223.27, 270, 360],
    },
    catalogId: 'amberlight',
    catalogTitle: 'Amberlight',
  },
  14: {
    songName: 'Echoes',
    artist: 'Scott_Buckley',
    displayTitle: 'Echoes',
    displayArtist: 'Scott Buckley',
    imgURL: '14.png',
    songURL: '14.mp3',
    gradient: {
      colors: ['#67A752', '#C3C9C3', '#E1C8C9', '#D2C3C3', '#E6DFB4'],
      stops: [0, 136.73, 223.27, 270, 360],
    },
    catalogId: 'echoes',
    catalogTitle: 'Echoes',
  },
  15: {
    songName: 'Shoulders_Of_Giants',
    artist: 'Scott_Buckley',
    displayTitle: 'Shoulders Of Giants',
    displayArtist: 'Scott Buckley',
    imgURL: '15.png',
    songURL: '15.mp3',
    gradient: {
      colors: ['#3F501F', '#74A654', '#E0A72F', '#EDD51D', '#F0EFDD'],
      stops: [0, 136.73, 223.27, 270, 360],
    },
    catalogId: 'shoulders-of-giants',
    catalogTitle: 'Shoulders Of Giants',
  },
  16: {
    songName: 'A_Kind_Of_Hope',
    artist: 'Scott_Buckley',
    displayTitle: 'A Kind Of Hope',
    displayArtist: 'Scott Buckley',
    imgURL: '16.png',
    songURL: '16.mp3',
    gradient: {
      colors: ['#2F3057', '#5182A0', '#9795BC', '#B8A1BE', '#ECEBCD'],
      stops: [0, 136.73, 223.27, 270, 360],
    },
    catalogId: 'a-kind-of-hope',
    catalogTitle: 'A Kind Of Hope',
  },
};

// 곡명 정규화 함수 (일관된 정규화)
export function normalizeTrackName(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .replace(/[\s_\-]+/g, '')
    .replace(/[^a-z0-9가-힣]/g, '')
    .trim();
}

// 정규화된 곡명 → 번호 매핑 생성
const NORMALIZED_NAME_TO_NUMBER = {};
for (const [numStr, data] of Object.entries(ALBUM_DATA_BY_NUMBER)) {
  const num = parseInt(numStr, 10);
  // songName 정규화
  const normalizedSongName = normalizeTrackName(data.songName);
  if (normalizedSongName) {
    NORMALIZED_NAME_TO_NUMBER[normalizedSongName] = num;
  }
  // displayTitle 정규화 (AI/MUSIC_CATALOG 호환)
  const normalizedTitle = normalizeTrackName(data.displayTitle);
  if (normalizedTitle && normalizedTitle !== normalizedSongName) {
    NORMALIZED_NAME_TO_NUMBER[normalizedTitle] = num;
  }
  // catalogTitle 정규화
  const normalizedCatalogTitle = normalizeTrackName(data.catalogTitle);
  if (normalizedCatalogTitle && normalizedCatalogTitle !== normalizedSongName && normalizedCatalogTitle !== normalizedTitle) {
    NORMALIZED_NAME_TO_NUMBER[normalizedCatalogTitle] = num;
  }
}

// MUSIC_CATALOG와의 매핑: catalogId를 통해 ALBUM_DATA_BY_NUMBER에서 직접 번호 찾기 (배열 순서 무시)
if (typeof MUSIC_CATALOG !== 'undefined' && Array.isArray(MUSIC_CATALOG)) {
  MUSIC_CATALOG.forEach((entry) => {
    // ALBUM_DATA_BY_NUMBER에서 catalogId로 번호 찾기
    for (const [numStr, data] of Object.entries(ALBUM_DATA_BY_NUMBER)) {
      if (data.catalogId === entry.id) {
        const num = parseInt(numStr, 10);
        // catalog id 정규화
        const normalizedId = normalizeTrackName(entry.id);
        if (normalizedId) {
          NORMALIZED_NAME_TO_NUMBER[normalizedId] = num;
        }
        // catalog title 정규화
        const normalizedCatalogTitle = normalizeTrackName(entry.title);
        if (normalizedCatalogTitle) {
          NORMALIZED_NAME_TO_NUMBER[normalizedCatalogTitle] = num;
        }
        break;
      }
    }
  });
}

// "Title - Artist" 형식 파싱
export function parseMusicString(musicStr) {
  if (!musicStr) return { title: '', artist: '' };
  const str = String(musicStr).trim();
  
  // "Title - Artist" 형식
  if (str.includes(' - ')) {
    const parts = str.split(' - ');
    return {
      title: parts[0].trim(),
      artist: parts.slice(1).join(' - ').trim(),
    };
  }
  
  // "Title by Artist" 형식
  if (/ by /i.test(str)) {
    const parts = str.split(/ by /i);
    return {
      title: parts[0].trim(),
      artist: parts.slice(1).join(' by ').trim(),
    };
  }
  
  // 제목만 있는 경우
  return {
    title: str,
    artist: '',
  };
}

// 곡명 → 번호 변환 (AI 디시전 호환)
export function getAlbumNumberByTrackName(trackName) {
  if (!trackName) return null;
  
  // 이미 번호인 경우
  const num = parseInt(String(trackName).trim(), 10);
  if (!isNaN(num) && num >= 1 && num <= 16) {
    return num;
  }
  
  // "Title - Artist" 형식 파싱
  const parsed = parseMusicString(trackName);
  const title = parsed.title;
  
  // 정규화된 곡명으로 매칭
  const normalized = normalizeTrackName(title);
  if (normalized && NORMALIZED_NAME_TO_NUMBER[normalized]) {
    return NORMALIZED_NAME_TO_NUMBER[normalized];
  }
  
  // 원본 제목으로도 시도
  const normalizedOriginal = normalizeTrackName(trackName);
  if (normalizedOriginal && NORMALIZED_NAME_TO_NUMBER[normalizedOriginal]) {
    return NORMALIZED_NAME_TO_NUMBER[normalizedOriginal];
  }
  
  // 부분 매칭 제거 (정확한 매칭만 사용)
  return null;
}

// 번호로 전체 정보 조회
export function getAlbumByNumber(num) {
  const number = typeof num === 'number' ? num : parseInt(String(num).trim(), 10);
  if (isNaN(number) || number < 1 || number > 16) {
    return null;
  }
  return ALBUM_DATA_BY_NUMBER[number] || null;
}

// 곡명 또는 번호로 전체 정보 조회
export function getAlbumData(numOrTrackName) {
  if (!numOrTrackName) return null;
  
  // 번호인 경우
  const num = parseInt(String(numOrTrackName).trim(), 10);
  if (!isNaN(num) && num >= 1 && num <= 16) {
    return getAlbumByNumber(num);
  }
  
  // 곡명인 경우 번호로 변환 후 조회
  const albumNum = getAlbumNumberByTrackName(numOrTrackName);
  if (albumNum) {
    return getAlbumByNumber(albumNum);
  }
  
  return null;
}

// 그라데이션 조회
export function getAlbumGradient(numOrTrackName) {
  const data = getAlbumData(numOrTrackName);
  return data?.gradient || null;
}

// 커버 경로 생성 (/api/album 호환)
export function getAlbumCoverPath(numOrTrackName) {
  const data = getAlbumData(numOrTrackName);
  if (!data) return '';
  return `/api/album?name=${encodeURIComponent(data.displayTitle)}`;
}

// 음악 경로 생성 (/api/music 호환)
export function getAlbumSongPath(numOrTrackName) {
  const data = getAlbumData(numOrTrackName);
  if (!data) return '';
  return `/api/music?name=${encodeURIComponent(data.displayTitle)}`;
}

