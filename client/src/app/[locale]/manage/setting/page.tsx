import ChangePasswordForm from '@/app/[locale]/manage/setting/change-password-form'
import UpdateProfileForm from '@/app/[locale]/manage/setting/update-profile-form'
import envConfig, {Locale} from '@/config'
import {Metadata} from 'next'
import {useTranslations} from 'next-intl'
import {getTranslations, unstable_setRequestLocale} from 'next-intl/server'

type Props = {
  params: {locale: Locale}
  searchParams: {[key: string]: string | string[] | undefined}
}

export async function generateMetadata({
  params,
  searchParams
}: Props): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'UpdateProfile'
  })

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/manage/settings`

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: url
    },
    robots: {
      index: false
    }
  }
}

export default function Setting({
  params: {locale}
}: {
  params: {
    locale: string
  }
}) {
  unstable_setRequestLocale(locale)
  const t = useTranslations('UpdateProfile')
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid w-full flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {t('settings')}
          </h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8">
          <UpdateProfileForm />
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  )
}
