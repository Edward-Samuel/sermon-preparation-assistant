'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { SermonInput, SermonTone, SermonPack, SavedSermon, Language } from '@/lib/types'
import { generateSermonPack, packToMarkdown } from '@/lib/sermon-generator'
import { getSavedSermons, saveSermon, deleteSermon } from '@/lib/storage'

type View = 'compose' | 'output' | 'history'

type GenerationMode = 'ai' | 'deterministic'
type Theme = 'light' | 'dark'

const TONE_OPTIONS: { value: SermonTone; label: string; desc: string }[] = [
  { value: 'expository', label: 'Expository', desc: 'Verse-by-verse, text-driven preaching' },
  { value: 'topical', label: 'Topical', desc: 'Theme-based biblical survey' },
  { value: 'evangelistic', label: 'Evangelistic', desc: 'Gospel-centered, invitation-focused' },
  { value: 'youth', label: 'Youth', desc: 'Engaging for younger audiences' },
  { value: 'bible-study', label: 'Bible Study', desc: 'Teaching and discovery-oriented' },
  { value: 'pastoral-care', label: 'Pastoral Care', desc: 'Comfort and shepherding emphasis' },
]

const DENOMINATION_OPTIONS = [
  { value: 'catholic', label: 'Roman Catholic' },
  { value: 'reformed', label: 'Reformed / Presbyterian' },
  { value: 'baptist', label: 'Baptist' },
  { value: 'methodist', label: 'Methodist / Wesleyan / Holiness' },
  { value: 'pentecostal', label: 'Pentecostal / Charismatic' },
  { value: 'lutheran', label: 'Lutheran' },
  { value: 'anglican', label: 'Anglican / Episcopal' },
  { value: 'non-denominational', label: 'Non-Denominational / Evangelical' },
  { value: 'other', label: 'Other / Unspecified' },
]

const LENGTH_OPTIONS = [
  { value: 'standard', label: 'Standard (20-30 min)' },
  { value: 'extended', label: 'Extended (35-45 min)' },
  { value: '45+', label: 'Long (45+ min)' },
  { value: '60+', label: 'Full Hour (60+ min)' },
  { value: 'brief', label: 'Brief (10-15 min)' },
]

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'தமிழ் (Tamil)' },
  { value: 'ml', label: 'മലയാളം (Malayalam)' },
  { value: 'te', label: 'తెలుగు (Telugu)' },
]

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])
  return <div className="toast">{message}</div>
}

