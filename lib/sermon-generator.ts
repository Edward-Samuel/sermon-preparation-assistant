import { SermonInput, SermonPack, SermonOutlinePoint, SermonTone } from './types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const toneDescriptors: Record<SermonTone, { style: string; emphasis: string; approach: string }> = {
  expository: {
    style: 'verse-by-verse exposition',
    emphasis: 'careful textual analysis and faithful interpretation',
    approach: 'systematically unpack the passage, drawing out the original author\'s intent and its timeless application',
  },
  topical: {
    style: 'thematic exploration',
    emphasis: 'comprehensive biblical survey of the topic',
    approach: 'gather Scripture from across the canon to build a complete theological picture of the theme',
  },
  evangelistic: {
    style: 'gospel proclamation',
    emphasis: 'the good news of Jesus Christ and personal response',
    approach: 'clearly present the gospel, addressing barriers to faith and extending a clear invitation',
  },
  youth: {
    style: 'engaging and relatable communication',
    emphasis: 'connecting eternal truths to real-life experiences young people face',
    approach: 'use accessible language, relevant examples, and interactive elements to engage younger hearts',
  },
  'bible-study': {
    style: 'teaching and discovery',
    emphasis: 'equipping believers to study and understand Scripture for themselves',
    approach: 'guide participants through observation, interpretation, and application with discussion-based learning',
  },
  'pastoral-care': {
    style: 'shepherding and comfort',
    emphasis: 'meeting people in their pain and pointing them to God\'s sustaining grace',
    approach: 'lead with empathy, acknowledge real struggles, and gently guide toward healing and hope in Christ',
  },
}

const audienceHints: Record<string, string[]> = {
  default: ['believers seeking to grow in faith', 'those navigating life\'s challenges', 'people hungry for God\'s Word'],
}

function pickTitle(input: SermonInput): string {
  const topic = input.topic.trim()
  const scripture = input.scripture.trim()
  if (scripture && topic) {
    return `${topic}: Insights from ${scripture}`
  }
  if (topic) {
    return topic
  }
  if (scripture) {
    return `Understanding ${scripture}`
  }
  return 'A Message of Hope and Truth'
}

function pickBigIdea(input: SermonInput): string {
  const topic = input.topic.trim() || 'God\'s Word'
  const tone = toneDescriptors[input.tone]
  const ideas: string[] = [
    `When we truly understand ${topic.toLowerCase()}, we discover that God is inviting us into a deeper walk of faith, obedience, and joy.`,
    `The heart of ${topic.toLowerCase()} reveals God\'s character — His faithfulness, mercy, and call for us to live as His people in a broken world.`,
    `${topic} is not merely a theological concept but a transformative reality that reshapes how we live, love, and relate to God and one another.`,
    `Scripture teaches us that ${topic.toLowerCase()} is foundational to the Christian life, calling us to trust God more fully and step out in courageous faith.`,
  ]
  // deterministic-ish selection
  const idx = (input.topic.length + input.scripture.length) % ideas.length
  return ideas[idx]
}

function pickPastoralAim(input: SermonInput): string {
  const topic = input.topic.trim() || 'this truth'
  const tone = input.tone
  const aims: Record<SermonTone, string[]> = {
    expository: [
      `To help the congregation understand the meaning of the text and apply it faithfully to their daily walk with Christ.`,
      `To lead the church through careful study of God\'s Word so that hearts are convicted, minds are renewed, and lives are transformed.`,
    ],
    topical: [
      `To provide a comprehensive biblical understanding of ${topic.toLowerCase()} so that believers can think and act in alignment with Scripture.`,
      `To equip the congregation with a theological framework for ${topic.toLowerCase()} that strengthens their faith and witness.`,
    ],
    evangelistic: [
      `To clearly present the gospel message so that those who do not yet know Christ may come to saving faith.`,
      `To remove barriers to faith and extend a warm, compelling invitation to receive the grace of God in Jesus Christ.`,
    ],
    youth: [
      `To help young people see that ${topic.toLowerCase()} is relevant to their lives and that God\'s Word speaks directly to their questions and struggles.`,
      `To inspire the next generation to own their faith and live boldly for Christ in their schools, homes, and friendships.`,
    ],
    'bible-study': [
      `To equip believers with tools and confidence to study Scripture for themselves and discover its riches.`,
      `To create an environment of discovery where participants can engage with the text and grow in understanding together.`,
    ],
    'pastoral-care': [
      `To minister to hurting hearts with the comfort and hope found in God\'s Word, reminding them they are not alone.`,
      `To shepherd the flock with tenderness, pointing them to the Good Friend who walks with us through every valley.`,
    ],
  }
  const options = aims[tone]
  const idx = (input.notes.length + topic.length) % options.length
  return options[idx]
}

