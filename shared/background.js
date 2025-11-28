/**
 * shared/background.js
 * 통합 백그라운드 스크립트 - 모든 모듈의 메시지를 라우팅합니다.
 */

// ========================================
// Service Worker 초기화
// ========================================
// 참고: config.js는 popup.html에서 로드됩니다 (보안상 안전)
// Service Worker는 Chrome Storage에서만 API 키를 읽습니다

chrome.runtime.onInstalled.addListener(() => {
  console.log('✅ v-mate 설치/업데이트 완료 - 팝업을 열어서 config.js를 자동 로드하세요');
});

// ========================================
// GPT API 함수 (gpt-api.js 내용을 직접 포함)
// ========================================
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * GPT API 호출 공통 함수
 */
async function callGPTAPI(systemPrompt, userPrompt, options = {}) {
  try {
    // Chrome Storage에서 API 키 가져오기
    const result = await chrome.storage.local.get(['openaiApiKey']);
    const apiKey = result.openaiApiKey;
    
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      throw new Error('API 키가 설정되지 않았습니다. 확장 프로그램 팝업에서 API 키를 설정해주세요.');
    }
    
    // 기본 옵션
    const defaultOptions = {
      model: 'gpt-4o-mini',
      max_tokens: 200,
      temperature: 0.7
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    console.log('💬 GPT API 호출 중...');
    
    // API 호출
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: finalOptions.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: finalOptions.max_tokens,
        temperature: finalOptions.temperature
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API 오류: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    console.log('✅ GPT 응답 완료');
    
    return {
      success: true,
      content: content
    };
    
  } catch (error) {
    console.error('❌ GPT API 호출 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

console.log('✅ v-mate background service worker loaded');

// ========================================
// Research Assistant - 리서치 어시스턴트
// ========================================

/**
 * DuckDuckGo 웹 검색 (HTML 파싱)
 * 완전 무료, 제한 없음
 */
async function searchDuckDuckGo(query, limit = 10) {
  try {
    console.log('[DuckDuckGo] 검색 시작:', query);
    
    // DuckDuckGo 검색 URL
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    console.log('[DuckDuckGo] 요청 URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    console.log('[DuckDuckGo] HTML 응답 받음, 길이:', html.length);

    // HTML 파싱하여 결과 추출
    const results = parseDuckDuckGoHTML(html, limit);
    console.log('[DuckDuckGo] 파싱된 결과:', results.length, '개');
    
    return results;
  } catch (error) {
    console.error('[DuckDuckGo] 검색 실패:', error.message);
    return [];
  }
}

/**
 * DuckDuckGo HTML 파싱
 */
function parseDuckDuckGoHTML(html, limit) {
  const results = [];
  
  try {
    // DuckDuckGo HTML 구조에서 결과 추출
    // 결과는 <div class="result"> 또는 <div class="web-result"> 형태
    const resultRegex = /<div[^>]*class="[^"]*result[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    const matches = html.match(resultRegex) || [];
    
    console.log('[DuckDuckGo] HTML에서 찾은 결과 블록:', matches.length, '개');
    
    for (let i = 0; i < Math.min(matches.length, limit); i++) {
      const block = matches[i];
      
      // 제목 추출
      const titleMatch = block.match(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/i) ||
                        block.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/i);
      
      // 설명 추출
      const snippetMatch = block.match(/<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([^<]*)<\/a>/i) ||
                        block.match(/<span[^>]*class="[^"]*snippet[^"]*"[^>]*>([^<]*)<\/span>/i);
      
      if (titleMatch && titleMatch[1] && titleMatch[2]) {
        const url = titleMatch[1].startsWith('http') ? titleMatch[1] : `https://${titleMatch[1]}`;
        const title = titleMatch[2].trim();
        const content = snippetMatch ? snippetMatch[1].trim() : '';
        
        if (url && title) {
          results.push({
            id: `ddg_${Date.now()}_${i}_${Math.random().toString(36).substr(2)}`,
            title: title,
            url: url,
            content: content,
            source: 'duckduckgo',
            type: 'web',
            domain: extractDomain(url),
            score: 50, // 기본 점수
            date: null
          });
        }
      }
    }
  } catch (error) {
    console.error('[DuckDuckGo] HTML 파싱 오류:', error.message);
  }
  
  return results;
}

/**
 * arXiv 논문 검색 (완전 무료)
 */
async function searchArxiv(query, limit = 10) {
  try {
    console.log('[arXiv] 검색 시작:', query);
    
    // arXiv API는 무료이고 제한이 없습니다
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}`;
    console.log('[arXiv] 요청 URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/atom+xml'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xml = await response.text();
    console.log('[arXiv] XML 응답 받음, 길이:', xml.length);

    // XML 파싱
    const results = parseArxivXML(xml);
    console.log('[arXiv] 파싱된 결과:', results.length, '개');
    
    return results;
  } catch (error) {
    console.error('[arXiv] 검색 실패:', error.message);
    return [];
  }
}

/**
 * arXiv XML 파싱
 */
function parseArxivXML(xml) {
  const results = [];
  
  try {
    // XML에서 entry 태그 추출
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    const entries = xml.match(entryRegex) || [];
    
    console.log('[arXiv] XML에서 찾은 논문:', entries.length, '개');
    
    for (const entry of entries) {
      // 제목 추출
      const titleMatch = entry.match(/<title[^>]*>([^<]*)<\/title>/i);
      // 요약 추출
      const summaryMatch = entry.match(/<summary[^>]*>([^<]*)<\/summary>/i);
      // ID 추출
      const idMatch = entry.match(/<id[^>]*>([^<]*)<\/id>/i);
      // 발행일 추출
      const publishedMatch = entry.match(/<published[^>]*>([^<]*)<\/published>/i);
      // 저자 추출
      const authorMatches = entry.match(/<name[^>]*>([^<]*)<\/name>/gi) || [];
      
      if (titleMatch && idMatch) {
        const arxivId = idMatch[1].split('/').pop();
        const url = `https://arxiv.org/abs/${arxivId}`;
        const title = titleMatch[1].trim().replace(/\s+/g, ' ');
        const content = summaryMatch ? summaryMatch[1].trim().replace(/\s+/g, ' ') : '';
        const authors = authorMatches.map(m => m.replace(/<\/?name[^>]*>/gi, '').trim()).join(', ');
        const published = publishedMatch ? publishedMatch[1].substring(0, 4) : null;
        
        results.push({
          id: arxivId,
          title: title,
          url: url,
          content: content,
          source: 'arxiv',
          type: 'paper',
          domain: 'arxiv.org',
          citationCount: 0, // arXiv는 인용 횟수 제공 안 함
          year: published ? parseInt(published) : null,
          authors: authors,
          venue: 'arXiv',
          pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`
        });
      }
    }
  } catch (error) {
    console.error('[arXiv] XML 파싱 오류:', error.message);
  }
  
  return results;
}

/**
 * SearXNG 검색 (폐기 - rate limit 문제로 사용 안 함)
 */
async function searchSearXNG(query, limit = 10) {
  console.log('[SearXNG] 검색 시작:', query);
  
  for (let i = 0; i < SEARXNG_INSTANCES.length; i++) {
    const instance = SEARXNG_INSTANCES[i];
    try {
      const url = `${instance}/search?q=${encodeURIComponent(query)}&format=json&pageno=1`;
      console.log(`[SearXNG] 인스턴스 ${i + 1}/${SEARXNG_INSTANCES.length} 시도:`, instance);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        }
      });

      console.log(`[SearXNG] ${instance} 응답 상태:`, response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.warn(`[SearXNG] ${instance} 응답 실패:`, response.status, errorText.substring(0, 100));
        continue;
      }

      // Content-Type 확인
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
        console.warn(`[SearXNG] ${instance} JSON이 아닌 응답:`, contentType);
        // HTML 응답인 경우 다른 URL 형식 시도
        const altUrl = `${instance}/search?q=${encodeURIComponent(query)}&format=json`;
        try {
          const altResponse = await fetch(altUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          if (altResponse.ok) {
            const altData = await altResponse.json();
            if (altData.results && Array.isArray(altData.results) && altData.results.length > 0) {
              const formatted = altData.results.slice(0, limit).map((result, idx) => ({
                id: `searxng_${Date.now()}_${idx}_${Math.random().toString(36).substr(2)}`,
                title: result.title || '',
                url: result.url || '',
                content: result.content || '',
                source: 'searxng',
                type: 'web',
                domain: extractDomain(result.url),
                score: result.score || 0,
                date: result.pubdate || null
              }));
              console.log(`[SearXNG] ${instance} 대체 URL 성공! 포맷된 결과:`, formatted.length, '개');
              return formatted;
            }
          }
        } catch (altError) {
          console.warn(`[SearXNG] ${instance} 대체 URL 실패:`, altError.message);
        }
        continue;
      }

      const data = await response.json();
      console.log(`[SearXNG] ${instance} 응답 데이터:`, {
        hasResults: !!data.results,
        resultsCount: data.results?.length || 0,
        number_of_results: data.number_of_results
      });
      
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        const formatted = data.results.slice(0, limit).map((result, idx) => ({
          id: `searxng_${Date.now()}_${idx}_${Math.random().toString(36).substr(2)}`,
          title: result.title || '',
          url: result.url || '',
          content: result.content || '',
          source: 'searxng',
          type: 'web',
          domain: extractDomain(result.url),
          score: result.score || 0,
          date: result.pubdate || null
        }));
        console.log(`[SearXNG] ${instance} 성공! 포맷된 결과:`, formatted.length, '개');
        return formatted;
      } else {
        console.log(`[SearXNG] ${instance} 결과 없음 (results 배열이 비어있음)`);
      }
    } catch (error) {
      console.warn(`[SearXNG] 인스턴스 ${instance} 실패:`, error.message);
      continue;
    }
  }
  
  console.error('[SearXNG] 모든 인스턴스 실패 - 검색 결과 없음');
  return [];
}

/**
 * Semantic Scholar 검색 (재시도 로직 포함)
 */
async function searchSemanticScholar(query, limit = 10, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        // Rate limit 대기 (지수 백오프)
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`[Semantic Scholar] 재시도 ${attempt}/${retries} - ${waitTime}ms 대기...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=paperId,title,abstract,year,citationCount,authors,url,openAccessPdf,venue`;
      console.log('[Semantic Scholar] 검색 시작:', query, attempt > 0 ? `(재시도 ${attempt})` : '');
      console.log('[Semantic Scholar] 요청 URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'v-mate-research/1.0',
          'Accept': 'application/json'
        }
      });

      console.log('[Semantic Scholar] 응답 상태:', response.status, response.statusText);

      if (response.status === 429) {
        // Rate limit - 재시도
        if (attempt < retries) {
          console.warn('[Semantic Scholar] Rate limit 도달, 재시도 예정...');
          continue;
        } else {
          const errorText = await response.text().catch(() => '');
          console.error('[Semantic Scholar] Rate limit - 재시도 실패:', errorText.substring(0, 200));
          // Rate limit이지만 빈 배열 반환 (에러 대신)
          return [];
        }
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('[Semantic Scholar] 응답 오류:', response.status, errorText.substring(0, 200));
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      console.log('[Semantic Scholar] 응답 데이터:', {
        total: data.total,
        hasData: !!data.data,
        dataCount: data.data?.length || 0
      });
      
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        const formatted = data.data.map((paper, idx) => ({
          id: paper.paperId || `semantic_${Date.now()}_${idx}_${Math.random().toString(36).substr(2)}`,
          title: paper.title || '',
          url: paper.url || '',
          content: paper.abstract || '',
          source: 'semantic-scholar',
          type: 'paper',
          domain: 'semanticscholar.org',
          citationCount: paper.citationCount || 0,
          year: paper.year || null,
          authors: paper.authors ? paper.authors.map(a => a.name).join(', ') : '',
          venue: paper.venue || '',
          pdfUrl: paper.openAccessPdf?.url || null
        }));
        console.log('[Semantic Scholar] 포맷된 결과:', formatted.length, '개');
        return formatted;
      }
      
      console.log('[Semantic Scholar] 결과 없음 (data 배열이 비어있음)');
      return [];
    } catch (error) {
      if (attempt < retries) {
        console.warn(`[Semantic Scholar] 시도 ${attempt + 1} 실패, 재시도 예정:`, error.message);
        continue;
      } else {
        console.error('[Semantic Scholar] 검색 실패 (모든 재시도 실패):', error.message);
        return [];
      }
    }
  }
  
  return [];
}

/**
 * 도메인 추출
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

/**
 * 신뢰도 점수 계산
 */
function calculateCredibilityScore(result) {
  let score = 0;

  // 출처 신뢰도 (40점)
  if (result.type === 'paper') {
    // 논문은 기본적으로 높은 신뢰도
    score += 50; // 40 → 50으로 상향
  } else {
    // 웹문서는 도메인 기반 평가
    const domain = result.domain?.toLowerCase() || '';
    
    // 교육 기관 (최고 신뢰)
    if (domain.includes('.edu') || domain.includes('.ac.')) {
      score += 45;
    }
    // 정부 기관
    else if (domain.includes('.gov') || domain.includes('.go.kr')) {
      score += 45;
    }
    // 학술/연구 기관
    else if (domain.includes('.org') && (
      domain.includes('research') || 
      domain.includes('academic') || 
      domain.includes('scholar')
    )) {
      score += 40;
    }
    // 일반 .org
    else if (domain.includes('.org')) {
      score += 30;
    }
    // 신뢰할 수 있는 뉴스/미디어
    else if (isTrustedNewsDomain(domain)) {
      score += 35;
    }
    // 신뢰할 수 있는 기술 사이트
    else if (isTrustedTechDomain(domain)) {
      score += 40;
    }
    // 일반 웹사이트
    else {
      score += 25; // 15 → 25로 상향
    }
  }

  // 인용 횟수 (20점) - 논문만
  if (result.type === 'paper') {
    if (result.citationCount && result.citationCount > 0) {
      const citations = result.citationCount;
      if (citations >= 1000) score += 20;
      else if (citations >= 500) score += 18;
      else if (citations >= 100) score += 15;
      else if (citations >= 50) score += 12;
      else if (citations >= 10) score += 8;
      else if (citations >= 1) score += 5;
    } else {
      // arXiv 등 인용 횟수가 없는 논문도 기본 점수 부여
      score += 8; // 인용 횟수 없어도 기본 점수
    }
  }

  // 최신성 (20점)
  const year = result.year || extractYearFromDate(result.date);
  if (year) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    if (age <= 1) score += 20;
    else if (age <= 3) score += 18; // 15 → 18
    else if (age <= 5) score += 15; // 10 → 15
    else if (age <= 10) score += 10; // 5 → 10
    else if (age <= 20) score += 5;
    else score += 2;
  } else {
    // 날짜 없으면 중간 점수 (웹문서는 최신일 가능성 높음)
    if (result.type === 'web') {
      score += 15; // 10 → 15
    } else {
      score += 10;
    }
  }

  // 도메인 신뢰도 보너스 (10점)
  if (result.type === 'web') {
    const domain = result.domain?.toLowerCase() || '';
    
    // 최고 신뢰 도메인
    const highlyTrusted = [
      'wikipedia.org', 'github.com', 'stackoverflow.com', 
      'mdn.io', 'developer.mozilla.org', 'w3.org',
      'ieee.org', 'acm.org', 'springer.com', 'nature.com',
      'science.org', 'cell.com', 'nejm.org'
    ];
    
    // 신뢰할 수 있는 도메인
    const trusted = [
      'medium.com', 'techcrunch.com', 'wired.com',
      'theverge.com', 'arstechnica.com', 'reddit.com/r/',
      'youtube.com', 'ted.com', 'khanacademy.org'
    ];
    
    if (highlyTrusted.some(d => domain.includes(d))) {
      score += 15; // 10 → 15
    } else if (trusted.some(d => domain.includes(d))) {
      score += 10;
    } else {
      score += 5;
    }
  } else {
    // 논문은 기본 보너스
    score += 12; // 10 → 12
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * 신뢰할 수 있는 뉴스 도메인 확인
 */
function isTrustedNewsDomain(domain) {
  const trustedNews = [
    'bbc.com', 'reuters.com', 'nytimes.com', 'theguardian.com',
    'wsj.com', 'washingtonpost.com', 'ap.org', 'npr.org',
    'economist.com', 'ft.com', 'bloomberg.com',
    'chosun.com', 'joongang.co.kr', 'donga.com', 'hani.co.kr'
  ];
  return trustedNews.some(d => domain.includes(d));
}

/**
 * 신뢰할 수 있는 기술 도메인 확인
 */
function isTrustedTechDomain(domain) {
  const trustedTech = [
    'github.com', 'stackoverflow.com', 'stackexchange.com',
    'developer.mozilla.org', 'w3.org', 'w3schools.com',
    'mdn.io', 'css-tricks.com', 'smashingmagazine.com',
    'techcrunch.com', 'wired.com', 'arstechnica.com',
    'ieee.org', 'acm.org', 'springer.com', 'nature.com'
  ];
  return trustedTech.some(d => domain.includes(d));
}

/**
 * 날짜에서 연도 추출
 */
function extractYearFromDate(dateStr) {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return date.getFullYear();
  } catch {
    const match = dateStr.match(/\d{4}/);
    return match ? parseInt(match[0]) : null;
  }
}

/**
 * 신뢰도 등급 반환
 */
function getCredibilityGrade(score) {
  if (score >= 90) return { grade: 'A', label: '매우 높음', color: 'high' };
  if (score >= 70) return { grade: 'B', label: '높음', color: 'high' };
  if (score >= 50) return { grade: 'C', label: '보통', color: 'medium' };
  if (score >= 30) return { grade: 'D', label: '낮음', color: 'low' };
  return { grade: 'F', label: '매우 낮음', color: 'low' };
}

/**
 * Research 핸들러
 */
async function handleResearch(action, request) {
  if (action === 'research:search') {
    const { query, sources } = request;
    console.log('[Research] 검색 시작:', query, sources);
    const results = [];

    try {
      // 웹 검색 - DuckDuckGo 사용 (무료, 제한 없음)
      if (sources.web) {
        console.log('[Research] DuckDuckGo 웹 검색 시작...');
        const webResults = await searchDuckDuckGo(query, 10);
        console.log('[Research] DuckDuckGo 결과:', webResults.length, '개');
        if (Array.isArray(webResults) && webResults.length > 0) {
          results.push(...webResults);
        } else {
          console.warn('[Research] DuckDuckGo 결과가 비어있음');
        }
      }

      // 논문 검색 - arXiv + Semantic Scholar (재시도)
      if (sources.papers) {
        console.log('[Research] 논문 검색 시작...');
        
        // arXiv 검색 (무료, 제한 없음)
        console.log('[Research] arXiv 검색 시작...');
        const arxivResults = await searchArxiv(query, 5);
        console.log('[Research] arXiv 결과:', arxivResults.length, '개');
        if (Array.isArray(arxivResults) && arxivResults.length > 0) {
          results.push(...arxivResults);
        }
        
        // Semantic Scholar 검색 (재시도 로직 포함)
        console.log('[Research] Semantic Scholar 검색 시작...');
        const paperResults = await searchSemanticScholar(query, 5);
        console.log('[Research] Semantic Scholar 결과:', paperResults.length, '개');
        if (Array.isArray(paperResults) && paperResults.length > 0) {
          results.push(...paperResults);
        }
      }

      console.log('[Research] 총 결과:', results.length, '개');

      // 신뢰도 평가
      const evaluatedResults = results.map(result => {
        const score = calculateCredibilityScore(result);
        return {
          ...result,
          credibilityScore: score,
          credibilityGrade: getCredibilityGrade(score)
        };
      });

      // 결과 저장
      await chrome.storage.local.set({ researchResults: evaluatedResults });

      console.log('[Research] 검색 완료:', evaluatedResults.length, '개');

      return {
        success: true,
        results: evaluatedResults,
        count: evaluatedResults.length
      };
    } catch (error) {
      console.error('[Research] 검색 오류:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  if (action === 'research:export-notion') {
    return await handleNotionExport(request);
  }

  return { success: false, error: 'Unknown research action' };
}

/**
 * 노션 내보내기
 */
async function handleNotionExport(request) {
  const { results, query } = request;
  
  try {
    // Chrome Storage에서 Notion 설정 가져오기
    const storage = await chrome.storage.local.get(['notionToken', 'notionParentPageId']);
    const token = storage.notionToken;
    const parentPageId = storage.notionParentPageId;

    if (!token || !parentPageId) {
      return {
        success: false,
        error: 'Notion API 키가 설정되지 않았습니다. 팝업에서 설정해주세요.'
      };
    }

    // 주제별 페이지 생성
    const pageTitle = `[리서치] ${query}`;
    const pageId = await createNotionPage(token, parentPageId, pageTitle);

    // 자료별로 블록 생성
    const blocks = results.map(result => {
      const content = `${result.title}\n\n${result.content || ''}\n\n출처: ${result.url}\n신뢰도: ${result.credibilityGrade.grade}등급 (${result.credibilityScore}점)${result.year ? `\n발행년도: ${result.year}년` : ''}${result.citationCount ? `\n인용 횟수: ${result.citationCount}회` : ''}`;
      
      return {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: content }
            }
          ]
        }
      };
    });

    // 한 번에 모든 블록 추가
    if (blocks.length > 0) {
      await appendNotionBlocks(token, pageId, blocks);
    }

    return { success: true, pageId };
  } catch (error) {
    console.error('노션 내보내기 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Notion 페이지 생성
 */
async function createNotionPage(token, parentPageId, title) {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      parent: { page_id: parentPageId },
      properties: {
        title: {
          title: [{ text: { content: title } }]
        }
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Notion 페이지 생성 실패');
  }

  const data = await response.json();
  return data.id;
}

/**
 * Notion 블록 추가
 */
async function appendNotionBlock(token, pageId, block) {
  const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      children: [block]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Notion 블록 추가 실패');
  }

  return await response.json();
}

/**
 * Notion에 여러 블록 추가
 */
async function appendNotionBlocks(token, pageId, blocks) {
  const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      children: blocks
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Notion 블록 추가 실패');
  }

  return await response.json();
}

// ========================================
// Focus Guard - 집중 관리 시스템
// ========================================

// 딴짓 사이트 목록
const DISTRACTION_DOMAINS = [
  'youtube.com', 'youtu.be', 'netflix.com', 'facebook.com',
  'instagram.com', 'twitter.com', 'x.com', 'reddit.com',
  'tiktok.com', 'twitch.tv', 'naver.com/entertain',
  'naver.com/sports', 'dcinside.com', 'fmkorea.com'
];

// 학습 사이트 목록
const STUDY_DOMAINS = [
  'notion.so', 'github.com', 'stackoverflow.com',
  'w3schools.com', 'mdn.io', 'developer.mozilla.org',
  'namu.wiki', 'ko.wikipedia.org'
];

// 활성 목표 추적
let activeGoals = {};
let distractionTimers = {};

// 잔소리 메시지
const WARNING_MESSAGES = {
  minute1: ["조금만 더 보면 안 될까요? 🤔", "아직 1분이에요, 괜찮아요!", "이제 돌아갈 시간이에요~"],
  minute3: ["벌써 3분이에요... 😅", "조금만 더 보면 안 될까요?", "공부할 시간이에요!"],
  minute5: ["야, {subject} 해야 한다며? 😤", "벌써 5분이에요! 돌아와요!", "{subject} 공부 안 할 거예요?", "5분이나 지났어요! 😱"],
  minute10: ["진짜로 그만하세요! 😡", "10분이나 딴짓했어요!", "{subject} 목표 달성 포기하시는 거예요?", "이제 정말 돌아와야 해요!"],
  minute15: ["15분이에요! 정말 심각해요! 😠", "목표 시간이 줄어들고 있어요!", "이대로 가면 목표 달성 못 해요!"],
  minute30: ["30분이나 지났어요! 😱", "목표의 절반을 딴짓으로 보냈어요!", "정말 심각한 상황이에요!"]
};

// 탭 변경 감지
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && Object.keys(activeGoals).length > 0) {
    checkTab(tab);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (Object.keys(activeGoals).length > 0) {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab) {
        checkTab(tab);
      }
    });
  }
});

// 주기적으로 활성 목표 확인 (타이머가 제대로 작동하는지)
setInterval(() => {
  if (Object.keys(activeGoals).length > 0) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        checkTab(tabs[0]);
      }
    });
  }
}, 30000); // 30초마다 한 번씩 확인

// 탭 확인
function checkTab(tab) {
  if (!tab || !tab.url) return;
  
  const isDistraction = isDistractionSite(tab.url) || isDistractionByTitle(tab.title);
  const isStudy = isStudySite(tab.url);
  
  // 활성 목표 확인 - 각 목표별로 독립적으로 처리
  Object.keys(activeGoals).forEach(goalId => {
    const goal = activeGoals[goalId];
    if (!goal || goal.status !== 'active') return;
    
    if (isDistraction) {
      // 딴짓 사이트 - 모든 활성 목표에 딴짓 시간 카운트
      startDistractionTimer(goalId, goal.subject);
      stopStudyTimer(goalId);
    } else {
      // 학습 사이트이거나 중립 사이트 → 모든 활성 목표에 공부 시간 카운트
      stopDistractionTimer(goalId);
      updateStudyTime(goalId);
    }
  });
}

// 딴짓 사이트 확인
function isDistractionSite(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    if (STUDY_DOMAINS.some(d => hostname.includes(d))) return false;
    return DISTRACTION_DOMAINS.some(d => hostname.includes(d));
  } catch {
    return false;
  }
}

// 학습 사이트 확인
function isStudySite(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return STUDY_DOMAINS.some(d => hostname.includes(d));
  } catch {
    return false;
  }
}

// 타이틀로 딴짓 확인
function isDistractionByTitle(title) {
  if (!title) return false;
  const lower = title.toLowerCase();
  return ['youtube', '넷플릭스', 'netflix', '게임', '방송'].some(k => lower.includes(k));
}

// 딴짓 타이머 시작
function startDistractionTimer(goalId, subject) {
  if (distractionTimers[goalId]) return;
  
  const startTime = Date.now();
  let lastUpdateTime = startTime;
  let lastWarningMinute = 0;
  
  distractionTimers[goalId] = setInterval(() => {
    const now = Date.now();
    const elapsedMinutes = Math.floor((now - startTime) / 60000);
    
    // 목표 업데이트 (1분마다)
    if (now - lastUpdateTime >= 60000) {
      chrome.storage.local.get(['focusGoals'], (result) => {
        const goals = result.focusGoals || [];
        const goal = goals.find(g => g.id === goalId);
        if (goal && goal.status === 'active') {
          goal.distractionMinutes = (goal.distractionMinutes || 0) + 1;
          chrome.storage.local.set({ focusGoals: goals });
        }
      });
      lastUpdateTime = now;
    }
    
    // 경고 메시지 (1, 3, 5, 10, 15, 30분마다, 한 번만)
    if (elapsedMinutes !== lastWarningMinute && [1, 3, 5, 10, 15, 30].includes(elapsedMinutes)) {
      lastWarningMinute = elapsedMinutes;
      sendWarningToTab(goalId, elapsedMinutes, subject);
    }
  }, 10000); // 10초마다 체크
}

// 딴짓 타이머 중지
function stopDistractionTimer(goalId) {
  if (distractionTimers[goalId]) {
    clearInterval(distractionTimers[goalId]);
    delete distractionTimers[goalId];
  }
}

// 공부 시간 업데이트 (1분마다)
let studyTimeTimers = {};
let studyTimeStartTimes = {};
let studyTimeLastUpdate = {};

function updateStudyTime(goalId) {
  // 타이머가 없으면 시작
  if (!studyTimeTimers[goalId]) {
    studyTimeStartTimes[goalId] = Date.now();
    studyTimeLastUpdate[goalId] = Date.now();
    
    console.log(`[Focus] 공부 시간 타이머 시작: ${goalId}`);
    
    studyTimeTimers[goalId] = setInterval(() => {
      const now = Date.now();
      
      // 1분 경과 확인
      if (now - studyTimeLastUpdate[goalId] >= 60000) {
        chrome.storage.local.get(['focusGoals'], (result) => {
          const goals = result.focusGoals || [];
          const goal = goals.find(g => g.id === goalId);
          if (goal && goal.status === 'active' && activeGoals[goalId]) {
            goal.studiedMinutes = (goal.studiedMinutes || 0) + 1;
            studyTimeLastUpdate[goalId] = now;
            chrome.storage.local.set({ focusGoals: goals }, () => {
              console.log(`[Focus] 공부 시간 업데이트: ${goalId} - ${goal.studiedMinutes}분`);
            });
          } else {
            // 목표가 비활성화되었으면 타이머 중지
            if (!goal || goal.status !== 'active') {
              stopStudyTimer(goalId);
            }
          }
        });
      }
    }, 10000); // 10초마다 체크
  }
}

// 공부 시간 타이머 중지
function stopStudyTimer(goalId) {
  if (studyTimeTimers[goalId]) {
    clearInterval(studyTimeTimers[goalId]);
    delete studyTimeTimers[goalId];
    delete studyTimeStartTimes[goalId];
    delete studyTimeLastUpdate[goalId];
    console.log(`[Focus] 공부 시간 타이머 중지: ${goalId}`);
  }
}

// 탭에 경고 전송
function sendWarningToTab(goalId, duration, subject) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'focus:warning',
        duration: duration,
        subject: subject
      }).catch(() => {
        // 탭이 닫혔거나 메시지를 받을 수 없는 경우 무시
      });
    }
  });
}

/**
 * Focus Guard 핸들러
 */
async function handleFocusGuard(action, request) {
  if (action === 'focus:start') {
    return new Promise((resolve) => {
      chrome.storage.local.get(['focusGoals'], (result) => {
        const goals = result.focusGoals || [];
        const goal = goals.find(g => g.id === request.goalId);
        if (goal && goal.status === 'active') {
          // 목표 객체 복사 (참조 문제 방지)
          activeGoals[request.goalId] = {
            id: goal.id,
            subject: goal.subject,
            hours: goal.hours,
            minutes: goal.minutes,
            status: goal.status,
            startedAt: goal.startedAt || Date.now()
          };
          
          console.log(`[Focus] 목표 시작: ${goal.subject} (${request.goalId})`);
          
          // 현재 탭 확인 및 공부 시간 시작
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              checkTab(tabs[0]);
            } else {
              // 탭이 없어도 공부 시간 시작 (중립 상태로)
              updateStudyTime(request.goalId);
            }
            resolve({ success: true });
          });
        } else {
          console.error(`[Focus] 목표 시작 실패: ${request.goalId} - 상태: ${goal?.status}`);
          resolve({ success: false, error: 'Goal not found or not active' });
        }
      });
    });
  }
  
  if (action === 'focus:pause' || action === 'focus:stop' || action === 'focus:delete') {
    delete activeGoals[request.goalId];
    stopDistractionTimer(request.goalId);
    stopStudyTimer(request.goalId);
    return { success: true };
  }
  
  if (action === 'focus:check-tab') {
    return new Promise((resolve) => {
      const isDistraction = isDistractionSite(request.url) || isDistractionByTitle(request.title);
      const activeGoalIds = Object.keys(activeGoals);
      
      if (isDistraction && activeGoalIds.length > 0) {
        // 첫 번째 활성 목표 사용
        const goalId = activeGoalIds[0];
        const goal = activeGoals[goalId];
        
        if (!goal) {
          resolve({ isDistraction: false });
          return;
        }
        
        // 딴짓 시간 계산
        chrome.storage.local.get(['focusGoals'], (result) => {
          const goals = result.focusGoals || [];
          const storedGoal = goals.find(g => g.id === goalId);
          const distractionMinutes = storedGoal ? (storedGoal.distractionMinutes || 0) : 0;
          
          // 타이머가 실행 중이면 경과 시간도 고려
          let currentDuration = distractionMinutes;
          if (distractionTimers[goalId] && goal.startedAt) {
            const elapsed = Math.floor((Date.now() - goal.startedAt) / 60000);
            currentDuration = Math.max(distractionMinutes, elapsed);
          }
          
          resolve({
            isDistraction: true,
            duration: Math.max(currentDuration, 1),
            subject: goal.subject || '공부'
          });
        });
      } else {
        resolve({ isDistraction: false });
      }
    });
  }
  
  if (action === 'focus:get-message') {
    const duration = request.duration || 0;
    let messages;
    
    if (duration >= 30) messages = WARNING_MESSAGES.minute30;
    else if (duration >= 15) messages = WARNING_MESSAGES.minute15;
    else if (duration >= 10) messages = WARNING_MESSAGES.minute10;
    else if (duration >= 5) messages = WARNING_MESSAGES.minute5;
    else if (duration >= 3) messages = WARNING_MESSAGES.minute3;
    else messages = WARNING_MESSAGES.minute1;
    
    const message = messages[Math.floor(Math.random() * messages.length)]
      .replace('{subject}', request.subject || '공부');
    
    return { message };
  }
  
  return { success: false, error: 'Unknown focus action' };
}

/**
 * 메시지 라우터
 * action 형식: 'module:method' (예: 'real-time:explain', 'quiz:generate')
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  const action = request.action || '';
  const [module, method] = action.split(':');
  
  // Research 액션 (우선 처리)
  if (action.startsWith('research:')) {
    handleResearch(action, request)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  // Focus Guard 액션
  if (action.startsWith('focus:')) {
    handleFocusGuard(action, request)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  // real-time 모듈
  if (module === 'real-time' || action === 'explain') {
    handleRealTime(method || action, request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  // quiz 모듈
  if (module === 'quiz') {
    handleQuiz(method, request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  // notion 모듈
  if (module === 'notion') {
    handleNotion(method, request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  // notion-save 액션 (Content Script에서 직접 호출)
  if (action === 'notion-save') {
    handleNotionSave(request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  // 알 수 없는 액션
  console.warn('Unknown action:', action);
  sendResponse({ success: false, error: 'Unknown action' });
  return true;
});

/**
 * real-time 모듈 핸들러
 */
async function handleRealTime(method, data) {
  if (method === 'explain') {
    return await generateExplanation(data);
  }
  throw new Error('Unknown real-time method: ' + method);
}

/**
 * quiz 모듈 핸들러
 */
async function handleQuiz(method, data) {
  if (method === 'generate') {
    return await generateQuiz(data);
  }
  else if (method === 'grade') {
    return await gradeSubjective(data);
  }
  throw new Error('Unknown quiz method: ' + method);
}

/**
 * 실시간 설명 생성
 */
async function generateExplanation(data) {
  const { selectedText, pageTitle, pageUrl } = data;
  
  const systemPrompt = '당신은 대학생의 학습을 돕는 AI 도우미입니다. 전문 용어는 쉽게 풀어서 설명하고, 구체적인 예시를 포함하여 3-5줄로 간결하게 설명해주세요.';
  
  const userPrompt = `페이지: ${pageTitle}
URL: ${pageUrl}
선택된 텍스트: "${selectedText}"

이 텍스트를 현재 페이지의 맥락에 맞춰 쉽고 명확하게 설명해주세요.`;
  
  const result = await callGPTAPI(systemPrompt, userPrompt);
  
  if (result.success) {
    return {
      success: true,
      explanation: result.content
    };
  } else {
    return result;
  }
}

/**
 * 퀴즈 생성
 */
async function generateQuiz(data) {
  const { selectedText, pageTitle, pageUrl, quizType } = data;
  
  let systemPrompt = '당신은 교육용 퀴즈를 만드는 전문가입니다.';
  let userPrompt = '';
  
  // 퀴즈 타입별 프롬프트
  if (quizType === 'ox') {
    userPrompt = `다음 내용으로 OX 퀴즈 1개를 만들어주세요:

내용: "${selectedText}"
페이지: ${pageTitle}

형식:
문제: [참/거짓을 판단할 명확한 진술]
정답: O 또는 X
해설: [왜 그런지 간단히]`;
  }
  else if (quizType === 'multiple-choice') {
    userPrompt = `다음 내용으로 4지선다 퀴즈 1개를 만들어주세요:

내용: "${selectedText}"
페이지: ${pageTitle}

형식:
질문: [명확한 질문]
1) [보기1]
2) [보기2]
3) [보기3]
4) [보기4]
정답: [번호]
해설: [설명]`;
  }
  else if (quizType === 'subjective') {
    userPrompt = `다음 내용으로 주관식 문제 1개를 만들어주세요:

내용: "${selectedText}"
페이지: ${pageTitle}

형식:
문제: [서술형 질문]
모범답안: [핵심 키워드 포함한 답]
채점기준: [반드시 포함되어야 할 키워드 3개, 콤마로 구분]`;
  }
  
  const result = await callGPTAPI(systemPrompt, userPrompt, { max_tokens: 300 });
  
  if (result.success) {
    // 퀴즈 데이터 파싱
    const quiz = parseQuizResponse(result.content, quizType);
    return {
      success: true,
      quiz: quiz,
      rawContent: result.content
    };
  } else {
    return result;
  }
}

/**
 * 퀴즈 응답 파싱
 */
function parseQuizResponse(content, quizType) {
  // 간단한 파싱 (추후 개선 가능)
  return {
    type: quizType,
    rawContent: content,
    // 실제 파싱 로직은 클라이언트에서 처리
  };
}

/**
 * 주관식 채점
 */
async function gradeSubjective(data) {
  const { userAnswer, correctAnswer, keywords, question } = data;
  
  const systemPrompt = '당신은 공정한 채점자입니다.';
  const userPrompt = `다음 답안을 채점해주세요:

문제: ${question}
학생 답안: ${userAnswer}
모범 답안: ${correctAnswer}
필수 키워드: ${keywords.join(', ')}

채점 기준:
- 필수 키워드 포함 여부
- 내용의 정확성
- 논리적 서술

형식:
점수: [0-100]
평가: [잘한 점과 보완할 점]`;
  
  const result = await callGPTAPI(systemPrompt, userPrompt);
  
  if (result.success) {
    return {
      success: true,
      grading: result.content
    };
  } else {
    return result;
  }
}

/**
 * notion 모듈 핸들러
 */
async function handleNotion(method, data) {
  if (method === 'classify-subject') {
    return await classifySubject(data);
  }
  throw new Error('Unknown notion method: ' + method);
}

/**
 * Notion 저장 핸들러 (날짜별 하위 페이지 생성)
 */
async function handleNotionSave(data) {
  try {
    console.log('🔵 [Background] Notion 저장 시작');
    
    const { selectedText, pageUrl, pageTitle, timestamp } = data;
    
    // Chrome Storage에서 Notion 설정 가져오기
    const config = await chrome.storage.local.get(['notionToken', 'notionParentPageId']);
    
    console.log('🔵 [Background] Notion 설정:', {
      hasToken: !!config.notionToken,
      hasParentPageId: !!config.notionParentPageId
    });
    
    if (!config.notionToken || !config.notionParentPageId) {
      throw new Error('Notion 설정이 필요합니다. 팝업에서 Token과 상위 페이지 ID를 설정해주세요.');
    }
    
    // 날짜 및 시간 포맷팅
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const timeStr = `${hours}:${minutes}`;
    
    console.log('🔵 [Background] 날짜:', dateStr, '시간:', timeStr);
    
    // 1. 오늘 날짜 페이지 찾기 또는 생성
    const dailyPageId = await findOrCreateDailyPage(
      config.notionToken,
      config.notionParentPageId,
      dateStr
    );
    
    console.log('🔵 [Background] 날짜 페이지 ID:', dailyPageId);
    
    // 2. 날짜 페이지에 내용 추가
    const blocks = [
      {
        object: 'block',
        type: 'divider',
        divider: {}
      },
      {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{
            text: { content: `⏰ ${timeStr}` }
          }],
          color: 'blue'
        }
      },
      {
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: [{
            text: { content: selectedText.substring(0, 2000) }
          }],
          color: 'blue_background'
        }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { text: { content: '🔗 ' } },
            { 
              text: { 
                content: pageTitle.substring(0, 100),
                link: { url: pageUrl }
              }
            }
          ]
        }
      }
    ];
    
    console.log('🔵 [Background] 날짜 페이지에 내용 추가 중...');
    
    const response = await fetch(
      `https://api.notion.com/v1/blocks/${dailyPageId}/children`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${config.notionToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ children: blocks })
      }
    );
    
    console.log('🔵 [Background] Notion API 응답:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [Background] Notion API 에러:', errorData);
      throw new Error(`Notion API 오류: ${errorData.message || response.statusText}`);
    }
    
    await response.json();
    console.log('✅ [Background] Notion 저장 완료!');
    
    return {
      success: true,
      message: '노션에 저장 완료!'
    };
    
  } catch (error) {
    console.error('❌ [Background] Notion 저장 실패:', error);
    throw error;
  }
}

