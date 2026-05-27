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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