function pickIntroductionHook(input: SermonInput): string {
  const topic = input.topic.trim() || 'faith'
  const hooks: string[] = [
    `Have you ever found yourself in a moment where everything you thought you knew was shaken — and yet, in that very moment, God\'s Word spoke louder than your doubt? Today we turn to ${input.scripture || 'Scripture'} to hear what God has to say about ${topic.toLowerCase()}.`,
    `Imagine standing at a crossroads. One path is familiar, comfortable, and well-worn. The other is uncertain but lined with promises from God. That is the kind of choice ${topic.toLowerCase()} often presents to us. Let us open our Bibles together and seek wisdom.`,
    `There is a question that echoes through the halls of every human heart: "Does God really care about ${topic.toLowerCase()}?" Today, we will let Scripture answer that question — and the answer may surprise you.`,
    `A.W. Tozer once wrote that what comes into our minds when we think about God is the most important thing about us. Today, as we explore ${topic.toLowerCase()}, we are really exploring who God is and what He asks of us.`,
    `Some of you walked in today carrying a heavy burden related to ${topic.toLowerCase()}. Others came curious, eager to learn. Wherever you are, I believe God has a word for you today from ${input.scripture || 'His Word'}.`,
  ]
  const idx = input.audience.length % hooks.length
  return hooks[idx]
}

