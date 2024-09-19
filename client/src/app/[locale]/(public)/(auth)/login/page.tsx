import LoginForm from '@/app/[locale]/(public)/(auth)/login/login-form'
import {unstable_setRequestLocale} from 'next-intl/server'

export default function Login({
  params: {locale}
}: {
  params: {
    locale: string
  }
}) {
  unstable_setRequestLocale(locale)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </div>
  )
}
