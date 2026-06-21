import OpenAI from 'openai'
import { SummarizeResponse } from './types'

let _openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _openai
}

const LENGTH_MAP = {
  short: '3~5개의 핵심 포인트',
  medium: '5~7개의 핵심 포인트',
  long: '7~10개의 핵심 포인트',
}

const READING_TIME_MAP = {
  short: '30초',
  medium: '1분',
  long: '3분',
}

export async function summarizeVideo(
  title: string,
  description: string,
  channelTitle: string,
  sourceLang: string,
  lengthType: 'short' | 'medium' | 'long' = 'short'
): Promise<SummarizeResponse> {
  const openai = getOpenAI()

  const needsTranslation = sourceLang !== 'ko'
  const translationNote = needsTranslation
    ? `이 영상은 ${getLanguageName(sourceLang)} 영상입니다. 내용을 한국어로 번역하여 요약해주세요.`
    : '이 영상의 핵심 내용을 한국어로 요약해주세요.'

  const prompt = `다음 유튜브 영상 정보를 기반으로 ${translationNote}

채널: ${channelTitle}
제목: ${title}
설명:
${description.slice(0, 2000)}

요약 지침:
- ${LENGTH_MAP[lengthType]}를 추출하세요
- 각 포인트는 1~2문장으로 명확하게
- 시청자가 영상을 보지 않아도 핵심을 파악할 수 있게 작성
- 불필요한 홍보 문구나 채널 구독 권유는 제외

반드시 다음 JSON 형식으로만 응답하세요:
{
  "summary": "전체 내용을 2~3문장으로 요약",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "readingTime": "${READING_TIME_MAP[lengthType]}"
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            '당신은 유튜브 영상 내용을 정확하고 명확하게 한국어로 요약하는 AI 전문가입니다. 항상 JSON 형식으로만 응답합니다.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.3,
    })

    const content = response.choices[0].message.content || '{}'
    const parsed = JSON.parse(content)

    return {
      summary: parsed.summary || '요약을 생성할 수 없습니다.',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      readingTime: parsed.readingTime || READING_TIME_MAP[lengthType],
    }
  } catch (error) {
    console.error('OpenAI summarization error:', error)
    return {
      summary: '요약 생성 중 오류가 발생했습니다.',
      keyPoints: [],
      readingTime: READING_TIME_MAP[lengthType],
    }
  }
}

function getLanguageName(lang: string): string {
  const map: Record<string, string> = {
    en: '영어',
    ja: '일본어',
    zh: '중국어',
    ko: '한국어',
  }
  return map[lang] || lang
}
