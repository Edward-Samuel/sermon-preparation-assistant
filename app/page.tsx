'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { SermonInput, SermonTone, SermonPack, SavedSermon, Language, SermonOutlinePoint } from '@/lib/types'
import { packToMarkdown } from '@/lib/sermon-generator'
import { getSavedSermons, saveSermon, deleteSermon } from '@/lib/storage'

type View = 'compose' | 'output' | 'history'

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

const UI_TEXT: Record<Language, {
  compose: string
  history: string
  generate: string
  topicLabel: string
  scriptureLabel: string
  audienceLabel: string
  lengthLabel: string
  denominationLabel: string
  toneLabel: string
  notesLabel: string
  bigIdea: string
  pastoralAim: string
  introductionHook: string
  sermonOutline: string
  keyScriptures: string
  supportingVerses: string
  historicalBackground: string
  theologicalThemes: string
  illustrations: string
  applicationSteps: string
  discussionQuestions: string
  smallGroupNotes: string
  prayerPoints: string
  closingChallenge: string
  relatedVideos: string
  worshipSongs: string
  copyMarkdown: string
  downloadMd: string
  printPdf: string
  saveToHistory: string
  saved: string
  newSermon: string
  disclaimer: string
  disclaimerBody: string
  sermonDetails: string
  savedSermonPacks: string
  howItWorks: string
  howItWorksIntro: string
  howItWorksListItem1: string
  howItWorksListItem2: string
  howItWorksListItem3: string
  howItWorksListItem4: string
  howItWorksListItem5: string
  howItWorksListItem6: string
  howItWorksListItem7: string
  howItWorksListItem8: string
  howItWorksListItem9: string
  howItWorksTone: string
  howItWorksAi: string
  howItWorksSave: string
  howItWorksLocal: string
  emptyHistory: string
  emptyHistorySub: string
  generating: string
  generateSermon: string
  toneExpository: string
  toneExpositoryDesc: string
  toneTopical: string
  toneTopicalDesc: string
  toneEvangelistic: string
  toneEvangelisticDesc: string
  toneYouth: string
  toneYouthDesc: string
  toneBibleStudy: string
  toneBibleStudyDesc: string
  tonePastoralCare: string
  tonePastoralCareDesc: string
  denomRomanCatholic: string
  denomReformed: string
  denomBaptist: string
  denomMethodist: string
  denomPentecostal: string
  denomLutheran: string
  denomAnglican: string
  denomNonDenominational: string
  denomOther: string
  lengthStandard: string
  lengthExtended: string
  lengthLong: string
  lengthFullHour: string
  lengthBrief: string
  topicPlaceholder: string
  scripturePlaceholder: string
  audiencePlaceholder: string
  notesPlaceholder: string
  childrenSermon: string
  socialMediaPack: string
  whatsapp: string
  instagram: string
  facebook: string
  copied: string
  estimatedTime: string
  minutes: string
  introduction: string
  conclusion: string
  transition: string
  shareCompact: string
  copiedToClipboard: string
}> = {
  en: {
    compose: 'Compose',
    history: 'History',
    generate: 'Generate',
    topicLabel: 'Topic / Theme *',
    scriptureLabel: 'Scripture Passage',
    audienceLabel: 'Audience / Context (optional)',
    lengthLabel: 'Sermon Length',
    denominationLabel: 'Denomination / Tradition (optional)',
    toneLabel: 'Tone / Style Preset',
    notesLabel: 'Notes / Emphasis (optional)',
    bigIdea: 'Big Idea / Thesis',
    pastoralAim: 'Pastoral Aim',
    introductionHook: 'Introduction Hook',
    sermonOutline: 'Sermon Outline',
    keyScriptures: 'Key Scripture References',
    supportingVerses: 'Supporting Verses',
    historicalBackground: 'Historical / Cultural Background',
    theologicalThemes: 'Theological Themes',
    illustrations: 'Illustration Suggestions',
    applicationSteps: 'Application Steps',
    discussionQuestions: 'Discussion Questions',
    smallGroupNotes: 'Small Group Teaching Notes',
    prayerPoints: 'Prayer Points',
    closingChallenge: 'Closing Challenge',
    relatedVideos: 'Related Videos',
    worshipSongs: 'Worship Songs',
    copyMarkdown: 'Copy Markdown',
    downloadMd: 'Download .md',
    printPdf: 'Print / Save as PDF',
    saveToHistory: 'Save to History',
    saved: 'Saved',
    newSermon: '← New Sermon',
    disclaimer: 'A note for pastors:',
    disclaimerBody: 'This tool generates sermon preparation material as a starting point for your prayerful study. Please review all content carefully, verify scripture references, and adapt material to fit your congregation\u2019s specific needs and context. This tool assists preparation; it does not replace the leading of the Holy Spirit or the authority of Scripture.',
    sermonDetails: 'Sermon Details',
    savedSermonPacks: 'Saved Sermon Packs',
    howItWorks: 'How It Works',
    howItWorksIntro: 'Enter your sermon topic, scripture passage, and preferences. The assistant will generate a comprehensive sermon preparation pack including:',
    howItWorksListItem1: 'Sermon title and big idea',
    howItWorksListItem2: 'Pastoral aim and introduction hook',
    howItWorksListItem3: 'Full sermon outline with transitions',
    howItWorksListItem4: 'Key scripture references and supporting verses',
    howItWorksListItem5: 'Historical and cultural background',
    howItWorksListItem6: 'Theological themes and illustrations',
    howItWorksListItem7: 'Application steps and discussion questions',
    howItWorksListItem8: 'Small group teaching notes',
    howItWorksListItem9: 'Prayer points and closing challenge',
    howItWorksTone: 'Tone presets adjust the style and emphasis of the generated content to match your preaching context \u2014 from expository verse-by-verse teaching to evangelistic proclamation to pastoral care.',
    howItWorksAi: 'This tool uses an LLM to draft a comprehensive sermon based on your topic and scripture passage.',
    howItWorksSave: 'Save your packs to revisit them later. Export as Markdown or print as PDF for offline use.',
    howItWorksLocal: 'Sermon data is stored locally in your browser.',
    emptyHistory: 'No saved sermon packs yet.',
    emptyHistorySub: 'Generate a sermon pack and save it to see it here.',
    generating: 'Generating sermon with AI... This may take up to 30 seconds.',
    generateSermon: 'Generate Sermon Pack',
    toneExpository: 'Expository',
    toneExpositoryDesc: 'Verse-by-verse, text-driven preaching',
    toneTopical: 'Topical',
    toneTopicalDesc: 'Theme-based biblical survey',
    toneEvangelistic: 'Evangelistic',
    toneEvangelisticDesc: 'Gospel-centered, invitation-focused',
    toneYouth: 'Youth',
    toneYouthDesc: 'Engaging for younger audiences',
    toneBibleStudy: 'Bible Study',
    toneBibleStudyDesc: 'Teaching and discovery-oriented',
    tonePastoralCare: 'Pastoral Care',
    tonePastoralCareDesc: 'Comfort and shepherding emphasis',
    denomRomanCatholic: 'Roman Catholic',
    denomReformed: 'Reformed / Presbyterian',
    denomBaptist: 'Baptist',
    denomMethodist: 'Methodist / Wesleyan / Holiness',
    denomPentecostal: 'Pentecostal / Charismatic',
    denomLutheran: 'Lutheran',
    denomAnglican: 'Anglican / Episcopal',
    denomNonDenominational: 'Non-Denominational / Evangelical',
    denomOther: 'Other / Unspecified',
    lengthStandard: 'Standard (20-30 min)',
    lengthExtended: 'Extended (35-45 min)',
    lengthLong: 'Long (45+ min)',
    lengthFullHour: 'Full Hour (60+ min)',
    lengthBrief: 'Brief (10-15 min)',
    topicPlaceholder: 'e.g. "The Faithfulness of God", "Forgiveness"',
    scripturePlaceholder: 'e.g. "Romans 8:28-30", "John 3:16-21"',
    audiencePlaceholder: 'e.g. "Sunday morning congregation", "College-age small group"',
    notesPlaceholder: 'Any specific emphasis, key points to include, or special considerations...',
    childrenSermon: 'Children\'s Sermon',
    socialMediaPack: 'Social Media Pack',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    facebook: 'Facebook',
    copied: 'Copied to clipboard!',
    estimatedTime: 'Estimated time',
    minutes: 'min',
    introduction: 'Introduction',
    conclusion: 'Conclusion',
    transition: 'Transition',
    shareCompact: 'Share Compact',
    copiedToClipboard: 'Copied to clipboard!',
  },
  ta: {
    compose: 'உருவாக்கு',
    history: 'வரலாறு',
    generate: 'உருவாக்கு',
    topicLabel: 'தலைப்பு / தீம் *',
    scriptureLabel: 'வேதாகம பகுதி',
    audienceLabel: 'பார்வையாளர்கள் / சூழல் (விருப்பத்தேர்வு)',
    lengthLabel: 'பிரசங்க நீளம்',
    denominationLabel: 'சபை மரபு / பிரிவு (விருப்பத்தேர்வு)',
    toneLabel: 'தொனி / பாணி முன்அமைப்பு',
    notesLabel: 'குறிப்புகள் / வலியுறுத்தல் (விருப்பத்தேர்வு)',
    bigIdea: 'முக்கிய யோசனை / கருத்து',
    pastoralAim: 'மேய்ப்பர் நோக்கம்',
    introductionHook: 'அறிமுக ஈர்ப்பு',
    sermonOutline: 'பிரசங்க வரைபடம்',
    keyScriptures: 'முக்கிய வேதாகம குறிப்புகள்',
    supportingVerses: 'ஆதரவு வசனங்கள்',
    historicalBackground: 'வரலாற்று / கலாச்சார பின்னணி',
    theologicalThemes: 'தேவாலய கருப்பொருள்கள்',
    illustrations: 'உதாரண பரிந்துரைகள்',
    applicationSteps: 'பயன்பாட்டு படிகள்',
    discussionQuestions: 'விவாத கேள்விகள்',
    smallGroupNotes: 'சிறு குழு கற்பித்தல் குறிப்புகள்',
    prayerPoints: 'ஜெப புள்ளிகள்',
    closingChallenge: 'முடிவு சவால்',
    relatedVideos: 'தொடர்புடைய வீடியோக்கள்',
    worshipSongs: 'ஆராதனை பாடல்கள்',
    copyMarkdown: 'மார்க்டவுனை நகலெடு',
    downloadMd: '.md பதிவிறக்கம்',
    printPdf: 'அச்சிடு / PDF ஆக சேமி',
    saveToHistory: 'வரலாற்றில் சேமி',
    saved: 'சேமிக்கப்பட்டது',
    newSermon: '← புதிய பிரசங்கம்',
    disclaimer: 'மேய்ப்பர்களுக்கு ஒரு குறிப்பு:',
    disclaimerBody: 'இந்தக் கருவி உங்கள் பிரார்த்தனையான படிப்புக்கு தொடக்கப்புள்ளியாக பிரசங்க தயாரிப்பு பொருள்களை உருவாக்குகிறது. அனைத்து உள்ளடக்கங்களையும் கவனமாக மதிப்பாய்வு செய்யுங்கள், வேதாகம குறிப்புகளை சரிபாருங்கள், மற்றும் உங்கள் சபையின் குறிப்பிட்ட தேவைகளுக்கும் சூழலுக்கும் ஏற்ப பொருள்களைத் தகுந்தபடி மாற்றுங்கள். இந்தக் கருவி தயாரிப்புக்கு உதவுகிறது; ஆனால் பரிசுத்த ஆவியின் வழிநடத்துதலை அல்லது வேதாகமத்தின் அதிகாரத்தை மாற்றாது.',
    sermonDetails: 'பிரசங்க விவரங்கள்',
    savedSermonPacks: 'சேமிக்கப்பட்ட பிரசங்க பொதிகள்',
    howItWorks: 'இது எப்படி வேலை செய்கிறது',
    howItWorksIntro: 'உங்கள் பிரசங்க தலைப்பு, வேதாகம பகுதி மற்றும் விருப்பங்களை உள்ளிடவும். உதவியாளர் பின்வரும் அனைத்தையும் உள்ளடக்கிய விரிவான பிரசங்க தயாரிப்பு பொதியை உருவாக்கும்:',
    howItWorksListItem1: 'பிரசஙக தலைப்பு மற்றும் முக்கிய யோசனை',
    howItWorksListItem2: 'மேய்பர் நோக்கம் மற்றும் அறிமுக ஈர்ப்பு',
    howItWorksListItem3: 'மாற்றங்களுடன் முழு பிரசஙக வரைபடம்',
    howItWorksListItem4: 'முக்கிய வேதாகம குறிப்புகள் மற்றும் ஆதரவு வசனங்கள்',
    howItWorksListItem5: 'வரலாற்று மற்றும் கலாச்சார பின்னணி',
    howItWorksListItem6: 'தேவாலய கருப்பொருள்கள் மற்றும் உதாரணங்கள்',
    howItWorksListItem7: 'பயன்பாட்டு படிகள் மற்றும் விவாத கேள்விகள்',
    howItWorksListItem8: 'சிறு குழு கற்பித்தல் குறிப்புகள்',
    howItWorksListItem9: 'ஜெப புள்ளிகள் மற்றும் முடிவு சவால்',
    howItWorksTone: 'தொனி முன்னமைப்புகள் உங்கள் பிரசஙக சூழலுக்கு ஏற்ப உருவாக்கப்பட்ட உள்ளடக்கத்தின் பாணி மற்றும் நெருக்கடியை சரிசெய்கின்றன — திருவசன விளக்க போதனை முதல் சுவிசேஷ அறிவிப்பு மற்றும் மேய்ப்பர் பராமரிப்பு வரை.',
    howItWorksAi: 'இந்தக் கருவி உங்கள் தலைப்பு மற்றும் வேதாகம பகுதியின் அடிப்படையில் விரிவான பிரசங்கத்தை வரைய LLM-ஐப் பயன்படுத்துகிறது.',
    howItWorksSave: 'உங்கள் பொதிகளை சேமித்து பிறகு மீண்டும் பார்க்கவும். மார்க்டவுனாக ஏற்றுமதி செய்யவும் அல்லது ஆஃப்லைனில் பயன்படுத்த PDF ஆக அச்சிடவும்.',
    howItWorksLocal: 'பிரசஙக தரவு உங்கள் உலாவியில் உள்ளடக்கப்பட்டுள்ளது.',
    emptyHistory: 'இன்னும் சேமிக்கப்பட்ட பிரசங்க பொதிகள் இல்லை.',
    emptyHistorySub: 'ஒரு பிரசங்க பொதியை உருவாக்கி சேமிக்க இங்கே காணலாம்.',
    generating: 'AI மூலம் பிரசங்கத்தை உருவாக்குகிறது... இது 30 வினாடிகள் வரை ஆகலாம்.',
    generateSermon: 'பிரசங்க பொதியை உருவாக்கு',
    toneExpository: 'விளக்குரை',
    toneExpositoryDesc: 'வசனம் வசனமாக, உரை-இயக்க பிரசங்கம்',
    toneTopical: 'தலைப்பு சார்ந்த',
    toneTopicalDesc: 'கருப்பொருள் அடிப்படையிலான பைபிள் ஆய்வு',
    toneEvangelistic: 'சுவிசேஷ',
    toneEvangelisticDesc: 'சுவிசேஷ மையப்படுத்திய, அழைப்பு-சார்ந்த',
    toneYouth: 'இளைஞர்',
    toneYouthDesc: 'இளைய சந்ததிக்கு ஈர்க்கும் வகையில்',
    toneBibleStudy: 'பைபிள் படிப்பு',
    toneBibleStudyDesc: 'கற்பித்தல் மற்றும் கண்டுபிடிப்பு-சார்ந்த',
    tonePastoralCare: 'மேய்ப்பர் பராமரிப்பு',
    tonePastoralCareDesc: 'ஆறுதல் மற்றும் மேய்ப்பு வலியுறுத்தல்',
    denomRomanCatholic: 'ரோமன் கத்தோலிக்க',
    denomReformed: 'கல்விப்படுத்தப்பட்ட / பிரெஸ்பிடேரியன்',
    denomBaptist: 'பாப்டிஸ்ட்',
    denomMethodist: 'மெதடிஸ்ட் / வெஸ்லேயன் / பரிசுத்தம்',
    denomPentecostal: 'பெந்தகோஸ்தல் / அதிசயவரம்',
    denomLutheran: 'லூதரன்',
    denomAnglican: 'ஆங்கிலிக்கன் / எபிஸ்கோபல்',
    denomNonDenominational: 'சபை-சாரா / சுவிசேஷ',
    denomOther: 'மற்றவை / குறிப்பிடப்படாத',
    lengthStandard: 'நிலையான (20-30 நிமிடம்)',
    lengthExtended: 'விரிவான (35-45 நிமிடம்)',
    lengthLong: 'நீண்ட (45+ நிமிடம்)',
    lengthFullHour: 'முழு மணி (60+ நிமிடம்)',
    lengthBrief: 'குறுகிய (10-15 நிமிடம்)',
    topicPlaceholder: 'எ.கா. "கடவுளின் உண்மைத்தன்மை", "மன்னிப்பு"',
    scripturePlaceholder: 'எ.கா. "ரோமர் 8:28-30", "யோவான் 3:16-21"',
    audiencePlaceholder: 'எ.கா. "ஞாயிறு காலை சபை", "கல்லூரி வயது சிறு குழு"',
    notesPlaceholder: 'குறிப்பிட்ட நெருக்கடி, சேர்க்க வேண்டிய முக்கிய புள்ளிகள், அல்லது சிறப்பு கருத்துக்கள்...',
    childrenSermon: 'குழந்தைகள் பிரசங்கம்',
    socialMediaPack: 'சமூக ஊடக பொதி',
    whatsapp: 'வாட்ஸ்அப்',
    instagram: 'இன்ஸ்டாகிராம்',
    facebook: 'பேஸ்புக்',
    copied: 'கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது!',
    estimatedTime: 'மதிப்பிடப்பட்ட நேரம்',
    minutes: 'நிமி',
    introduction: 'அறிமுகம்',
    conclusion: 'முடிவுரை',
    transition: 'மாற்றம்',
    shareCompact: 'சுருக்கமாக பகிர்',
    copiedToClipboard: 'கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது!',
  },
  ml: {
    compose: 'രചിക്കുക',
    history: 'ചരിത്രം',
    generate: 'രചിക്കുക',
    topicLabel: 'വിഷയം / തീം *',
    scriptureLabel: 'വേദഭാഗം',
    audienceLabel: 'പ്രേക്ഷകർ / സന്ദർഭം (ഐച്ഛികം)',
    lengthLabel: 'പ്രസംഗ ദൈർഘ്യം',
    denominationLabel: 'സഭാ പാരമ്പര്യം / വിഭാഗം (ഐച്ഛികം)',
    toneLabel: 'സ്വരം / ശൈലി മുൻക്രമീകരണം',
    notesLabel: 'കുറിപ്പുകൾ / ഊന്നൽ (ഐച്ഛികം)',
    bigIdea: 'പ്രധാന ആശയം / തീസിസ്',
    pastoralAim: 'മേയ്പ്പർ ലക്ഷ്യം',
    introductionHook: 'ആമുഖ ആകർഷണം',
    sermonOutline: 'പ്രസംഗ രൂപരേഖ',
    keyScriptures: 'പ്രധാന വേദഗ്രന്ഥ സൂചനകൾ',
    supportingVerses: 'പിന്തുണയ്ക്കുന്ന വചനങ്ങൾ',
    historicalBackground: 'ചരിത്രപരമായ / സാംസ്കാരിക പശ്ചാത്തലം',
    theologicalThemes: 'ദൈവശാസ്ത്ര വിഷയങ്ങൾ',
    illustrations: 'ഉദാഹരണ നിർദ്ദേശങ്ങൾ',
    applicationSteps: 'പ്രയോഗ നടപടികൾ',
    discussionQuestions: 'ചർച്ച ചോദ്യങ്ങൾ',
    smallGroupNotes: 'ചെറുകൂട്ടം അധ്യാപന കുറിപ്പുകൾ',
    prayerPoints: 'പ്രാർത്ഥനാ കാര്യങ്ങൾ',
    closingChallenge: 'അവസാന ചലഞ്ച്',
    relatedVideos: 'ബന്ധപ്പെട്ട വീഡിയോകൾ',
    worshipSongs: 'ആരാധനാ ഗാനങ്ങൾ',
    copyMarkdown: 'മാർക്ഡൗൺ പകർത്തുക',
    downloadMd: '.md ഡൗൺലോഡ് ചെയ്യുക',
    printPdf: 'പ്രിന്റ് / PDF ആയി സേവ് ചെയ്യുക',
    saveToHistory: 'ചരിത്രത്തിൽ സേവ് ചെയ്യുക',
    saved: 'സേവ് ചെയ്തു',
    newSermon: '← പുതിയ പ്രസംഗം',
    disclaimer: 'മേയ്പ്പന്മാർക്കുള്ള ഒരു കുറിപ്പ്:',
    disclaimerBody: 'ഈ ഉപകരണം നിങ്ങളുടെ പ്രാർത്ഥനാ പഠനത്തിന് ഒരു ആരംഭ ബിന്ദുവായി പ്രസംഗ തയ്യാറെടുപ്പ് മെറ്റീരിയലുകൾ സൃഷ്ടിക്കുന്നു. എല്ലാ ഉള്ളടക്കവും ശ്രദ്ധയോടെ അവലോകനം ചെയ്യുക, വേദഗ്രന്ഥ സൂചനകൾ പരിശോധിക്കുക, നിങ്ങളുടെ സഭയുടെ പ്രത്യേക ആവശ്യങ്ങൾക്കും സന്ദർഭത്തിനും അനുസൃതമായി മെറ്റീരിയലുകൾ അഡാപ്റ്റ് ചെയ്യുക. ഈ ഉപകരണം തയ്യാറെടുപ്പിന് സഹായിക്കുന്നു; പരിശുദ്ധാത്മാവിന്റെ മാർഗ്ഗനിർദ്ദേശത്തെ അല്ലെങ്കിൽ വേദഗ്രന്ഥത്തിന്റെ അധികാരത്തെ മാറ്റിസ്ഥാപിക്കുന്നില്ല.',
    sermonDetails: 'പ്രസംഗ വിശദാംശങ്ങൾ',
    savedSermonPacks: 'സേവ് ചെയ്ത പ്രസംഗ പാക്കേജുകൾ',
    howItWorks: 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു',
    howItWorksIntro: 'നിങ്ങളുടെ പ്രസംഗ വിഷയം, വേദഭാഗം, മുൻഗണനകൾ എന്നിവ നൽകുക. സഹായി താഴെ പരാമർശിച്ച എല്ലാം അടങ്ങിയതായ ഒരു സമഗ്രമായ പ്രസംഗ തയ്യാറെടുപ്പ് പാക്കേജ് സൃഷ്ടിക്കും:',
    howItWorksListItem1: 'പ്രസംഗ ശീർഷകവും പ്രധാന ആശയവും',
    howItWorksListItem2: 'മേയ്പ്പർ ലക്ഷ്യവും ആമുഖ ആകർഷണവും',
    howItWorksListItem3: 'മാറ്റങ്ങളോടെ കൂടിയ മുഴുവൻ പ്രസംഗ രൂപരേഖയും',
    howItWorksListItem4: 'പ്രധാന വേദഗ്രന്ഥ സൂചനകളും പിന്തുണയ്ക്കുന്ന വചനങ്ങളും',
    howItWorksListItem5: 'ചരിത്രപരമായ / സാംസ്കാരിക പശ്ചാത്തലം',
    howItWorksListItem6: 'ദൈവശാസ്ത്ര വിഷയങ്ങളും നിർദ്ദേശങ്ങളും',
    howItWorksListItem7: 'പ്രയോഗ നടപടികളും ചർച്ച ചോദ്യങ്ങളും',
    howItWorksListItem8: 'ചെറുകൂട്ടം അധ്യാപന കുറിപ്പുകൾ',
    howItWorksListItem9: 'പ്രാർത്ഥനാ കാര്യങ്ങളും അവസാന ചലഞ്ചും',
    howItWorksTone: 'സ്വര മുൻക്രമീകരണങ്ങൾ നിങ്ങളുടെ പ്രസംഗ സന്ദർഭത്തോട് പൊരുത്തപ്പെടാൻ ജനറേറ്റ് ചെയ്ത ഉള്ളടക്കത്തിന്റെ ശൈലിയും പ്രാധാന്യവും ക്രമീകരിക്കുന്നു — തിരുവചന വിശദീകരണ പഠനം മുതൽ സുവിശേഷ പ്രഖ്യാപനം, മേയ്പ്പർ പരിചരണം വരെ.',
    howItWorksAi: 'ഈ ഉപകരണം നിങ്ങളുടെ വിഷയത്തിന്റെയും വേദഭാഗത്തിന്റെയും അടിസ്ഥാനത്തിൽ ഒരു സമഗ്രമായ പ്രസംഗം തയ്യാറാക്കാൻ LLM ഉപയോഗിക്കുന്നു.',
    howItWorksSave: 'നിങ്ങളുടെ പാക്കേജുകൾ പിന്നീട് കാണാൻ സേവ് ചെയ്യുക. മാർക്ഡൗൺ ആയി എക്സ്പോർട്ട് ചെയ്യുക അല്ലെങ്കിൽ ഓഫ്‌ലൈനിൽ ഉപയോഗിക്കാൻ PDF ആയി അച്ചടിക്കുക.',
    howItWorksLocal: 'പ്രസംഗ ഡാറ്റ ലോക്കലായി നിങ്ങളുടെ ബ്രൗസറിൽ സൂക്ഷിക്കുന്നു.',
    emptyHistory: 'ഇതുവരെ സേവ് ചെയ്ത പ്രസംഗ പാക്കേജുകളൊന്നുമില്ല.',
    emptyHistorySub: 'ഒരു പ്രസംഗ പാക്കേജ് സൃഷ്ടിച്ച് സേവ് ചെയ്യാൻ ഇവിടെ കാണാം.',
    generating: 'AI ഉപയോഗിച്ച് പ്രസംഗം സൃഷ്ടിക്കുന്നു... ഇതിന് 30 സെക്കൻഡ് വരെ എടുത്തേക്കാം.',
    generateSermon: 'പ്രസംഗ പാക്കേജ് സൃഷ്ടിക്കുക',
    toneExpository: 'വിശദീകാരം',
    toneExpositoryDesc: 'വചനം വചനമായി, വാക്യ-ഓട്ടം പ്രസംഗം',
    toneTopical: 'വിഷയാധിഷ്ഠിതം',
    toneTopicalDesc: 'വിഷയ അടിസ്ഥാനത്തിലുള്ള ബൈബിൾ സർവേ',
    toneEvangelistic: 'സുവിശേഷ',
    toneEvangelisticDesc: 'സുവിശേഷ കേന്ദ്രീകൃത, ക്ഷണ-ഓട്ടം',
    toneYouth: 'യുവജന',
    toneYouthDesc: 'ചെറുപ്പക്കാർക്ക് ആകർഷണീയമായ',
    toneBibleStudy: 'ബൈബിൾ പഠനം',
    toneBibleStudyDesc: 'അദ്ധ്യാപന / കണ്ടെത്തൽ-ഓട്ടം',
    tonePastoralCare: 'മേയ്പ്പർ പരിചരണം',
    tonePastoralCareDesc: 'ആശ്വാസം / മേയ്പ്പു ശുശ്രൂഷ',
    denomRomanCatholic: 'റോമൻ കത്തോലിക്ക',
    denomReformed: 'റിഫോർമ്ഡ് / പ്രെസ്ബിറ്റീരിയൻ',
    denomBaptist: 'ബാപ്റ്റിസ്റ്റ്',
    denomMethodist: 'മെതഡിസ്റ്റ് / വെസ്ലേയൻ / പരിശുദ്ധി',
    denomPentecostal: 'പെന്തകോസ്റ്റു / അത്ഭുതവർമം',
    denomLutheran: 'ലൂഥെരൻ',
    denomAnglican: 'ആംഗ്ലിക്കൻ / എപ്പിസ്കോപ്പൽ',
    denomNonDenominational: 'സഭാ-രഹിത / സുവിശേഷ',
    denomOther: 'മറ്റുള്ളവ / പരാമർശിക്കാത്ത',
    lengthStandard: 'സാധാരണ (20-30 മിനിറ്റ്)',
    lengthExtended: 'വിപുലമായ (35-45 മിനിറ്റ്)',
    lengthLong: 'ദൈർഘ്യമുള്ള (45+ മിനിറ്റ്)',
    lengthFullHour: 'പൂർണ്ണ മണിക്കൂർ (60+ മിനിറ്റ്)',
    lengthBrief: 'ചുരുങ്ങിയ (10-15 മിനിറ്റ്)',
    topicPlaceholder: 'ഉദാ. "ദൈവത്തിന്റെ വിശ്വസ്തത", "മന്സ്സമാധാനം"',
    scripturePlaceholder: 'ഉദാ. "റോമർ 8:28-30", "യോഹന്നാൻ 3:16-21"',
    audiencePlaceholder: 'ഉദാ. "ഞായറാഴ്ച രാവിലെ സഭ", "കോളേജ് പ്രായം ചെറുകൂട്ടം"',
    notesPlaceholder: 'കുറിപ്പ്: പ്രധാനപ്പെട്ട ഊന്നലുകൾ, ഉൾപ്പെടുത്തേണ്ട പ്രധാന കാര്യങ്ങൾ, അല്ലെങ്കിൽ പ്രത്യേക പരിഗണനകൾ...',
    childrenSermon: 'കുട്ടികളുടെ പ്രസംഗം',
    socialMediaPack: 'സോഷ്യൽ മീഡിയ പാക്ക്',
    whatsapp: 'വാട്സ്ആപ്പ്',
    instagram: 'ഇൻസ്റ്റാഗ്രാം',
    facebook: 'ഫേസ്ബുക്ക്',
    copied: 'ക്ലിപ്പ്ബോർഡിലേക്ക് പകർത്തി!',
    estimatedTime: 'കണക്കാക്കിയ സമയം',
    minutes: 'മിനി',
    introduction: 'ആമുഖം',
    conclusion: 'ഉപസംഹാരം',
    transition: 'മാറ്റം',
    shareCompact: 'കംപാക്റ്റ് പങ്കിടുക',
    copiedToClipboard: 'ക്ലിപ്പ്ബോർഡിലേക്ക് പകർത്തി!',
  },
  te: {
    compose: 'రచన',
    history: 'చరిత్ర',
    generate: 'రచన',
    topicLabel: 'అంశం / థీమ్ *',
    scriptureLabel: 'శాస్త్ర భాగం',
    audienceLabel: 'ప్రేక్షకులు / సందర్భం (ఐచ్ఛికం)',
    lengthLabel: 'ప్రసంగ పొడవు',
    denominationLabel: 'సంఘ పారంపర్యం / విభాగం (ఐచ్ఛికం)',
    toneLabel: 'స్వరం / శైలి ప్రీసెట్',
    notesLabel: 'గమనికలు / నొక్కి చెప్పడం (ఐచ్ఛికం)',
    bigIdea: 'ప్రధాన ఆలోచన / థీసిస్',
    pastoralAim: 'మేపరు లక్ష్యం',
    introductionHook: 'ప్రవేశ ఆకర్షణ',
    sermonOutline: 'ప్రసంగ రూపరేఖ',
    keyScriptures: 'ప్రధాన శాస్త్ర సూచనలు',
    supportingVerses: 'మద్దతు వచనాలు',
    historicalBackground: 'చారిత్రక / సాంస్కృతిక నేపథ్యం',
    theologicalThemes: 'దేవశాస్త్ర అంశాలు',
    illustrations: 'ఉదాహరణ సూచనలు',
    applicationSteps: 'అనువర్తన దశలు',
    discussionQuestions: 'చర్చ ప్రశ్నలు',
    smallGroupNotes: 'చిన్న సమూహ బోధన గమనికలు',
    prayerPoints: 'ప్రార్థనా అంశాలు',
    closingChallenge: 'ముగింపు సవాలు',
    relatedVideos: 'సంబంధిత వీడియోలు',
    worshipSongs: 'ఆరాధన పాటలు',
    copyMarkdown: 'మార్క్‌డౌన్ కాపీ చేయి',
    downloadMd: '.md డౌన్‌లోడ్ చేయి',
    printPdf: 'ప్రింట్ / PDF గా సేవ్ చేయి',
    saveToHistory: 'చరిత్రలో సేవ్ చేయి',
    saved: 'సేవ్ చేయబడింది',
    newSermon: '← కొత్త ప్రసంగం',
    disclaimer: 'మేపరులకు ఒక గమనిక:',
    disclaimerBody: 'ఈ సాధనం మీ ప్రార్థనా అధ్యయనానికి ప్రారంభ బిందువుగా ప్రసంగ సిద్ధత పదార్థాలను సృష్టిస్తుంది. దయచేసి అన్ని విషయాలను జాగ్రత్తగా సమీక్షించండి, శాస్త్ర సూచనలను ధృవీకరించండి, మరియు మీ సంఘ యొక్క ప్రత్యేక అవసరాలకు మరియు సందర్భానికి అనుగుణంగా పదార్థాలను సర్దుబాటు చేయండి. ఈ సాధనం సిద్ధతకు సహాయపడుతుంది; కానీ పరిశుద్ధాత్మ మార్గదర్శకత్వాన్ని లేదా శాస్త్ర అధికారాన్ని భర్తీ చేయదు.',
    sermonDetails: 'ప్రసంగ వివరాలు',
    savedSermonPacks: 'సేవ్ చేసిన ప్రసంగ ప్యాకేజీలు',
    howItWorks: 'ఇది ఎలా పనిచేస్తుంది',
    howItWorksIntro: 'మీ ప్రసంగ అంశం, శాస్త్ర భాగం, మరియు ప్రాధాన్యాలను నమోదు చేయండి. సహాయకుడు క్రింది వాటితో కూడిన సమగ్రమైన ప్రసంగ సిద్ధత ప్యాకేజీని సృష్టిస్తాడు:',
    howItWorksListItem1: 'ప్రసంగ శీర్షిక మరియు ప్రధాన ఆలోచన',
    howItWorksListItem2: 'మేపరు లక్ష్యం మరియు ప్రవేశ ఆకర్షణ',
    howItWorksListItem3: 'మార్పులతో పూర్తి ప్రసంగ రూపరేఖ',
    howItWorksListItem4: 'ప్రధాన శాస్త్ర సూచనలు మరియు మద్దతు వచనాలు',
    howItWorksListItem5: 'చారిత్రక / సాంస్కృతిక నేపథ్యం',
    howItWorksListItem6: 'దేవశాస్త్ర అంశాలు మరియు ఉదాహరణలు',
    howItWorksListItem7: 'అనువర్తన దశలు మరియు చర్చ ప్రశ్నలు',
    howItWorksListItem8: 'చిన్న సమూహ బోధన గమనికలు',
    howItWorksListItem9: 'ప్రార్థనా అంశాలు మరియు ముగింపు సవాలు',
    howItWorksTone: 'స్వరం ప్రీసెట్లు మీ ప్రసంగ సందర్భానికి సరిపోయేలా ఉత్పత్తి చేయబడిన విషయం యొక్క శైలి మరియు ప్రాధాన్యతను సర్దుబాటు చేస్తాయి — వచనం వెంబడి వివరణాత్మక బోధన నుండి సువార్త ప్రకటన మరియు మేపరు శుశ్రూష వరకు.',
    howItWorksAi: 'ఈ సాధనం మీ అంశం మరియు శాస్త్ర భాగం యొక్క ఆధారంగా సమగ్రమైన ప్రసంగాన్ని రూపొందించడానికి LLM ను ఉపయోగిస్తుంది.',
    howItWorksSave: 'మీ ప్యాకేజీలను తిరిగి చూడటానికి భద్రపరచండి. మార్క్‌డౌన్‌గా ఎగుమతి చేయండి లేదా ఆఫ్‌లైన్ ఉపయోగం కోసం PDF గా ప్రింట్ చేయండి.',
    howItWorksLocal: 'ప్రసంగ డేటా మీ బ్రౌజర్‌లో స్థానికంగా నిల్వ చేయబడుతుంది.',
    emptyHistory: 'ఇంకా సేవ్ చేసిన ప్రసంగ ప్యాకేజీలు లేవు.',
    emptyHistorySub: 'ప్రసంగ ప్యాకేజీని సృష్టించి సేవ్ చేస్తే ఇక్కడ చూడవచ్చు.',
    generating: 'AIతో ప్రసంగాన్ని సృష్టిస్తోంది... ఇది 30 సెకన్ల వరకు పట్టవచ్చు.',
    generateSermon: 'ప్రసంగ ప్యాకేజీని సృష్టించు',
    toneExpository: 'వివరణాత్మకం',
    toneExpositoryDesc: 'వచనం వచనం వెంబడి, వాక్య-ఆధారిత ప్రసంగం',
    toneTopical: 'అంశాధారితం',
    toneTopicalDesc: 'కథనం-ఆధారిత బైబిల్ సర్వే',
    toneEvangelistic: 'సువార్త',
    toneEvangelisticDesc: 'సువార్త-కేంద్రితం, ఆహ్వాన-ఆధారితం',
    toneYouth: 'యువజన',
    toneYouthDesc: 'యువతకు ఆకర్షణీయంగా',
    toneBibleStudy: 'బైబిల్ అధ్యయనం',
    toneBibleStudyDesc: 'బోధన మరియు ఆవిష్కరణ-ఆధారితం',
    tonePastoralCare: 'మేపరు శుశ్రూష',
    tonePastoralCareDesc: 'ఆదరణ మరియు మేపరు నొక్కిచెప్పడం',
    denomRomanCatholic: 'రోమన్ కాథలిక్',
    denomReformed: 'రిఫార్మ్డ్ / ప్రెస్బిటేరియన్',
    denomBaptist: 'బాప్టిస్ట్',
    denomMethodist: 'మెథడిస్ట్ / వెస్లేయన్ / పరిశుద్ధత',
    denomPentecostal: 'పెంతెకోస్తల్ / చారిత్రికవరం',
    denomLutheran: 'లూథరన్',
    denomAnglican: 'ఆంగ్లికన్ / ఎపిస్కోపల్',
    denomNonDenominational: 'సంఘ-రహిత / సువార్త',
    denomOther: 'ఇతరులు / పేర్కొనని',
    lengthStandard: 'ప్రామాణిక (20-30 నిమి)',
    lengthExtended: 'విస్తరిత (35-45 నిమి)',
    lengthLong: 'పొడవైన (45+ నిమి)',
    lengthFullHour: 'మొత్తం గంట (60+ నిమి)',
    lengthBrief: 'సంక్షిప్త (10-15 నిమి)',
    topicPlaceholder: 'ఉదా. "దేవుని నమ్మకం", "క్షమాపణ"',
    scripturePlaceholder: 'ఉదా. "రోమీయులు 8:28-30", "యోహాను 3:16-21"',
    audiencePlaceholder: 'ఉదా. "ఆదివారం ఉదయం సంఘం", "కళాశాల వయసు చిన్న సమూహం"',
    notesPlaceholder: 'ప్రత్యేక ఆసక్తి, చేర్చవలసిన ముఖ్య అంశాలు, లేదా ప్రత్యేక పరిశీలనలు...',
    childrenSermon: 'పిల్లల ప్రసంగం',
    socialMediaPack: 'సోషల్ మీడియా ప్యాక్',
    whatsapp: 'వాట్సాప్',
    instagram: 'ఇన్‌స్టాగ్రామ్',
    facebook: 'ఫేస్‌బుక్',
    copied: 'క్లిప్‌బోర్డ్‌కు కాపీ చేయబడింది!',
    estimatedTime: 'అంచనా సమయం',
    minutes: 'నిమి',
    introduction: 'ప్రవేశం',
    conclusion: 'ముగింపు',
    transition: 'మార్పు',
    shareCompact: 'సంక్షిప్తంగా భాగస్వామ్యం చేయి',
    copiedToClipboard: 'క్లిప్‌బోర్డ్‌కు కాపీ చేయబడింది!',
  },
}

