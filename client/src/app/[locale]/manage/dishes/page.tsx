import DishTable from '@/app/[locale]/manage/dishes/dish-table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {Suspense} from 'react'
import {getTranslations, unstable_setRequestLocale} from 'next-intl/server'
import {Metadata} from 'next'
import envConfig, {Locale} from '@/config'

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
    namespace: 'ManageDishes'
  })

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/manage/dishes`

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

export default async function DishesPage({
  params: {locale}
}: {
  params: {
    locale: string
  }
}) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations({locale, namespace: 'ManageDishes'})
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <DishTable />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
