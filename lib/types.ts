export type Language = 'en' | 'ta' | 'ml' | 'te'

export interface SermonInput {
  topic: string
  scripture: string
  audience: string
  sermonLength: string
  tone: SermonTone
  denomination?: string
  notes: string
  language: Language
}

export type SermonTone =
  | 'expository'
  | 'topical'
  | 'evangelistic'
  | 'youth'
  | 'bible-study'
  | 'pastoral-care'

export interface SermonOutlinePoint {
  pointTitle: string
  explanation: string
  transition: string
}

export interface RelatedVideo {
  title: string      // e.g. "The Prodigal Son Explained"
  description: string // e.g. "A short visual walk through Luke 15 with cultural context for modern audiences."
  videoId?: string   // YouTube video ID (11-char part after v=). May be empty/undefined for search-link fallback.
  searchQuery: string // e.g. "The Prodigal Son Explained sermon"
}

export interface WorshipSong {
  title: string       // e.g. "Goodness of God"
  artist: string      // e.g. "Bethel Music"
  videoId?: string   // YouTube video ID (11-char part after v=). May be empty/undefined for search-link fallback.
  searchQuery: string // e.g. "Goodness of God Bethel Music lyrics"
}

export interface SocialMediaPack {
  whatsapp: string
  instagram: string
  facebook: string
}

export interface SermonPack {
  id: string
  createdAt: string
  input: SermonInput
  title: string
  bigIdea: string
  pastoralAim: string
  introductionHook: string
  outline: SermonOutlinePoint[]
  keyScriptureReferences: string[]
  supportingVerses: string[]
  historicalCulturalBackground: string
  theologicalThemes: string[]
  illustrationSuggestions: string[]
  applicationSteps: string[]
  discussionQuestions: string[]
  smallGroupTeachingNotes: string
  prayerPoints: string[]
  closingChallenge: string
  childrenSermon: string
  socialMediaPack: SocialMediaPack
  relatedVideos: RelatedVideo[]
  worshipSongs: WorshipSong[]
}

export interface SavedSermon {
  id: string
  createdAt: string
  topic: string
  scripture: string
  tone: SermonTone
  denomination?: string
  pack: SermonPack
}