function generateOutline(input: SermonInput): SermonOutlinePoint[] {
  const topic = input.topic.trim() || 'God\'s truth'
  const scripture = input.scripture.trim() || 'the passage before us'

  const outlines: SermonOutlinePoint[][] = [
    [
      {
        pointTitle: `I. The Foundation — What ${scripture} Teaches Us`,
        explanation: `Begin by setting the context of the passage. Who wrote it, to whom, and why? Show the congregation the original meaning and how it establishes the groundwork for understanding ${topic.toLowerCase()}. The ancient audience faced real challenges, and this text spoke directly into their situation — and now it speaks into ours.`,
        transition: `With this foundation laid, let us now turn to see how this truth takes shape in the life of the believer.`,
      },
      {
        pointTitle: `II. The Reality — Living in Light of This Truth`,
        explanation: `Move from theology to life. How does ${topic.toLowerCase()} intersect with the daily realities of work, family, relationships, and personal struggle? Use concrete examples. Acknowledge the tension between what we believe and what we experience. The Bible never shies away from honesty, and neither should we.`,
        transition: `Understanding and acknowledging the reality is important — but God does not leave us there. He calls us to respond.`,
      },
      {
        pointTitle: `III. The Response — What God Calls Us To Do`,
        explanation: `Bring the sermon to its applicational climax. What specific, tangible steps can the congregation take this week? Be practical. Be bold. Call people to repentance where needed, to faith where doubt lingers, and to action where obedience is required. This is where the sermon moves from information to transformation.`,
        transition: `As we close, let us remember that this is not about our striving but about God\'s empowering grace.`,
      },
    ],
    [
      {
        pointTitle: `I. The Problem — What We Get Wrong About ${topic}`,
        explanation: `Address common misunderstandings or cultural distortions of ${topic.toLowerCase()}. Many people — even Christians — carry baggage, half-truths, or cultural assumptions that cloud their view. Gently but clearly, show what Scripture actually says versus what popular culture might suggest.`,
        transition: `Once we clear away the misconceptions, we can see the beauty of what God truly intends.`,
      },
      {
        pointTitle: `II. The Promise — God\'s Heart on the Matter`,
        explanation: `Now build up. Show the richness of God\'s design and intention regarding ${topic.toLowerCase()}. Let the congregation see the beauty, the generosity, and the wisdom of God in this area. Use vivid language. Paint the picture of what life looks like when we align with God\'s purposes.`,
        transition: `This promise is beautiful — but it requires something of us. Let us consider what that looks like.`,
      },
      {
        pointTitle: `III. The Practice — Walking It Out in Faith`,
        explanation: `Close with concrete application. What does it look like on Monday morning to live in light of ${topic.toLowerCase()}? Give them handles — specific practices, habits, and mindset shifts. Encourage them that transformation is a process, and God is patient and faithful.`,
        transition: `We go from here not in our own strength but in the power of the Spirit who dwells within us.`,
      },
    ],
    [
      {
        pointTitle: `I. Where We Are — Honest Assessment`,
        explanation: `Invite the congregation into honest self-reflection. Where do we stand in relation to ${topic.toLowerCase()}? Create space for people to acknowledge their real situation — without shame, but with honesty. God meets us where we are, not where we pretend to be.`,
        transition: `Honesty is the starting point, but it is not the destination. God has more to show us.`,
      },
      {
        pointTitle: `II. What God Says — The Authority of Scripture`,
        explanation: `Turn to ${scripture} and let God\'s Word speak with clarity and authority. Walk through the text carefully, highlighting key phrases, repeated words, and the logical flow of the argument or narrative. Show how this passage illuminates ${topic.toLowerCase()} with divine wisdom that surpasses human understanding.`,
        transition: `When we hear what God says, the natural question becomes: "How then shall we live?"`,
      },
      {
        pointTitle: `III. Where We Go — Faithful Obedience`,
        explanation: `Challenge the congregation to move forward in obedient faith. What specific commitments can they make? What changes does this truth demand? Be encouraging but also direct. The goal is not guilt but joyful, Spirit-empowered response to God\'s grace.`,
        transition: `Let us commit together to walk in this truth, trusting the One who calls us also equips us.`,
      },
    ],
  ]

  const idx = (input.topic.length + input.sermonLength.length) % outlines.length
  const base = outlines[idx]

  // Adjust depth based on sermon length
  if (input.sermonLength === 'extended' || input.sermonLength === '45+' || input.sermonLength === '60+') {
    base.push({
      pointTitle: `IV. The Hope — Looking Forward in Confidence`,
      explanation: `Cast vision for what the future holds when the church embraces ${topic.toLowerCase()} wholeheartedly. This is not wishful thinking but biblical hope — grounded in the character of God and the promises of Scripture. Paint a picture of a community that lives this out, and invite each person to be part of that story.`,
      transition: `We close now with a reminder of why we can have this confidence.`,
    })
  }

  return base
}

function pickSupportingVerses(input: SermonInput): string[] {
  const topic = input.topic.toLowerCase()
  const base: string[] = [
    'Romans 8:28',
    'Jeremiah 29:11',
    'Philippians 4:13',
    'Proverbs 3:5-6',
    'Isaiah 41:10',
    'Psalm 46:1',
    'Matthew 11:28-30',
    '2 Corinthians 12:9',
    'Joshua 1:9',
    'Psalm 23',
    'Ephesians 2:8-9',
    'James 1:2-4',
    '1 Peter 5:7',
    'Hebrews 11:1',
    'Romans 12:1-2',
    'Galatians 5:22-23',
    'Psalm 119:105',
    'Colossians 3:23',
    'Matthew 6:33',
    'Lamentations 3:22-23',
  ]

  // Shuffle deterministically based on input
  const seed = input.topic.length + input.scripture.length
  const result: string[] = []
  for (let i = 0; i < 8; i++) {
    result.push(base[(seed + i * 3) % base.length])
  }
  // Remove duplicates
  return [...new Set(result)]
}