function SermonForm({
  onGenerate,
  initialInput,
  generationMode,
  onGenerationModeChange,
  language,
}: {
  onGenerate: (input: Omit<SermonInput, 'language'>) => void
  initialInput?: SermonInput | null
  generationMode: GenerationMode
  onGenerationModeChange: (mode: GenerationMode) => void
  language: Language
}) {
  const [topic, setTopic] = useState(initialInput?.topic ?? '')
  const [scripture, setScripture] = useState(initialInput?.scripture ?? '')
  const [audience, setAudience] = useState(initialInput?.audience ?? '')
  const [sermonLength, setSermonLength] = useState(initialInput?.sermonLength ?? 'standard')
  const [tone, setTone] = useState<SermonTone>(initialInput?.tone ?? 'expository')
  const [denomination, setDenomination] = useState(initialInput?.denomination ?? 'non-denominational')
  const [notes, setNotes] = useState(initialInput?.notes ?? '')

  useEffect(() => {
    if (initialInput) {
      setTopic(initialInput.topic)
      setScripture(initialInput.scripture)
      setAudience(initialInput.audience)
      setSermonLength(initialInput.sermonLength)
      setTone(initialInput.tone)
      setDenomination(initialInput.denomination ?? 'non-denominational')
      setNotes(initialInput.notes)
    }
  }, [initialInput])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() && !scripture.trim()) return
    onGenerate({ topic, scripture, audience, sermonLength, tone, denomination, notes })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="topic">Topic / Theme *</label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder='e.g. "The Faithfulness of God", "Forgiveness"'
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="scripture">Scripture Passage</label>
        <input
          id="scripture"
          type="text"
          value={scripture}
          onChange={(e) => setScripture(e.target.value)}
          placeholder='e.g. "Romans 8:28-30", "John 3:16-21"'
        />
      </div>

      <div className="form-group">
        <label htmlFor="audience">
          Audience / Context <span className="optional">(optional)</span>
        </label>
        <input
          id="audience"
          type="text"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder='e.g. "Sunday morning congregation", "College-age small group"'
        />
      </div>

      <div className="form-group">
        <label htmlFor="sermonLength">Sermon Length</label>
        <select
          id="sermonLength"
          value={sermonLength}
          onChange={(e) => setSermonLength(e.target.value)}
        >
          {LENGTH_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="denomination">
          Denomination / Tradition <span className="optional">(optional)</span>
        </label>
        <select
          id="denomination"
          value={denomination}
          onChange={(e) => setDenomination(e.target.value)}
        >
          {DENOMINATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="tone">Tone / Style Preset</label>
        <select id="tone" value={tone} onChange={(e) => setTone(e.target.value as SermonTone)}>
          {TONE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} — {opt.desc}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="notes">
          Notes / Emphasis <span className="optional">(optional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder='Any specific emphasis, key points to include, or special considerations...'
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Generation Mode</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="radio"
              name="generationMode"
              value="ai"
              checked={generationMode === 'ai'}
              onChange={() => onGenerationModeChange('ai')}
            />
            🤖 AI-Powered (LLM generation)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="radio"
              name="generationMode"
              value="deterministic"
              checked={generationMode === 'deterministic'}
              onChange={() => onGenerationModeChange('deterministic')}
            />
            📦 Offline (Deterministic — no AI)
          </label>
          {generationMode === 'deterministic' && language !== 'en' && (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-warning-text)', marginTop: '0.5rem' }}>
              ⚠️ Offline mode produces English content only. Choose AI mode for {LANGUAGE_OPTIONS.find(o=>o.value===language)?.label} output.
            </p>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={!topic.trim() && !scripture.trim()}>
          {generationMode === 'ai' ? 'Generate with AI' : 'Generate Offline Pack'}
        </button>
      </div>
    </form>
  )
}

function SermonOutputView({
  pack,
  onBack,
  onSave,
  isSaved,
}: {
  pack: SermonPack
  onBack: () => void
  onSave: () => void
  isSaved: boolean
}) {
  const [toast, setToast] = useState<string | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  const copyMarkdown = useCallback(async () => {
    const md = packToMarkdown(pack)
    try {
      await navigator.clipboard.writeText(md)
      setToast('Markdown copied to clipboard!')
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = md
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setToast('Markdown copied to clipboard!')
    }
  }, [pack])

  const downloadMarkdown = useCallback(() => {
    const md = packToMarkdown(pack)
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sermon-pack-${pack.id}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setToast('Markdown file downloaded!')
  }, [pack])

  const printPDF = useCallback(() => {
    window.print()
  }, [])

  return (
    <div className="sermon-output" ref={outputRef}>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="export-bar">
        <button className="btn btn-sm btn-secondary" onClick={onBack}>
          ← New Sermon
        </button>
        <button className="btn btn-sm btn-outline" onClick={copyMarkdown}>
          Copy Markdown
        </button>
        <button className="btn btn-sm btn-outline" onClick={downloadMarkdown}>
          Download .md
        </button>
        <button className="btn btn-sm btn-outline" onClick={printPDF}>
          Print / Save as PDF
        </button>
        {!isSaved && (
          <button className="btn btn-sm btn-accent" onClick={onSave}>
            Save to History
          </button>
        )}
        {isSaved && (
          <span style={{ fontSize: '0.825rem', color: 'var(--color-success)', alignSelf: 'center' }}>
            ✓ Saved
          </span>
        )}
      </div>

      {/* Title */}
      <div className="section">
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', borderBottom: 'none', marginBottom: '0.5rem', paddingBottom: 0 }}>
          {pack.title}
        </h2>
        <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
          {pack.input.tone} · {pack.input.audience || 'General audience'} · {pack.input.sermonLength || 'Standard length'}{pack.input.denomination && pack.input.denomination !== 'non-denominational' ? ` · ${DENOMINATION_OPTIONS.find((o) => o.value === pack.input.denomination)?.label ?? pack.input.denomination}` : ''}
        </div>
      </div>

      {/* Big Idea */}
      <div className="section">
        <div className="section-title">Big Idea / Thesis</div>
        <div className="section-body">
          <p><strong>{pack.bigIdea}</strong></p>
        </div>
      </div>

      {/* Pastoral Aim */}
      <div className="section">
        <div className="section-title">Pastoral Aim</div>
        <div className="section-body"><p>{pack.pastoralAim}</p></div>
      </div>

      {/* Introduction Hook */}
      <div className="section">
        <div className="section-title">Introduction Hook</div>
        <div className="section-body"><p>{pack.introductionHook}</p></div>
      </div>

      {/* Outline */}
      <div className="section">
        <div className="section-title">Sermon Outline</div>
        {pack.outline.map((pt, i) => (
          <div className="outline-point" key={i}>
            <h4>{pt.pointTitle}</h4>
            <div className="explanation">{pt.explanation}</div>
            <div className="transition"><strong>Transition:</strong> {pt.transition}</div>
          </div>
        ))}
      </div>

      {/* Key Scripture References */}
      <div className="section">
        <div className="section-title">Key Scripture References</div>
        <div>
          {pack.keyScriptureReferences.map((ref, i) => (
            <span className="verse-tag" key={i}>{ref}</span>
          ))}
        </div>
      </div>

      {/* Supporting Verses */}
      <div className="section">
        <div className="section-title">Supporting Verses</div>
        <div>
          {pack.supportingVerses.map((ref, i) => (
            <span className="verse-tag" key={i}>{ref}</span>
          ))}
        </div>
      </div>

      {/* Historical / Cultural Background */}
      <div className="section">
        <div className="section-title">Historical / Cultural Background</div>
        <div className="section-body"><p>{pack.historicalCulturalBackground}</p></div>
      </div>

      {/* Theological Themes */}
      <div className="section">
        <div className="section-title">Theological Themes</div>
        <div>
          {pack.theologicalThemes.map((theme, i) => (
            <span className="theme-tag" key={i}>{theme}</span>
          ))}
        </div>
      </div>

      {/* Illustration Suggestions */}
      <div className="section">
        <div className="section-title">Illustration Suggestions</div>
        <ul>
          {pack.illustrationSuggestions.map((ill, i) => (
            <li key={i}>{ill}</li>
          ))}
        </ul>
      </div>

      {/* Application Steps */}
      <div className="section">
        <div className="section-title">Application Steps</div>
        <ol>
          {pack.applicationSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Discussion Questions */}
      <div className="section">
        <div className="section-title">Discussion Questions</div>
        <ol>
          {pack.discussionQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
      </div>

      {/* Small Group Teaching Notes */}
      <div className="section">
        <div className="section-title">Small Group Teaching Notes</div>
        <div className="teaching-notes">{pack.smallGroupTeachingNotes}</div>
      </div>

      {/* Prayer Points */}
      <div className="section">
        <div className="section-title">Prayer Points</div>
        <ul>
          {pack.prayerPoints.map((pt, i) => (
            <li key={i}>{pt}</li>
          ))}
        </ul>
      </div>

      {/* Related Videos */}
      <div className="section">
        <div className="section-title">Related Videos</div>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {pack.relatedVideos.map((v, i) => (
            <li key={i} style={{ marginBottom: '1.25rem', listStyle: 'none' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>{v.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{v.description}</div>
              <VideoEmbed videoId={v.videoId} title={v.title} searchQuery={v.searchQuery} />
            </li>
          ))}
        </ul>
      </div>

      {/* Worship Songs */}
      <div className="section">
        <div className="section-title">Worship Songs</div>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {pack.worshipSongs.map((s, i) => (
            <li key={i} style={{ marginBottom: '1.25rem', listStyle: 'none' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{s.title}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginLeft: '0.3rem' }}>— {s.artist}</span>
              </div>
              <VideoEmbed videoId={s.videoId} title={s.title} searchQuery={s.searchQuery} />
            </li>
          ))}
        </ul>
      </div>

      {/* Closing Challenge */}
      <div className="section">
        <div className="section-title">Closing Challenge</div>
        <div className="section-body"><p>{pack.closingChallenge}</p></div>
      </div>
    </div>
  )
}

function HistoryPanel({
  history,
  onLoad,
  onDelete,
}: {
  history: SavedSermon[]
  onLoad: (sermon: SavedSermon) => void
  onDelete: (id: string) => void
}) {
  if (history.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">📖</div>
        <p>No saved sermon packs yet.</p>
        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Generate a sermon pack and save it to see it here.
        </p>
      </div>
    )
  }

  return (
    <ul className="history-list">
      {history.map((item) => (
        <li className="history-item" key={item.id}>
          <div className="history-item-info" onClick={() => onLoad(item)}>
            <h4>{item.topic || item.scripture || 'Untitled Sermon'}</h4>
            <div className="history-item-meta">
              {item.scripture && item.topic ? `${item.scripture} · ` : ''}
              {item.tone}{item.denomination && item.denomination !== 'non-denominational' ? ` · ${DENOMINATION_OPTIONS.find((o) => o.value === item.denomination)?.label ?? item.denomination}` : ''} · {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div className="history-item-actions">
            <button className="btn btn-sm btn-danger" onClick={() => onDelete(item.id)} title="Delete">
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

function youtubeSearchUrl(query: string): string {
  const q = encodeURIComponent(query)
  return `https://www.youtube.com/results?search_query=${q}`
}

function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
}

function youtubeThumbUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

function VideoEmbed({ videoId, title, searchQuery }: { videoId?: string; title: string; searchQuery: string }) {
  const [playing, setPlaying] = React.useState(false)

  // No reliable videoId -> just show a search link (no iframe possible without an ID)
  if (!videoId) {
    return (
      <a
        className="yt-search-link"
        href={youtubeSearchUrl(searchQuery)}
        target="_blank"
        rel="noopener noreferrer"
      >
        ▶ Search on YouTube
      </a>
    )
  }

  return (
    <div className="yt-embed">
      <div className="yt-embed-frame">
        {playing ? (
          <iframe
            src={youtubeEmbedUrl(videoId)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            className="yt-embed-thumb"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title}`}
            style={{ backgroundImage: `url(${youtubeThumbUrl(videoId)})` }}
          >
            <span className="yt-play-button" aria-hidden="true">▶</span>
          </button>
        )}
      </div>
      <a
        className="yt-fallback-link"
        href={youtubeSearchUrl(searchQuery)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Not the right video? Search on YouTube
      </a>
    </div>
  )
}

export default function HomePage() {
  // ── Core state ──
  const [view, setView] = useState<View>('compose')
  const [currentPack, setCurrentPack] = useState<SermonPack | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [history, setHistory] = useState<SavedSermon[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [formInput, setFormInput] = useState<SermonInput | null>(null)

  // ── Generation mode ──
  const [generationMode, setGenerationMode] = useState<GenerationMode>('ai')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  // ── Theme state ──
  const [theme, setTheme] = useState<Theme>('light')
  const [themeReady, setThemeReady] = useState(false)

  // ── Language state ──
  const [language, setLanguage] = useState<Language>('en')

  // ── Load history on mount ──
  useEffect(() => {
    setHistory(getSavedSermons())
  }, [])

  // ── Theme initialization ──
  useEffect(() => {
    const stored = localStorage.getItem('sermon-prep-theme')
    let initial: Theme = 'light'
    if (stored === 'dark' || stored === 'light') {
      initial = stored
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initial = 'dark'
    }
    setTheme(initial)
    document.documentElement.dataset.theme = initial
    setThemeReady(true)
  }, [])

  // ── Language initialization ──
  useEffect(() => {
    const stored = localStorage.getItem('sermon-prep-language')
    if (stored === 'en' || stored === 'ta' || stored === 'ml') {
      setLanguage(stored)
    }
  }, [])

  // ── Generate handler ──
  const handleGenerate = useCallback(
    (partial: Omit<SermonInput, 'language'>) => {
      const input: SermonInput = { ...partial, language }

      if (generationMode === 'ai') {
        setIsLoading(true)
        setLoadingMessage('Generating sermon with AI... This may take up to 30 seconds.')
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
          .then(async (res) => {
            if (!res.ok) {
              const err = await res.json().catch(() => ({ error: 'Generation failed' }))
              throw new Error(err.error || `Server error ${res.status}`)
            }
            return res.json()
          })
          .then((data) => {
            const pack: SermonPack = {
              ...data.pack,
              id: data.pack.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
              createdAt: data.pack.createdAt || new Date().toISOString(),
            }
            setCurrentPack(pack)
            setIsSaved(false)
            setView('output')
          })
          .catch((err: Error) => {
            setToast(err.message)
          })
          .finally(() => {
            setIsLoading(false)
            setLoadingMessage('')
          })
      } else {
        // Deterministic / offline mode
        if (language !== 'en') {
          setToast('Offline mode generates English only. Switch to AI mode for Tamil/Malayalam.')
        }
        const pack = generateSermonPack(input)
        setCurrentPack(pack)
        setIsSaved(false)
        setView('output')
      }
    },
    [generationMode, language],
  )

  // ── History handlers ──
  const handleSave = useCallback(() => {
    if (!currentPack) return
    const updated = saveSermon(currentPack)
    setHistory(updated)
    setIsSaved(true)
    setToast('Sermon pack saved!')
  }, [currentPack])

  const handleDeleteHistory = useCallback((id: string) => {
    const updated = deleteSermon(id)
    setHistory(updated)
    setToast('Sermon pack deleted.')
  }, [])

  const handleLoadHistory = useCallback((sermon: SavedSermon) => {
    setCurrentPack(sermon.pack)
    setIsSaved(true)
    setView('output')
  }, [])

  const handleBackToCompose = useCallback(() => {
    setView('compose')
    setCurrentPack(null)
    setFormInput(null)
  }, [])

  // ── Theme toggle ──
  const handleThemeToggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('sermon-prep-theme', next)
      document.documentElement.dataset.theme = next
      return next
    })
  }, [])

  return (
    <>
      {/* Spinner keyframes injected via style jsx */}
      <style jsx global>{`
        @keyframes spa-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Loading overlay */}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'spa-spin 0.8s linear infinite',
              marginBottom: '1rem',
            }}
          />
          <div style={{ color: '#fff', fontSize: '1rem', textAlign: 'center', maxWidth: '400px' }}>
            {loadingMessage}
          </div>
        </div>
      )}

      <header className="app-header">
        <div className="container">
          <h1>
            Sermon <span>Prep</span> Assistant
          </h1>
          <nav className="header-nav">
            <button
              className={view === 'compose' ? 'active' : ''}
              onClick={handleBackToCompose}
            >
              Compose
            </button>
            <button
              className={view === 'history' ? 'active' : ''}
              onClick={() => setView('history')}
            >
              History ({history.length})
            </button>
            {themeReady && (
              <button
                className="theme-toggle"
                onClick={handleThemeToggle}
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
              </button>
            )}
            <select
              className="lang-select"
              value={language}
              onChange={(e) => {
                const next = e.target.value as Language
                setLanguage(next)
                try { localStorage.setItem('sermon-prep-language', next) } catch {}
              }}
              aria-label="Select output language"
            >
              {LANGUAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </nav>
        </div>
      </header>

      {/* AI Status Banner */}
      {(view === 'compose' || view === 'output') && (
        <div
          style={{
            background: generationMode === 'ai' ? 'var(--color-primary-light)' : 'var(--color-success-bg)',
            borderBottom: '1px solid ' + (generationMode === 'ai' ? 'var(--color-primary)' : 'var(--color-success)'),
            padding: '0.5rem 0',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: generationMode === 'ai' ? 'var(--color-primary)' : 'var(--color-success)',
          }}
        >
          {generationMode === 'ai'
            ? '🤖 AI Mode — LLM-powered sermon generation'
            : '📦 Offline Mode — Built-in template engine (no AI calls)'}
        </div>
      )}

      <main className="main-content">
        <div className="container">
          {toast && <Toast message={toast} onDone={() => setToast(null)} />}

          <div className="disclaimer-banner">
            <strong>A note for pastors:</strong> This tool generates sermon preparation material as a starting point
            for your prayerful study. Please review all content carefully, verify scripture references, and adapt
            material to fit your congregation&apos;s specific needs and context. This tool assists preparation;
            it does not replace the leading of the Holy Spirit or the authority of Scripture.
          </div>

          {view === 'compose' && (
            <div className="page-grid">
              <div className="card">
                <h2>Sermon Details</h2>
                <SermonForm
                  onGenerate={handleGenerate}
                  initialInput={formInput}
                  generationMode={generationMode}
                  onGenerationModeChange={setGenerationMode}
                  language={language}
                />
              </div>
              <div className="card">
                <h2>How It Works</h2>
                <div style={{ fontSize: '0.935rem', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    Enter your sermon topic, scripture passage, and preferences. The assistant will generate
                    a comprehensive sermon preparation pack including:
                  </p>
                  <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                    <li>Sermon title and big idea</li>
                    <li>Pastoral aim and introduction hook</li>
                    <li>Full sermon outline with transitions</li>
                    <li>Key scripture references and supporting verses</li>
                    <li>Historical and cultural background</li>
                    <li>Theological themes and illustrations</li>
                    <li>Application steps and discussion questions</li>
                    <li>Small group teaching notes</li>
                    <li>Prayer points and closing challenge</li>
                  </ul>
                  <p style={{ marginBottom: '0.75rem' }}>
                    <strong>Tone presets</strong> adjust the style and emphasis of the generated content
                    to match your preaching context — from expository verse-by-verse teaching to
                    evangelistic proclamation to pastoral care.
                  </p>
                  <p style={{ marginBottom: '0.75rem' }}>
                    <strong>AI-Powered mode</strong> uses an LLM to draft a comprehensive sermon
                    based on your topic and scripture passage.
                  </p>
                  <p style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--color-warning-text)' }}>
                    Requires an OpenAI-compatible API key. Set OPENAI_API_KEY and OPENAI_BASE_URL in a
                    .env.local file.
                  </p>
                  <p style={{ marginBottom: '0.75rem' }}>
                    <strong>Save your packs</strong> to revisit them later. Export as Markdown or
                    print as PDF for offline use.
                  </p>
                  <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Sermon data is stored locally in your browser.
                  </p>
                </div>
              </div>
            </div>
          )}

          {view === 'output' && currentPack && (
            <div className="card">
              <SermonOutputView
                pack={currentPack}
                onBack={handleBackToCompose}
                onSave={handleSave}
                isSaved={isSaved}
              />
            </div>
          )}

          {view === 'history' && (
            <div className="card">
              <h2>Saved Sermon Packs</h2>
              <HistoryPanel
                history={history}
                onLoad={handleLoadHistory}
                onDelete={handleDeleteHistory}
              />
            </div>
          )}
        </div>
      </main>
    </>
  )
}
