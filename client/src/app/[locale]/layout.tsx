import AppProvider from '@/components/app-provider'
import {ThemeProvider} from '@/components/theme-provider'
import {Toaster} from '@/components/ui/toaster'
import {Locale, locales} from '@/config'
import {cn} from '@/lib/utils'
import {NextIntlClientProvider} from 'next-intl'
import {
  getMessages,
  getTranslations,
  unstable_setRequestLocale
} from 'next-intl/server'
import {Inter as FontSans} from 'next/font/google'
import './globals.css'
import NextTopLoader from 'nextjs-toploader'
import {baseOpenGraph} from '@/shared-metadata'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

// export const metadata: Metadata = {
//   title: 'Đậu Homemade',
//   description: 'ĐẬU HOMEMADE BÚN ĐẬU MẮM TÔM & MORE'
// }

export async function generateMetadata({
  params: {locale}
}: {
  params: {
    locale: Locale
  }
}) {
  const t = await getTranslations({
    locale,
    namespace: 'HomePage'
  })

  return {
    title: {
      template: `%s | ${t('title')}`,
      default: t('defaultTitle')
    },
    openGraph: {
      ...baseOpenGraph
    }
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({locale}))
}

export default async function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode
  params: {locale: string}
}>) {
  unstable_setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased vsc-initialized',
          fontSans.variable
        )}
      >
        <NextTopLoader
          color="hsl(var(--muted-foreground))"
          showSpinner={false}
        />
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
