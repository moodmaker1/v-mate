/**
 * Notion API 연동 모듈 (페이지 기반)
 * 날짜별 하위 페이지에 내용 저장
 */

const NotionAPI = {
  /**
   * Notion에 저장 (최상단 페이지에 바로 추가)
   * @param {Object} data - 저장할 데이터
   * @returns {Promise<Object>} API 응답
   */
  async saveToNotion(data) {
    try {
      console.log('🔵 NotionAPI.saveToNotion 시작');
      
      // Chrome storage에서 Notion 설정 가져오기
      const config = await this.getNotionConfig();
      console.log('🔵 Notion 설정:', {
        hasToken: !!config.token,
        hasParentPageId: !!config.parentPageId,
        parentPageId: config.parentPageId
      });
      
      if (!config.token || !config.parentPageId) {
        throw new Error('Notion 설정이 필요합니다. 확장 프로그램 팝업에서 Token과 상위 페이지 ID를 설정해주세요.');
      }

      const {
        selectedText,   // 드래그한 텍스트
        pageUrl,       // 출처 URL
        pageTitle,     // 페이지 제목
        timestamp      // 저장 시간
      } = data;

      const dateTime = this.formatDateTime(timestamp);
      console.log('🔵 저장할 데이터:', {
        dateTime,
        textLength: selectedText.length,
        pageTitle,
        pageUrl
      });

      // 최상단 페이지에 바로 내용 추가
      console.log('🔵 appendContentToPage 호출 중...');
      await this.appendContentToPage(config, config.parentPageId, {
        selectedText,
        pageUrl,
        pageTitle,
        dateTime
      });

      console.log('🔵 NotionAPI.saveToNotion 완료!');
      return {
        success: true,
        message: '노션에 저장 완료!'
      };

    } catch (error) {
      console.error('❌ NotionAPI.saveToNotion 실패:', error);
      throw error;
    }
  },

  /**
   * 최상단 페이지에 바로 내용 추가 (간단 버전)
   */
  async appendContentToPage(config, pageId, content) {
    const { selectedText, pageUrl, pageTitle, dateTime } = content;
    
    console.log('🟢 appendContentToPage 시작');
    console.log('🟢 pageId:', pageId);

    const blocks = [
      // 구분선
      {
        object: 'block',
        type: 'divider',
        divider: {}
      },
      // 날짜 및 시간 헤더
      {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              text: {
                content: `📅 ${dateTime}`
              }
            }
          ],
          color: 'blue'
        }
      },
      // 저장한 내용
      {
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: [
            {
              text: {
                content: selectedText.substring(0, 2000) // 2000자 제한
              }
            }
          ],
          color: 'blue_background'
        }
      },
      // 출처 링크
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              text: {
                content: '🔗 ',
              }
            },
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

    console.log('🟢 Notion API 호출 중...', `https://api.notion.com/v1/blocks/${pageId}/children`);
    
    // 블록 추가
    const response = await fetch(
      `https://api.notion.com/v1/blocks/${pageId}/children`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ children: blocks })
      }
    );

    console.log('🟢 Notion API 응답 상태:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Notion API 에러:', errorData);
      throw new Error(`내용 추가 실패: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('🟢 appendContentToPage 완료!');
    return result;
  },

  /**
   * 날짜 및 시간 포맷팅 (YYYY-MM-DD HH:MM)
   */
  formatDateTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  /**
   * 날짜별 페이지 찾기 또는 생성 (더 이상 사용 안 함)
   */
  async findOrCreateDailyPage(config, dateStr) {
    // 1. 먼저 오늘 날짜 페이지가 있는지 검색
    const existingPage = await this.searchDailyPage(config, dateStr);
    
    if (existingPage) {
      console.log('📅 기존 날짜 페이지 발견:', dateStr);
      return existingPage.id;
    }

    // 2. 없으면 새로 생성
    console.log('📅 새 날짜 페이지 생성:', dateStr);
    return await this.createDailyPage(config, dateStr);
  },

  /**
   * 날짜 페이지 검색
   */
  async searchDailyPage(config, dateStr) {
    try {
      // 상위 페이지의 하위 페이지들 조회
      const response = await fetch(
        `https://api.notion.com/v1/blocks/${config.parentPageId}/children`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${config.token}`,
            'Notion-Version': '2022-06-28'
          }
        }
      );

      if (!response.ok) {
        console.warn('하위 페이지 조회 실패:', response.statusText);
        return null;
      }

      const data = await response.json();
      
      // 오늘 날짜 페이지 찾기
      const targetTitle = `📅 ${dateStr}`;
      const dailyPage = data.results.find(block => {
        if (block.type === 'child_page') {
          const title = block.child_page?.title || '';
          return title === targetTitle;
        }
        return false;
      });

      return dailyPage || null;

    } catch (error) {
      console.error('날짜 페이지 검색 실패:', error);
      return null;
    }
  },

  /**
   * 새 날짜 페이지 생성
   */
  async createDailyPage(config, dateStr) {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: {
          page_id: config.parentPageId
        },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: `📅 ${dateStr}`
                }
              }
            ]
          }
        },
        icon: {
          type: 'emoji',
          emoji: '📚'
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`날짜 페이지 생성 실패: ${errorData.message || response.statusText}`);
    }

    const pageData = await response.json();
    return pageData.id;
  },

  /**
   * 날짜 페이지에 새 내용 추가
   */
  async appendContentToDailyPage(config, pageId, content) {
    const { subject, selectedText, note, pageUrl, pageTitle, time } = content;

    const blocks = [
      // 구분선
      {
        object: 'block',
        type: 'divider',
        divider: {}
      },
      // 제목 (과목 + 시간)
      {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              text: {
                content: `${subject} (${time})`
              }
            }
          ],
          color: 'blue'
        }
      },
      // 핵심 개념
      {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              text: {
                content: '🔑 핵심 개념'
              }
            }
          ]
        }
      },
      {
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: [
            {
              text: {
                content: selectedText
              }
            }
          ],
          color: 'blue_background'
        }
      }
    ];

    // 메모가 있으면 추가
    if (note) {
      blocks.push(
        {
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [
              {
                text: {
                  content: '💡 내 생각/질문'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'callout',
          callout: {
            icon: { type: 'emoji', emoji: '💭' },
            rich_text: [
              {
                text: {
                  content: note
                }
              }
            ],
            color: 'yellow_background'
          }
        }
      );
    }

    // 출처 추가
    blocks.push(
      {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              text: {
                content: '🔗 출처'
              }
            }
          ]
        }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              text: {
                content: pageTitle,
                link: { url: pageUrl }
              }
            }
          ]
        }
      }
    );

    // 블록 추가
    const response = await fetch(
      `https://api.notion.com/v1/blocks/${pageId}/children`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ children: blocks })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`내용 추가 실패: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Chrome storage에서 Notion 설정 가져오기
   */
  async getNotionConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['notionToken', 'notionParentPageId'], (result) => {
        resolve({
          token: result.notionToken || '',
          parentPageId: result.notionParentPageId || ''
        });
      });
    });
  },

  /**
   * 날짜 포맷팅 (YYYY-MM-DD)
   */
  formatDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 시간 포맷팅 (HH:MM)
   */
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  /**
   * Notion 연결 테스트
   */
  async testConnection() {
    try {
      const config = await this.getNotionConfig();
      
      if (!config.token || !config.parentPageId) {
        return {
          success: false,
          message: 'Token과 상위 페이지 ID를 입력해주세요.'
        };
      }

      // 상위 페이지 정보 조회로 연결 테스트
      const response = await fetch(`https://api.notion.com/v1/pages/${config.parentPageId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Notion-Version': '2022-06-28'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: `연결 실패: ${errorData.message || response.statusText}`
        };
      }

      const pageData = await response.json();
      const pageTitle = pageData.properties?.title?.title?.[0]?.plain_text || 'Untitled';
      
      return {
        success: true,
        message: `연결 성공! 상위 페이지: ${pageTitle}`
      };
    } catch (error) {
      return {
        success: false,
        message: `오류: ${error.message}`
      };
    }
  }
};

// Content script에서 사용 가능하도록 전역 객체로 노출
if (typeof window !== 'undefined') {
  window.NotionAPI = NotionAPI;
}

