import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import '../styles/globals.css'
import { cn } from '@/lib/utils'
import { Providers } from './providers' // ← クライアントプロバイダーを使用

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: 'TSUREDURE - 徒然なるままに',
  description: '気軽に残してAIで整理'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="light" style={{ colorScheme: 'light' }}>
      <body
        className={cn(
          'h-full bg-background font-sans antialiased overflow-hidden',
          fontSans.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
