import GuestLoginForm from '@/app/[locale]/(public)/tables/[number]/guest-login-form'
import envConfig, {Locale} from '@/config'
import {getTranslations} from 'next-intl/server'

export async function generateMetadata({
  params: {locale}
}: {
  params: {locale: Locale}
}) {
  const t = await getTranslations({locale, namespace: 'GuestLogin'})
  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/tables/`

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: url
    }
  }
}

export default function TableNumberPage() {
  return <GuestLoginForm />
}
