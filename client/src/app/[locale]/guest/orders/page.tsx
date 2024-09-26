import OrderCart from '@/app/[locale]/guest/orders/order-cart'
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
    title: t('order.title'),
    description: t('order.description'),
    alternates: {
      canonical: url
    }
  }
}

export default async function OrdersPage({
  params: {locale}
}: {
  params: {
    locale: string
  }
}) {
  const t = await getTranslations({locale, namespace: 'Guest'})
  return (
    <div className="max-w-[400px] mx-auto space-y-4">
      <h1 className="text-center text-xl font-bold">
        {t('order.description')}
      </h1>
      <OrderCart />
    </div>
  )
}
