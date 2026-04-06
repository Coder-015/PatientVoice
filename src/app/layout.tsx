import type { Metadata } from 'next'
import './globals.css'
import AuthGuard from '../components/AuthGuard'

export const metadata: Metadata = {
  title: 'PatientVoice — Empathetic Health Companion',
  description: 'AI-powered empathetic health companion for clinical insights from your symptom narratives.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  )
}
