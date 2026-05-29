import { SavedSermon, SermonPack, SermonInput } from './types'

const STORAGE_KEY = 'sermon-prep-history'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getSavedSermons(): SavedSermon[] {
  if (!isBrowser()) return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return (JSON.parse(data) as SavedSermon[]).map((s) => ({ ...s, pack: normalizeSermonPack(s.pack) }))
  } catch {
    return []
  }
}

export function saveSermon(pack: SermonPack): SavedSermon[] {
  const saved = getSavedSermons()
  const entry: SavedSermon = {
    id: pack.id,
    createdAt: pack.createdAt,
    topic: pack.input.topic,
    scripture: pack.input.scripture,
    tone: pack.input.tone,
    denomination: pack.input.denomination,
    pack,
  }
  // Remove duplicate if exists
  const filtered = saved.filter((s) => s.id !== entry.id)
  const updated = [entry, ...filtered]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function deleteSermon(id: string): SavedSermon[] {
  const saved = getSavedSermons()
  const updated = saved.filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function getSermonById(id: string): SavedSermon | undefined {
  return getSavedSermons().find((s) => s.id === id)
}

// Helper: ensure legacy saved sermons have all required fields introduced by newer app versions.
function normalizeSermonPack(pack: SermonPack): SermonPack {
  const input = {
    ...pack.input,
    language: (pack.input as any).language || 'en',
  } as SermonInput
  return {
    ...pack,
    input,
    relatedVideos: pack.relatedVideos ? pack.relatedVideos.map((v) => ({ ...v, videoId: v.videoId || undefined })) : [],
    worshipSongs: pack.worshipSongs ? pack.worshipSongs.map((s) => ({ ...s, videoId: s.videoId || undefined })) : [],
  }
}
