/**
 * 딴짓 사이트 감지기
 */

// 딴짓 사이트 목록
const DISTRACTION_DOMAINS = [
  'youtube.com',
  'youtu.be',
  'netflix.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'reddit.com',
  'tiktok.com',
  'twitch.tv',
  'naver.com/entertain',
  'naver.com/sports',
  'daum.net',
  'dcinside.com',
  'fmkorea.com',
  'clien.net',
  'ruliweb.com'
];

// 학습 사이트 목록 (화이트리스트)
const STUDY_DOMAINS = [
  'notion.so',
  'github.com',
  'stackoverflow.com',
  'w3schools.com',
  'mdn.io',
  'developer.mozilla.org',
  'docs.python.org',
  'docs.oracle.com',
  'namu.wiki',
  'ko.wikipedia.org',
  'en.wikipedia.org'
];

/**
 * URL이 딴짓 사이트인지 확인
 */
function isDistractionSite(url) {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // 학습 사이트는 제외
    if (STUDY_DOMAINS.some(domain => hostname.includes(domain))) {
      return false;
    }
    
    // 딴짓 사이트 확인
    return DISTRACTION_DOMAINS.some(domain => hostname.includes(domain));
  } catch (e) {
    return false;
  }
}

/**
 * URL이 학습 사이트인지 확인
 */
function isStudySite(url) {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return STUDY_DOMAINS.some(domain => hostname.includes(domain));
  } catch (e) {
    return false;
  }
}

/**
 * 탭 제목으로 딴짓 감지
 */
function isDistractionByTitle(title) {
  if (!title) return false;
  
  const lowerTitle = title.toLowerCase();
  const distractionKeywords = [
    'youtube',
    '넷플릭스',
    'netflix',
    '게임',
    '방송',
    '스트리밍'
  ];
  
  return distractionKeywords.some(keyword => lowerTitle.includes(keyword));
}

// 전역으로 노출
if (typeof window !== 'undefined') {
  window.isDistractionSite = isDistractionSite;
  window.isStudySite = isStudySite;
  window.isDistractionByTitle = isDistractionByTitle;
}

