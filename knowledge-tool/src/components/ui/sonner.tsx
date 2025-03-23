'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      richColors
      toastOptions={{
        classNames: {
          success: 'bg-green-600 text-white border-green-700',
          error: 'bg-red-500 text-white border-red-600'
        },
        style: {
          '--success-bg': 'hsl(142, 76%, 36%)',
          '--success-text': 'hsl(0, 0%, 100%)',
          '--success-border': 'hsl(142, 76%, 29%)',
          '--error-bg': 'hsl(0, 84%, 60%)',
          '--error-text': 'hsl(0, 0%, 100%)',
          '--error-border': 'hsl(0, 84%, 50%)'
        } as React.CSSProperties
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)'
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
