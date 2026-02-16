import './globals.css'
import { ReactNode } from 'react'
import ParticleBackground from '../components/ParticleBackground'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black text-white overflow-x-hidden">
        <ParticleBackground />
        {children}
      </body>
    </html>
  )
}