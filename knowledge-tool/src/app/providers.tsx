'use client'

import { ReactNode } from 'react'
import { CookiesProvider } from 'next-client-cookies'

export function Providers({ children }: { children: ReactNode }) {
  return <CookiesProvider value={[]}>{children}</CookiesProvider>
}
