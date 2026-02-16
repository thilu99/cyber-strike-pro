import './globals.css'
import { ReactNode } from 'react'
import ParticleBackground from '../components/ParticleBackground'
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Cyber Strike Pro',
  description: 'Ultimate Multiplayer Arcade',
}

// This prevents the "double-tap to zoom" and "pinch to zoom" that breaks game dragging
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black text-white overflow-hidden fixed inset-0">
        <ParticleBackground />
        {children}
      </body>
    </html>
  )
}