function pickHistoricalBackground(input: SermonInput): string {
  const scripture = input.scripture.trim()
  const backgrounds: string[] = [
    `The passage ${scripture || 'before us'} was written in a context vastly different from our own, yet the human condition it addresses is remarkably familiar. Understanding the original setting — the social structures, the religious tensions, the daily realities of the first audience — helps us grasp the full weight of what the author communicated. In the ancient world, community identity was paramount, and individual actions were understood in light of their collective impact. This backdrop enriches our reading and prevents us from domesticating a text that was, in its original context, revolutionary.`,
    `To understand ${scripture || 'this text'}, we must enter the world of its first readers. The ancient Near Eastern context was one of covenant relationships, agrarian economies, and deeply embedded religious practices. The original audience would have heard these words against the backdrop of exile, return, and the persistent hope for God\'s kingdom to break into their reality. These cultural layers add depth and texture to our interpretation.`,
    `The historical setting of ${scripture || 'this passage'} matters. Written to people who knew oppression, uncertainty, and the longing for deliverance, these words carried enormous weight. The first readers did not have the luxury of treating faith as an abstract concept — it was survival. Understanding their context helps us see why these truths matter even more, not less, in our comfortable but often spiritually parched modern world.`,
    `In the time ${scripture || 'this passage'} was written, the audience faced pressures from surrounding cultures that challenged their identity as God\'s people. Political instability, religious pluralism, and moral confusion were daily realities. Sound familiar? The parallels to our own cultural moment are striking, and the original message speaks with undiminished power to us today.`,
  ]
  const idx = scripture.length % backgrounds.length
  return backgrounds[idx]
}

function pickTheologicalThemes(input: SermonInput): string[] {
  const base = [
    'The sovereignty and faithfulness of God',
    'The authority and sufficiency of Scripture',
    'Grace — God\'s unmerited favor toward sinners',
    'The gospel of Jesus Christ as the center of all things',
    'The work of the Holy Spirit in sanctification',
    'The already/not-yet tension of the Kingdom of God',
    'Community and the body of Christ',
    'The call to holiness and obedient discipleship',
    'God\'s compassion for the broken and marginalized',
    'The hope of resurrection and eternal life',
  ]
  const seed = input.topic.length
  const themes: string[] = []
  for (let i = 0; i < 5; i++) {
    themes.push(base[(seed + i * 2) % base.length])
  }
  return [...new Set(themes)]
}

function pickIllustrations(input: SermonInput): string[] {
  const topic = input.topic.trim() || 'faith'
  return [
    `Personal story: Share a brief, authentic account from your own life or ministry where ${topic.toLowerCase()} became real to you. Vulnerability builds trust and models the honesty we are calling for.`,
    `Historical illustration: Consider the story of a faithful believer from history — perhaps Corrie ten Boom, Dietrich Bonhoeffer, or Hudson Taylor — whose life exemplified ${topic.toLowerCase()} in the face of extraordinary circumstances.`,
    `Everyday analogy: Compare ${topic.toLowerCase()} to something universally relatable — learning to swim (you have to let go of the edge), planting a garden (growth requires patience and trust in unseen processes), or building a house (the foundation determines everything).`,
    `Congregational story (with permission): If you know of someone in your church community whose testimony illustrates this truth beautifully, ask their permission to share it. Real stories from real people in the room carry unique power.`,
    `Cultural reference: A well-chosen film, book, or current event can open a door to understanding. For ${topic.toLowerCase()}, consider how a popular story or recent headline illustrates the human need for what God offers.`,
  ]
}

function pickApplicationSteps(input: SermonInput): string[] {
  const topic = input.topic.trim() || 'this truth'
  return [
    `This week, set aside 15 minutes each day to meditate on ${input.scripture || 'the key passage'} and journal what God reveals to you about ${topic.toLowerCase()}.`,
    `Identify one relationship or situation where you need to apply ${topic.toLowerCase()} more faithfully. Write down one specific action you will take and ask an accountability partner to check in with you.`,
    `Memorize a key verse from today\'s passage. Let it be the first thing you think about when you wake and the last thing you reflect on before sleep.`,
    `Pray specifically for one person who needs to hear about ${topic.toLowerCase()}. Ask God for an opportunity to share, and be ready when it comes.`,
    `Join or form a small group to study this passage more deeply over the coming weeks. Transformation happens best in community.`,
    `Examine your schedule, budget, and habits. Do they reflect a life that takes ${topic.toLowerCase()} seriously? Make one concrete change this week.`,
  ]
}

