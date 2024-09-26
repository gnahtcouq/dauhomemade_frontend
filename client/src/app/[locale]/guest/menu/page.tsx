import MenuOrder from '@/app/[locale]/guest/menu/menu-order'
import envConfig, {Locale} from '@/config'
import {getTranslations} from 'next-intl/server'

export async function generateMetadata({
  params: {locale}
}: {
  params: {locale: Locale}
}) {
  const t = await getTranslations({locale, namespace: 'Guest'})
  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/guest/orders`

  return {
    title: t('menu.title'),
    description: t('menu.description'),
    alternates: {
      canonical: url
    }
  }
}

export default async function MenuPage({
  params: {locale}
}: {
  params: {
    locale: string
  }
}) {
  const t = await getTranslations({locale, namespace: 'Guest'})
  return (
    <div className="max-w-[400px] mx-auto space-y-4">
      <h1 className="text-center text-xl font-bold">{t('menu.description')}</h1>
      <MenuOrder />
    </div>
  )
}
