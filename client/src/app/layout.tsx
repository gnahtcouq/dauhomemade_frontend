import type {Metadata} from 'next'
import {Inter as FontSans} from 'next/font/google'
import './globals.css'
import {cn} from '@/lib/utils'
import {Toaster} from '@/components/ui/toaster'
import {ThemeProvider} from '@/components/theme-provider'
import AppProvider from '@/components/app-provider'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})
export const metadata: Metadata = {
  title: 'Đậu Homemade',
  description: 'ĐẬU HOMEMADE BÚN ĐẬU MẮM TÔM & MORE'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <AppProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  )
}
