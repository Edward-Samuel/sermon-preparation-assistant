'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { SermonInput, SermonTone, SermonPack, SavedSermon } from '@/lib/types'
import { generateSermonPack, packToMarkdown } from '@/lib/sermon-generator'
import { getSavedSermons, saveSermon, deleteSermon } from '@/lib/storage'

type View = 'compose' | 'output' | 'history'

const TONE_OPTIONS: { value: SermonTone; label: string; desc: string }[] = [
  { value: 'expository', label: 'Expository', desc: 'Verse-by-verse, text-driven preaching' },
  { value: 'topical', label: 'Topical', desc: 'Theme-based biblical survey' },
  { value: 'evangelistic', label: 'Evangelistic', desc: 'Gospel-centered, invitation-focused' },
  { value: 'youth', label: 'Youth', desc: 'Engaging for younger audiences' },
  { value: 'bible-study', label: 'Bible Study', desc: 'Teaching and discovery-oriented' },
  { value: 'pastoral-care', label: 'Pastoral Care', desc: 'Comfort and shepherding emphasis' },
]

const LENGTH_OPTIONS = [
  { value: 'standard', label: 'Standard (20-30 min)' },
  { value: 'extended', label: 'Extended (35-45 min)' },
  { value: '45+', label: 'Long (45+ min)' },
  { value: '60+', label: 'Full Hour (60+ min)' },
  { value: 'brief', label: 'Brief (10-15 min)' },
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
}: {
  onGenerate: (input: SermonInput) => void
  initialInput?: SermonInput | null
}) {
  const [topic, setTopic] = useState(initialInput?.topic ?? '')
  const [scripture, setScripture] = useState(initialInput?.scripture ?? '')
  const [audience, setAudience] = useState(initialInput?.audience ?? '')
  const [sermonLength, setSermonLength] = useState(initialInput?.sermonLength ?? 'standard')
  const [tone, setTone] = useState<SermonTone>(initialInput?.tone ?? 'expository')
  const [notes, setNotes] = useState(initialInput?.notes ?? '')

  useEffect(() => {
    if (initialInput) {
      setTopic(initialInput.topic)
      setScripture(initialInput.scripture)
      setAudience(initialInput.audience)
      setSermonLength(initialInput.sermonLength)
      setTone(initialInput.tone)
      setNotes(initialInput.notes)
    }
  }, [initialInput])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() && !scripture.trim()) return
    onGenerate({ topic, scripture, audience, sermonLength, tone, notes })
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
          required={!scripture.trim()}
        />
      </div>

      <div className="form-group">
        <label htmlFor="scripture">Scripture Passage *</label>
        <input
          id="scripture"
          type="text"
          value={scripture}
          onChange={(e) => setScripture(e.target.value)}
          placeholder='e.g. "Romans 8:28-30", "John 3:16-21"'
          required={!topic.trim()}
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

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={!topic.trim() && !scripture.trim()}>
          Generate Sermon Pack
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
          {pack.input.tone} · {pack.input.audience || 'General audience'} · {pack.input.sermonLength || 'Standard length'}
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
              {item.tone} · {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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

export default function HomePage() {
  const [view, setView] = useState<View>('compose')
  const [currentPack, setCurrentPack] = useState<SermonPack | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [history, setHistory] = useState<SavedSermon[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [formInput, setFormInput] = useState<SermonInput | null>(null)

  // Load history on mount
  useEffect(() => {
    setHistory(getSavedSermons())
  }, [])

  const handleGenerate = useCallback((input: SermonInput) => {
    const pack = generateSermonPack(input)
    setCurrentPack(pack)
    setIsSaved(false)
    setView('output')
  }, [])

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

  return (
    <>
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
          </nav>
        </div>
      </header>

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
                <SermonForm onGenerate={handleGenerate} initialInput={formInput} />
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
                    <strong>Save your packs</strong> to revisit them later. Export as Markdown or
                    print as PDF for offline use.
                  </p>
                  <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                    All data is stored locally in your browser. Nothing is sent to any server.
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