function getSermonDurationMinutes(length: string): number {
  switch (length) {
    case 'brief': return 15
    case 'standard': return 25
    case 'extended': return 40
    case '45+': return 50
    case '60+': return 65
    default: return 25
  }
}

function distributeTime(outline: SermonOutlinePoint[], totalMinutes: number): number[] {
  const introMinutes = Math.round(totalMinutes * 0.15)
  const conclusionMinutes = Math.round(totalMinutes * 0.10)
  const bodyMinutes = totalMinutes - introMinutes - conclusionMinutes
  const perPoint = outline.length > 0 ? Math.round(bodyMinutes / outline.length) : bodyMinutes
  const times: number[] = [introMinutes]
  for (let i = 0; i < outline.length; i++) {
    times.push(perPoint)
  }
  times.push(conclusionMinutes)
  return times
}

function packToCompactText(pack: SermonPack, language: Language): string {
  const t = UI_TEXT[language]
  const lines: string[] = []
  lines.push(`📖 ${pack.title}`)
  lines.push(`${pack.input.tone} · ${pack.input.audience || 'General'} · ${pack.input.sermonLength || 'Standard'}`)
  lines.push('')
  lines.push(`🎯 ${t.bigIdea}: ${pack.bigIdea}`)
  lines.push('')
  lines.push(`📜 ${t.keyScriptures}:`)
  pack.keyScriptureReferences.forEach((ref) => lines.push(`  • ${ref}`))
  lines.push('')
  lines.push(`📝 ${t.sermonOutline}:`)
  pack.outline.forEach((pt, i) => {
    lines.push(`${i + 1}. ${pt.pointTitle}`)
  })
  lines.push('')
  lines.push(`🙏 ${t.prayerPoints}:`)
  pack.prayerPoints.forEach((pt) => lines.push(`  • ${pt}`))
  lines.push('')
  lines.push('—')
  lines.push('Generated by Sermon Prep Assistant')
  return lines.join('\n')
}

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
  language,
}: {
  onGenerate: (input: Omit<SermonInput, 'language'>) => void
  initialInput?: SermonInput | null
  language: Language
}) {
  const t = UI_TEXT[language]
  const toneOptions = useMemo(() => [
    { value: 'expository' as SermonTone, label: t.toneExpository, desc: t.toneExpositoryDesc },
    { value: 'topical' as SermonTone, label: t.toneTopical, desc: t.toneTopicalDesc },
    { value: 'evangelistic' as SermonTone, label: t.toneEvangelistic, desc: t.toneEvangelisticDesc },
    { value: 'youth' as SermonTone, label: t.toneYouth, desc: t.toneYouthDesc },
    { value: 'bible-study' as SermonTone, label: t.toneBibleStudy, desc: t.toneBibleStudyDesc },
    { value: 'pastoral-care' as SermonTone, label: t.tonePastoralCare, desc: t.tonePastoralCareDesc },
  ], [t])
  const denomOptions = useMemo(() => [
    { value: 'catholic', label: t.denomRomanCatholic },
    { value: 'reformed', label: t.denomReformed },
    { value: 'baptist', label: t.denomBaptist },
    { value: 'methodist', label: t.denomMethodist },
    { value: 'pentecostal', label: t.denomPentecostal },
    { value: 'lutheran', label: t.denomLutheran },
    { value: 'anglican', label: t.denomAnglican },
    { value: 'non-denominational', label: t.denomNonDenominational },
    { value: 'other', label: t.denomOther },
  ], [t])
  const lengthOptions = useMemo(() => [
    { value: 'standard', label: t.lengthStandard },
    { value: 'extended', label: t.lengthExtended },
    { value: '45+', label: t.lengthLong },
    { value: '60+', label: t.lengthFullHour },
    { value: 'brief', label: t.lengthBrief },
  ], [t])
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
        <label htmlFor="topic">{t.topicLabel}</label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t.topicPlaceholder}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="scripture">{t.scriptureLabel}</label>
        <input
          id="scripture"
          type="text"
          value={scripture}
          onChange={(e) => setScripture(e.target.value)}
          placeholder={t.scripturePlaceholder}
        />
      </div>

      <div className="form-group">
        <label htmlFor="audience">{t.audienceLabel}</label>
        <input
          id="audience"
          type="text"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder={t.audiencePlaceholder}
        />
      </div>

      <div className="form-group">
        <label htmlFor="sermonLength">{t.lengthLabel}</label>
        <select
          id="sermonLength"
          value={sermonLength}
          onChange={(e) => setSermonLength(e.target.value)}
        >
          {lengthOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="denomination">{t.denominationLabel}</label>
        <select
          id="denomination"
          value={denomination}
          onChange={(e) => setDenomination(e.target.value)}
        >
          {denomOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="tone">{t.toneLabel}</label>
        <select id="tone" value={tone} onChange={(e) => setTone(e.target.value as SermonTone)}>
          {toneOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} — {opt.desc}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="notes">{t.notesLabel}</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.notesPlaceholder}
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={!topic.trim() && !scripture.trim()}>
          {t.generateSermon}
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
  language,
}: {
  pack: SermonPack
  onBack: () => void
  onSave: () => void
  isSaved: boolean
  language: Language
}) {
  const t = UI_TEXT[language]
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

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setToast(t.copied)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setToast(t.copied)
    }
  }, [t])

  const shareCompact = useCallback(async () => {
    const text = packToCompactText(pack, language)
    try {
      await navigator.clipboard.writeText(text)
      setToast(t.copiedToClipboard)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setToast(t.copiedToClipboard)
    }
  }, [pack, language, t])

  return (
    <div className="sermon-output" ref={outputRef}>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="export-bar">
        <button className="btn btn-sm btn-secondary" onClick={onBack}>
          {t.newSermon}
        </button>
        <button className="btn btn-sm btn-outline" onClick={copyMarkdown}>
          {t.copyMarkdown}
        </button>
        <button className="btn btn-sm btn-outline" onClick={downloadMarkdown}>
          {t.downloadMd}
        </button>
        <button className="btn btn-sm btn-outline" onClick={printPDF}>
          {t.printPdf}
        </button>
        <button className="btn btn-sm btn-outline" onClick={shareCompact}>
          {t.shareCompact}
        </button>
        {!isSaved && (
          <button className="btn btn-sm btn-accent" onClick={onSave}>
            {t.saveToHistory}
          </button>
        )}
        {isSaved && (
          <span style={{ fontSize: '0.825rem', color: 'var(--color-success)', alignSelf: 'center' }}>
            ✓ {t.saved}
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
        <div className="section-title">{t.bigIdea}</div>
        <div className="section-body">
          <p><strong>{pack.bigIdea}</strong></p>
        </div>
      </div>

      {/* Pastoral Aim */}
      <div className="section">
        <div className="section-title">{t.pastoralAim}</div>
        <div className="section-body"><p>{pack.pastoralAim}</p></div>
      </div>

      {/* Introduction Hook */}
      <div className="section">
        <div className="section-title">{t.introductionHook}</div>
        <div className="section-body"><p>{pack.introductionHook}</p></div>
      </div>

      {/* Outline with Timer */}
      <div className="section">
        <div className="section-title">{t.sermonOutline}</div>
        {(() => {
          const totalMinutes = getSermonDurationMinutes(pack.input.sermonLength)
          const times = distributeTime(pack.outline, totalMinutes)
          return (
            <>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                ⏱ {t.estimatedTime}: {totalMinutes} {t.minutes}
              </div>
              <div style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'var(--color-bg-secondary)', borderRadius: '6px' }}>
                <strong>{t.introduction}</strong> — ~{times[0]} {t.minutes}
              </div>
              {pack.outline.map((pt, i) => (
                <div key={i}>
                  <div className="outline-point">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <h4>{pt.pointTitle}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>~{times[i + 1]} {t.minutes}</span>
                    </div>
                    <div className="explanation">{pt.explanation}</div>
                    <div className="transition"><strong>{t.transition}</strong> {pt.transition}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--color-bg-secondary)', borderRadius: '6px' }}>
                <strong>{t.conclusion}</strong> — ~{times[times.length - 1]} {t.minutes}
              </div>
            </>
          )
        })()}
      </div>

      {/* Key Scripture References */}
      <div className="section">
        <div className="section-title">{t.keyScriptures}</div>
        <div>
          {pack.keyScriptureReferences.map((ref, i) => (
            <span className="verse-tag" key={i}>{ref}</span>
          ))}
        </div>
      </div>

      {/* Supporting Verses */}
      <div className="section">
        <div className="section-title">{t.supportingVerses}</div>
        <div>
          {pack.supportingVerses.map((ref, i) => (
            <span className="verse-tag" key={i}>{ref}</span>
          ))}
        </div>
      </div>

      {/* Historical / Cultural Background */}
      <div className="section">
        <div className="section-title">{t.historicalBackground}</div>
        <div className="section-body"><p>{pack.historicalCulturalBackground}</p></div>
      </div>

      {/* Theological Themes */}
      <div className="section">
        <div className="section-title">{t.theologicalThemes}</div>
        <div>
          {pack.theologicalThemes.map((theme, i) => (
            <span className="theme-tag" key={i}>{theme}</span>
          ))}
        </div>
      </div>

      {/* Illustration Suggestions */}
      <div className="section">
        <div className="section-title">{t.illustrations}</div>
        <ul>
          {pack.illustrationSuggestions.map((ill, i) => (
            <li key={i}>{ill}</li>
          ))}
        </ul>
      </div>

      {/* Application Steps */}
      <div className="section">
        <div className="section-title">{t.applicationSteps}</div>
        <ol>
          {pack.applicationSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Discussion Questions */}
      <div className="section">
        <div className="section-title">{t.discussionQuestions}</div>
        <ol>
          {pack.discussionQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
      </div>

      {/* Small Group Teaching Notes */}
      <div className="section">
        <div className="section-title">{t.smallGroupNotes}</div>
        <div className="teaching-notes">{pack.smallGroupTeachingNotes}</div>
      </div>

      {/* Prayer Points */}
      <div className="section">
        <div className="section-title">{t.prayerPoints}</div>
        <ul>
          {pack.prayerPoints.map((pt, i) => (
            <li key={i}>{pt}</li>
          ))}
        </ul>
      </div>

      {/* Related Videos */}
      <div className="section">
        <div className="section-title">{t.relatedVideos}</div>
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
        <div className="section-title">{t.worshipSongs}</div>
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
        <div className="section-title">{t.closingChallenge}</div>
        <div className="section-body"><p>{pack.closingChallenge}</p></div>
      </div>

      {/* Children's Sermon */}
      <div className="section">
        <div className="section-title">{t.childrenSermon}</div>
        <div className="section-body"><p>{pack.childrenSermon}</p></div>
      </div>

      {/* Social Media Pack */}
      <div className="section">
        <div className="section-title">{t.socialMediaPack}</div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{t.whatsapp}</div>
          <div className="section-body" style={{ whiteSpace: 'pre-wrap' }}>{pack.socialMediaPack.whatsapp}</div>
          <button className="btn btn-sm btn-outline" onClick={() => copyToClipboard(pack.socialMediaPack.whatsapp)}>Copy</button>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{t.instagram}</div>
          <div className="section-body" style={{ whiteSpace: 'pre-wrap' }}>{pack.socialMediaPack.instagram}</div>
          <button className="btn btn-sm btn-outline" onClick={() => copyToClipboard(pack.socialMediaPack.instagram)}>Copy</button>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{t.facebook}</div>
          <div className="section-body" style={{ whiteSpace: 'pre-wrap' }}>{pack.socialMediaPack.facebook}</div>
          <button className="btn btn-sm btn-outline" onClick={() => copyToClipboard(pack.socialMediaPack.facebook)}>Copy</button>
        </div>
      </div>
    </div>
  )
}

function HistoryPanel({
  history,
  onLoad,
  onDelete,
  language,
}: {
  history: SavedSermon[]
  onLoad: (sermon: SavedSermon) => void
  onDelete: (id: string) => void
  language: Language
}) {
  const t = UI_TEXT[language]

  if (history.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">📖</div>
        <p>{t.emptyHistory}</p>
        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
          {t.emptyHistorySub}
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

  // ── Loading state ──
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  // ── Theme state ──
  const [theme, setTheme] = useState<Theme>('light')
  const [themeReady, setThemeReady] = useState(false)

  // ── Language state ──
  const [language, setLanguage] = useState<Language>('en')

  const t = UI_TEXT[language]

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
    if (stored === 'en' || stored === 'ta' || stored === 'ml' || stored === 'te') {
      setLanguage(stored)
    }
  }, [])

  // ── Generate handler ──
  const handleGenerate = useCallback(
    (partial: Omit<SermonInput, 'language'>) => {
      const input: SermonInput = { ...partial, language }

      setIsLoading(true)
      setLoadingMessage(t.generating)
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
    },
    [language, t.generating],
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
              {t.compose}
            </button>
            <button
              className={view === 'history' ? 'active' : ''}
              onClick={() => setView('history')}
            >
              {t.history} ({history.length})
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
            background: 'var(--color-primary-light)',
            borderBottom: '1px solid var(--color-primary)',
            padding: '0.5rem 0',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--color-primary)',
          }}
        >
          AI Mode — LLM-powered sermon generation
        </div>
      )}

      <main className="main-content">
        <div className="container">
          {toast && <Toast message={toast} onDone={() => setToast(null)} />}

          <div className="disclaimer-banner">
            <strong>{t.disclaimer}</strong> {t.disclaimerBody}
          </div>

          {view === 'compose' && (
            <div className="page-grid">
              <div className="card">
                <h2>{t.sermonDetails}</h2>
                <SermonForm
                  onGenerate={handleGenerate}
                  initialInput={formInput}
                  language={language}
                />
              </div>
              <div className="card">
                <h2>{t.howItWorks}</h2>
                <div style={{ fontSize: '0.935rem', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    {t.howItWorksIntro}
                  </p>
                  <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                    <li>{t.howItWorksListItem1}</li>
                    <li>{t.howItWorksListItem2}</li>
                    <li>{t.howItWorksListItem3}</li>
                    <li>{t.howItWorksListItem4}</li>
                    <li>{t.howItWorksListItem5}</li>
                    <li>{t.howItWorksListItem6}</li>
                    <li>{t.howItWorksListItem7}</li>
                    <li>{t.howItWorksListItem8}</li>
                    <li>{t.howItWorksListItem9}</li>
                  </ul>
                  <p style={{ marginBottom: '0.75rem' }}>
                    {t.howItWorksTone}
                  </p>
                  <p style={{ marginBottom: '0.75rem' }}>
                    {t.howItWorksAi}
                  </p>
                  <p style={{ marginBottom: '0.75rem' }}>
                    {t.howItWorksSave}
                  </p>
                  <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                    {t.howItWorksLocal}
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
                language={language}
              />
            </div>
          )}

          {view === 'history' && (
            <div className="card">
              <h2>{t.savedSermonPacks}</h2>
              <HistoryPanel
                history={history}
                onLoad={handleLoadHistory}
                onDelete={handleDeleteHistory}
                language={language}
              />
            </div>
          )}
        </div>
      </main>
    </>
  )
}
