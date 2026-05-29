import { NextRequest, NextResponse } from 'next/server'
import { SermonInput, SermonPack, SermonTone, Language } from '@/lib/types'
import { buildSermonPrompt, callLLM } from '@/lib/llm'
import { pickRelatedVideos, pickWorshipSongs } from '@/lib/sermon-generator'
import { resolveVideoIds } from '@/lib/youtube'

const VALID_LANGUAGES: Language[] = ['en', 'ta', 'ml', 'te']

/**
 * POST /api/generate — Generate a sermon pack using AI.
 *
 * Body: { topic, scripture, audience, sermonLength, tone, notes }
 * Response: { success: true, pack: SermonPack }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { topic, scripture, audience, sermonLength, tone, denomination, notes, language } = body as {
      topic?: string
      scripture?: string
      audience?: string
      sermonLength?: string
      tone?: string
      denomination?: string
      notes?: string
      language?: string
    }

    if (language && !VALID_LANGUAGES.includes(language as Language)) {
      return NextResponse.json({ success: false, error: `Unsupported language: ${language}` }, { status: 400 })
    }

    const input: SermonInput = {
      topic: topic || '',
      scripture: scripture || '',
      audience: audience || '',
      sermonLength: sermonLength || 'standard',
      tone: (tone as SermonTone) || 'expository',
      denomination: denomination || '',
      notes: notes || '',
      language: (language as Language) || 'en',
    }

    const prompt = buildSermonPrompt(input)
    const rawContent = await callLLM(prompt)

    // Parse JSON response (strip markdown fences if the LLM added them)
    let jsonStr = rawContent.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
    }

    let parsed: Omit<SermonPack, 'id' | 'createdAt' | 'input'>
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      throw new Error(
        `LLM returned invalid JSON. Raw response:\n${rawContent.slice(0, 2000)}`
      )
    }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    const createdAt = new Date().toISOString()

    const baseRelatedVideos = parsed.relatedVideos || pickRelatedVideos(input)
    const baseWorshipSongs = parsed.worshipSongs || pickWorshipSongs(input)

    // Resolve REAL YouTube video IDs from each item's searchQuery (LLM IDs are unreliable).
    // Falls back to undefined videoId (UI shows a "Search on YouTube" link) on failure.
    const [videoIds, songIds] = await Promise.all([
      resolveVideoIds(baseRelatedVideos.map((v) => v.searchQuery || v.title)),
      resolveVideoIds(baseWorshipSongs.map((s) => s.searchQuery || `${s.title} ${s.artist}`)),
    ])

    const relatedVideos = baseRelatedVideos.map((v, i) => ({ ...v, videoId: videoIds[i] || undefined }))
    const worshipSongs = baseWorshipSongs.map((s, i) => ({ ...s, videoId: songIds[i] || undefined }))

    const pack: SermonPack = {
      id,
      createdAt,
      input,
      title: parsed.title || 'Untitled Sermon',
      bigIdea: parsed.bigIdea || '',
      pastoralAim: parsed.pastoralAim || '',
      introductionHook: parsed.introductionHook || '',
      outline: parsed.outline || [],
      keyScriptureReferences: parsed.keyScriptureReferences || [],
      supportingVerses: parsed.supportingVerses || [],
      historicalCulturalBackground: parsed.historicalCulturalBackground || '',
      theologicalThemes: parsed.theologicalThemes || [],
      illustrationSuggestions: parsed.illustrationSuggestions || [],
      applicationSteps: parsed.applicationSteps || [],
      discussionQuestions: parsed.discussionQuestions || [],
      smallGroupTeachingNotes: parsed.smallGroupTeachingNotes || '',
      prayerPoints: parsed.prayerPoints || [],
      closingChallenge: parsed.closingChallenge || '',
      relatedVideos,
      worshipSongs,
    }

    return NextResponse.json({ success: true, pack })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
