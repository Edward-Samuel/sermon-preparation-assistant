// LLM helper: auth and chat completion for sermon generation
import { SermonInput } from './types'

function buildChatRequestBody(prompt: string): Record<string, unknown> {
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const chatModel = process.env.CHAT_MODEL || 'gpt-4o-mini'
  const glooTradition = process.env.GLOO_TRADITION
  const glooModelFamily = process.env.GLOO_MODEL_FAMILY
  const isGlooV2 = baseUrl.includes('platform.ai.gloo.com/ai/v2')

  const body: Record<string, unknown> = {
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate the sermon preparation pack now.' },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  }

  if (!isGlooV2) {
    body.model = chatModel
    return body
  }

  if (glooTradition) {
    body.tradition = glooTradition
  }

  if (chatModel === 'auto') {
    body.auto_routing = true
    return body
  }

  if (glooModelFamily) {
    body.model_family = glooModelFamily
    body.auto_routing = false
    return body
  }

  body.model = chatModel
  body.auto_routing = false
  return body
}

export async function getAuthToken(): Promise<string> {
  const directApiKey = process.env.OPENAI_API_KEY
  if (directApiKey) return directApiKey

  const clientId = process.env.GLOO_CLIENT_ID
  const clientSecret = process.env.GLOO_CLIENT_SECRET
  const tokenUrl = process.env.GLOO_TOKEN_URL || 'https://platform.ai.gloo.com/oauth2/token'

  if (!clientId || !clientSecret) {
    throw new Error(
      'LLM not configured: set OPENAI_API_KEY or GLOO_CLIENT_ID and GLOO_CLIENT_SECRET'
    )
  }

  const basicAuth =
    typeof Buffer !== 'undefined'
      ? Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      : btoa(`${clientId}:${clientSecret}`)

  const resp = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'api/access',
    }).toString(),
  })

  if (!resp.ok) {
    const body = await resp.text()
    throw new Error(`Token API failed (${resp.status}): ${body}`)
  }

  const data = await resp.json()
  const token = data.access_token as string | undefined

  if (!token) {
    throw new Error('Token API succeeded but did not return access_token')
  }

  return token
}

