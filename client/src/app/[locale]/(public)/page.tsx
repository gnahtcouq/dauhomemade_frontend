import envConfig, {Locale} from '@/config'
import {htmlToTextForDescription} from '@/lib/utils'
import {getTranslations, unstable_setRequestLocale} from 'next-intl/server'

export async function generateMetadata({
  params: {locale}
}: {
  params: {locale: Locale}
}) {
  const t = await getTranslations({locale, namespace: 'HomePage'})
  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}`

  return {
    title: t('homepage'),
    description: htmlToTextForDescription(t('description')),
    alternates: {
      canonical: url
    }
  }
}

export default async function Home({
  params: {locale}
}: {
  params: {
    locale: string
  }
}) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('HomePage')

  return (
    <div className="w-full space-y-4">
      <section className="relative z-10">
        <div className="z-20 relative py-10 md:py-20 px-4 sm:px-10 md:px-20">
          <h1 className="text-center text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white">
            ĐẬU HOMEMADE
          </h1>
          <p className="text-center text-sm sm:text-base mt-4 text-black dark:text-white">
            {t('description')}
          </p>
        </div>
      </section>
    </div>
  )
}
