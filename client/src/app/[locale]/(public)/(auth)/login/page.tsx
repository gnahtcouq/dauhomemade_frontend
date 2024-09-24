import LoginForm from '@/app/[locale]/(public)/(auth)/login/login-form'
import Logout from '@/app/[locale]/(public)/(auth)/login/logout'
import envConfig, {Locale} from '@/config'
import {getTranslations, unstable_setRequestLocale} from 'next-intl/server'

export async function generateMetadata({
  params: {locale}
}: {
  params: {locale: Locale}
}) {
  const t = await getTranslations({locale, namespace: 'Login'})
  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/login`

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: url
    }
  }
}

export default function Login({
  params: {locale}
}: {
  params: {
    locale: string
  }
}) {
  unstable_setRequestLocale(locale)
  return (
    <div className="flex items-center justify-center">
      <LoginForm />
      <Logout />
    </div>
  )
}
