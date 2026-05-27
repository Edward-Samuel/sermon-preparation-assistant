export interface SermonInput {
  topic: string
  scripture: string
  audience: string
  sermonLength: string
  tone: SermonTone
  notes: string
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
}

export interface SavedSermon {
  id: string
  createdAt: string
  topic: string
  scripture: string
  tone: SermonTone
  pack: SermonPack
}