function pickDiscussionQuestions(input: SermonInput): string[] {
  const topic = input.topic.trim() || 'this topic'
  const scripture = input.scripture.trim() || 'the passage'
  return [
    `What stood out to you most from today\'s message about ${topic.toLowerCase()}? Why?`,
    `Read ${scripture || 'the key passage'} together. What do you notice that you might have missed before?`,
    `How does ${topic.toLowerCase()} intersect with something you are currently facing in life?`,
    `What makes it difficult to live out this truth in our culture? What makes it possible?`,
    `How does the gospel — the life, death, and resurrection of Jesus — change how we understand ${topic.toLowerCase()}?`,
    `What is one thing you sense God is asking you to do in response to today\'s message?`,
    `How can we, as a group, support and encourage one another in this area?`,
  ]
}

function pickSmallGroupNotes(input: SermonInput): string {
  const topic = input.topic.trim() || 'today\'s topic'
  return `**Small Group Teaching Notes**

*Preparation:* Read ${input.scripture || 'the key passage'} aloud at the start. Allow a moment of silence for reflection before diving in.

*Opening:* Begin with a low-barrier icebreaker question: "When you hear the word '${topic.toLowerCase()}', what is the first thing that comes to mind?" Allow everyone to share briefly.

*Teaching:* Walk through the main sermon outline, but don\'t just repeat the sermon. Instead, pause after each point and ask, "What does this mean for us practically?" Let the group wrestle with the application together.

*Discussion:* Use the discussion questions provided. Don\'t rush — the best insights often come after an uncomfortable silence. Give people space to think.

*Prayer:* Close by having each person share one thing they are taking away and one thing they would like prayer for. Pray for each other by name.

*Follow-up:* Encourage group members to text or call one person in the group during the week to ask how they are doing with their commitment.

*Note to leader:* You don\'t have to have all the answers. Your role is to facilitate discovery, not to lecture. Ask good questions, listen well, and point people back to the text.`
}

function pickPrayerPoints(input: SermonInput): string[] {
  const topic = input.topic.trim() || 'this truth'
  return [
    `Pray that God would open our hearts to receive ${topic.toLowerCase()} not just as information but as transformation.`,
    `Ask the Holy Spirit to illuminate the Scriptures and help us see Jesus in every passage.`,
    `Pray for those in our congregation who are struggling — that they would find comfort, strength, and hope in God\'s Word.`,
    `Intercede for our community and city, that the truth of ${topic.toLowerCase()} would go beyond our walls and impact the world around us.`,
    `Pray for our pastors and leaders, that they would lead with wisdom, humility, and courage.`,
    `Ask God to raise up disciples who will live out ${topic.toLowerCase()} in their homes, workplaces, and neighborhoods.`,
    `Pray for unity in the body of Christ, that we would be known by our love and our commitment to truth.`,
  ]
}

function pickClosingChallenge(input: SermonInput): string {
  const topic = input.topic.trim() || 'this truth'
  const closings: string[] = [
    `As you leave this place today, carry ${topic.toLowerCase()} with you — not as a burden but as a banner. Let it shape how you speak, how you love, how you work, and how you worship. The world is watching, and they need to see the reality of Christ in us. Go in peace, go in power, go in the name of Jesus.`,
    `My challenge to you this week is simple but costly: live as if ${topic.toLowerCase()} is actually true. Because it is. And when you are tempted to doubt, remember what you heard today, return to the Scriptures, and trust the God who never fails. May the grace of our Lord Jesus Christ, the love of God, and the fellowship of the Holy Spirit be with you all.`,
    `Don\'t let today be just another Sunday. Let this be the day something shifted in your heart. Take one step — just one — in the direction of ${topic.toLowerCase()}. God does not ask for perfection. He asks for willingness. And He promises to meet you in the middle of your obedience. Go now, and may God bless you and keep you.`,
    `I want to leave you with this thought: ${topic.toLowerCase()} is not a spectator sport. It requires participation, courage, and faith. But here is the good news — you are not doing this alone. The God who called you is faithful, and He will equip you for every good work. Step out. Step up. And watch what God does.`,
  ]
  const idx = (input.audience.length + input.notes.length) % closings.length
  return closings[idx]
}

