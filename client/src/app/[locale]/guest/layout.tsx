import Layout from '@/app/[locale]/(public)/layout'
import { unstable_setRequestLocale } from 'next-intl/server'

export default function GuestLayout({
  children,
  params: {locale}
}: Readonly<{children: React.ReactNode
  params: {
    locale: string
  }
}>) {
  unstable_setRequestLocale(locale)
  return (
    <Layout modal={null} params={{locale: locale}}>
      {children}
    </Layout>
  )
}
