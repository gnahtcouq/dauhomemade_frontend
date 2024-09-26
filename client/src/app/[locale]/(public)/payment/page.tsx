import PaymentSuccess from '@/app/[locale]/(public)/payment/payment-success'
import envConfig, {Locale} from '@/config'
import {getTranslations} from 'next-intl/server'

export async function generateMetadata({
  params: {locale}
}: {
  params: {locale: Locale}
}) {
  const t = await getTranslations({locale, namespace: 'Payment'})
  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/payment`

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: url
    }
  }
}

export default function OrdersPage() {
  return (
    <div className="max-w-[400px] mx-auto space-y-4">
      <PaymentSuccess />
    </div>
  )
}