export function buildSermonPrompt(input: SermonInput): string {
  const toneLabels: Record<string, string> = {
    expository: 'expository, verse-by-verse exposition',
    topical: 'topical, thematic exploration',
    evangelistic: 'evangelistic, gospel proclamation',
    youth: 'youth-oriented, engaging and relatable',
    'bible-study': 'bible-study, teaching and discovery',
    'pastoral-care': 'pastoral care, shepherding and comfort',
  }

  const languageLabels: Record<string, string> = {
    en: 'English',
    ta: 'Tamil (தமிழ்)',
    ml: 'Malayalam (മലയാളം)',
    te: 'Telugu (తెలుగు)',
  }
  const langLabel = languageLabels[input.language] || 'English'

  return `You are a seasoned pastor and Bible teacher with decades of experience preparing sermons. Your task is to generate a comprehensive sermon preparation pack. Tailor theological emphasis, liturgical suggestions, and pastoral application to fit the specified denominational tradition.

CRITICAL LANGUAGE REQUIREMENT: Write ALL field values (title, bigIdea, pastoralAim, introductionHook, outline points, explanations, transitions, historicalCulturalBackground, theologicalThemes, illustrationSuggestions, applicationSteps, discussionQuestions, smallGroupTeachingNotes, prayerPoints, closingChallenge) entirely in ${langLabel}. The JSON KEYS must remain in English exactly as specified, but every human-readable VALUE must be written in ${langLabel}.

SERMON PARAMETERS:
- Topic: ${input.topic || '(not specified)'}
- Scripture: ${input.scripture || '(not specified)'}
- Audience: ${input.audience || 'General congregation'}
- Sermon Length: ${input.sermonLength || 'standard'}
- Tone/Style: ${toneLabels[input.tone] || input.tone}
- Denomination / Tradition: ${input.denomination || 'General / Not specified'}
- Output Language: ${langLabel}
- Additional Notes: ${input.notes || '(none)'}

You MUST respond with valid JSON only. Do NOT wrap the JSON in markdown code fences, backticks, or any other formatting. Output raw JSON and nothing else.

The JSON must have exactly this structure:
{
  "title": "string — compelling sermon title",
  "bigIdea": "string — one-sentence thesis/big idea of the sermon",
  "pastoralAim": "string — what the sermon aims to accomplish in the congregation",
  "introductionHook": "string — engaging opening paragraph to capture attention",
  "outline": [
    {
      "pointTitle": "string — e.g. 'I. The Foundation'",
      "explanation": "string — detailed explanation of this point (2-4 sentences)",
      "transition": "string — transition sentence to next point"
    }
  ],
  "keyScriptureReferences": ["string — primary passage and 2-4 key cross-references"],
  "supportingVerses": ["string — 4-8 additional supporting verse references"],
  "historicalCulturalBackground": "string — relevant historical/cultural context paragraph",
  "theologicalThemes": ["string — 3-5 theological themes explored"],
  "illustrationSuggestions": ["string — 3-5 illustration/analogy ideas"],
  "applicationSteps": ["string — 3-6 practical application steps"],
  "discussionQuestions": ["string — 4-6 small group discussion questions"],
  "smallGroupTeachingNotes": "string — guidance for leading a small group study",
  "prayerPoints": ["string — 4-6 prayer points related to the sermon"],
  "closingChallenge": "string — powerful closing challenge paragraph",
  "relatedVideos": [
    {
      "title": "string — descriptive title of the video",
      "description": "string — one-sentence description",
      "videoId": "string — leave this as an empty string; the server resolves the real video ID from searchQuery",
      "searchQuery": "string — a precise YouTube search query that will surface the intended video as the TOP result (include video title and artist/channel where helpful)"
    }
  ],
  "worshipSongs": [
    {
      "title": "string — song title",
      "artist": "string — artist or worship collective",
      "videoId": "string — leave this as an empty string; the server resolves the real video ID from searchQuery",
      "searchQuery": "string — a precise YouTube search query that will surface the intended video as the TOP result (include song title and artist where helpful)"
    }
  ]
}

IMPORTANT RULES:
1. Output ONLY valid JSON. No markdown, no backticks, no commentary before or after.
2. Use accurate Scripture references. Quote Bible passages faithfully.
3. The outline should have 3-4 points (4 if sermon length is extended/long).
4. Make the content substantive, theologically sound, and practically applicable.
5. All string values must be properly escaped for JSON (no unescaped newlines or quotes).
6. Include 4–6 related videos and 4–6 worship songs that fit the sermon topic and tone. Use well-known sermons, teaching videos, and popular worship songs.
7. For "relatedVideos" and "worshipSongs": when the output language is not English, suggest videos and worship songs that ACTUALLY EXIST in ${langLabel} (e.g. popular ${langLabel} Christian worship songs and ${langLabel} Bible teaching/sermon videos). Write the "title", "description", and "artist" in ${langLabel}, and write the "searchQuery" in ${langLabel} so it finds ${langLabel}-language results on YouTube. Scripture references may remain in standard book-name form.
8. Leave "videoId" as an empty string for all items — the server automatically resolves real YouTube video IDs from your searchQuery. Focus your effort on writing a precise "searchQuery" that will surface the intended video as the top YouTube result.`
}

export async function callLLM(prompt: string): Promise<string> {
  const apiKey = await getAuthToken()
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'

  const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(buildChatRequestBody(prompt)),
  })

  if (!resp.ok) {
    const body = await resp.text()
    throw new Error(`LLM API failed (${resp.status}): ${body}`)
  }

  const completion = await resp.json()
  return (completion.choices?.[0]?.message?.content || '') as string
}