/**
 * 날짜별 페이지 찾기 또는 생성
 */
async function findOrCreateDailyPage(token, parentPageId, dateStr) {
  console.log('📅 [Background] 날짜 페이지 검색 중:', dateStr);
  
  // 1. 상위 페이지의 하위 페이지들 조회
  const listResponse = await fetch(
    `https://api.notion.com/v1/blocks/${parentPageId}/children`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28'
      }
    }
  );
  
  if (listResponse.ok) {
    const data = await listResponse.json();
    const targetTitle = `📅 ${dateStr}`;
    
    // 오늘 날짜 페이지 찾기
    for (const block of data.results) {
      if (block.type === 'child_page') {
        const title = block.child_page?.title || '';
        if (title === targetTitle) {
          console.log('📅 [Background] 기존 날짜 페이지 발견!');
          return block.id;
        }
      }
    }
  }
  
  // 2. 없으면 새로 생성
  console.log('📅 [Background] 새 날짜 페이지 생성 중...');
  
  const createResponse = await fetch(
    'https://api.notion.com/v1/pages',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: {
          page_id: parentPageId
        },
        properties: {
          title: {
            title: [{
              text: {
                content: `📅 ${dateStr}`
              }
            }]
          }
        },
        icon: {
          type: 'emoji',
          emoji: '📚'
        }
      })
    }
  );
  
  if (!createResponse.ok) {
    const errorData = await createResponse.json();
    throw new Error(`날짜 페이지 생성 실패: ${errorData.message}`);
  }
  
  const pageData = await createResponse.json();
  console.log('📅 [Background] 새 날짜 페이지 생성 완료!');
  
  return pageData.id;
}

