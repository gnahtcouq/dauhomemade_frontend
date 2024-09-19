import AppProvider from '@/components/app-provider'
import {ThemeProvider} from '@/components/theme-provider'
import {Toaster} from '@/components/ui/toaster'
import {cn} from '@/lib/utils'
import type {Metadata} from 'next'
import {Inter as FontSans} from 'next/font/google'
import './globals.css'
import {NextIntlClientProvider} from 'next-intl'
import {getLocale, getMessages} from 'next-intl/server'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})
export const metadata: Metadata = {
  title: 'Đậu Homemade',
  description: 'ĐẬU HOMEMADE BÚN ĐẬU MẮM TÔM & MORE'
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased vsc-initialized',
          fontSans.variable
        )}
      >
        <NextIntlClientProvider messages={messages}>
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
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
