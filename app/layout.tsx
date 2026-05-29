import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sermon Preparation Assistant',
  description: 'A tool to help pastors prepare sermon packs with outlines, illustrations, discussion questions, and more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sermon-prep-theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t;return}if(window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.dataset.theme='dark'}}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