export function generateSermonPack(input: SermonInput): SermonPack {
  const scripture = input.scripture.trim()
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    input,
    title: pickTitle(input),
    bigIdea: pickBigIdea(input),
    pastoralAim: pickPastoralAim(input),
    introductionHook: pickIntroductionHook(input),
    outline: generateOutline(input),
    keyScriptureReferences: scripture ? [scripture, ...pickSupportingVerses(input).slice(0, 3)] : pickSupportingVerses(input).slice(0, 5),
    supportingVerses: pickSupportingVerses(input),
    historicalCulturalBackground: pickHistoricalBackground(input),
    theologicalThemes: pickTheologicalThemes(input),
    illustrationSuggestions: pickIllustrations(input),
    applicationSteps: pickApplicationSteps(input),
    discussionQuestions: pickDiscussionQuestions(input),
    smallGroupTeachingNotes: pickSmallGroupNotes(input),
    prayerPoints: pickPrayerPoints(input),
    closingChallenge: pickClosingChallenge(input),
  }
}

export function packToMarkdown(pack: SermonPack): string {
  const lines: string[] = []
  lines.push(`# ${pack.title}`)
  lines.push('')
  lines.push(`> *Generated: ${new Date(pack.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}*`)
  lines.push(`> *Tone: ${pack.input.tone} | Audience: ${pack.input.audience || 'General'} | Length: ${pack.input.sermonLength || 'Standard'}*`)
  lines.push('')

  lines.push('---')
  lines.push('')
  lines.push('## Big Idea / Thesis')
  lines.push('')
  lines.push(pack.bigIdea)
  lines.push('')

  lines.push('## Pastoral Aim')
  lines.push('')
  lines.push(pack.pastoralAim)
  lines.push('')

  lines.push('## Introduction Hook')
  lines.push('')
  lines.push(pack.introductionHook)
  lines.push('')

  lines.push('---')
  lines.push('')
  lines.push('## Sermon Outline')
  lines.push('')
  for (const point of pack.outline) {
    lines.push(`### ${point.pointTitle}`)
    lines.push('')
    lines.push(point.explanation)
    lines.push('')
    lines.push(`*Transition:* ${point.transition}`)
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('## Key Scripture References')
  lines.push('')
  for (const ref of pack.keyScriptureReferences) {
    lines.push(`- ${ref}`)
  }
  lines.push('')

  lines.push('## Supporting Verses')
  lines.push('')
  for (const ref of pack.supportingVerses) {
    lines.push(`- ${ref}`)
  }
  lines.push('')

  lines.push('## Historical / Cultural Background')
  lines.push('')
  lines.push(pack.historicalCulturalBackground)
  lines.push('')

  lines.push('## Theological Themes')
  lines.push('')
  for (const theme of pack.theologicalThemes) {
    lines.push(`- ${theme}`)
  }
  lines.push('')

  lines.push('## Illustration Suggestions')
  lines.push('')
  for (const ill of pack.illustrationSuggestions) {
    lines.push(`- ${ill}`)
  }
  lines.push('')

  lines.push('## Application Steps')
  lines.push('')
  for (let i = 0; i < pack.applicationSteps.length; i++) {
    lines.push(`${i + 1}. ${pack.applicationSteps[i]}`)
  }
  lines.push('')

  lines.push('## Discussion Questions')
  lines.push('')
  for (let i = 0; i < pack.discussionQuestions.length; i++) {
    lines.push(`${i + 1}. ${pack.discussionQuestions[i]}`)
  }
  lines.push('')

  lines.push('## Small Group Teaching Notes')
  lines.push('')
  lines.push(pack.smallGroupTeachingNotes)
  lines.push('')

  lines.push('## Prayer Points')
  lines.push('')
  for (const pt of pack.prayerPoints) {
    lines.push(`- ${pt}`)
  }
  lines.push('')

  lines.push('## Closing Challenge')
  lines.push('')
  lines.push(pack.closingChallenge)
  lines.push('')

  lines.push('---')
  lines.push('')
  lines.push('*This sermon preparation pack is intended as a starting point for prayerful study and preparation. Pastors and teachers should prayerfully review all content, verify scripture references, and adapt material to fit their congregation\'s specific needs and context. This tool assists preparation; it does not replace the leading of the Holy Spirit.*')

  return lines.join('\n')
}