/**
 * AI 과목 자동 분류
 */
async function classifySubject(data) {
  const { selectedText, pageTitle, pageUrl } = data;
  
  const systemPrompt = '당신은 학습 내용을 과목별로 분류하는 전문가입니다.';
  
  const userPrompt = `다음 텍스트가 어떤 과목/분야에 해당하는지 **한 단어로만** 답해줘.

📖 페이지 정보:
- 제목: ${pageTitle}
- URL: ${pageUrl}

📝 선택한 텍스트:
${selectedText.substring(0, 300)}${selectedText.length > 300 ? '...' : ''}

과목 예시:
- 컴퓨터: 프로그래밍, 데이터베이스, 알고리즘, 운영체제, 네트워크, 웹개발, 자료구조
- 수학: 미적분학, 선형대수, 통계학, 이산수학
- 언어: 영어, 일본어, 중국어
- 기타: 경제학, 물리학, 화학, 생물학, 심리학 등

**규칙:**
1. 반드시 **한 단어**로만 답할 것 (예: "데이터베이스", "영어")
2. 학문 분야를 구체적으로 (예: "컴퓨터" 대신 "데이터베이스")
3. 한글로 답할 것
4. 추가 설명 없이 과목명만

과목명:`;
  
  const result = await callGPTAPI(systemPrompt, userPrompt, { max_tokens: 20 });
  
  if (result.success) {
    // 응답에서 과목명만 추출 (공백 제거)
    const subject = result.content.trim();
    return {
      success: true,
      subject: subject
    };
  } else {
    return result;
  }
}

