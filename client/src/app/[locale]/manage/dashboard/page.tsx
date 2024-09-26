import DashboardMain from '@/app/[locale]/manage/dashboard/dashboard-main'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import envConfig, {Locale} from '@/config'
import {Metadata} from 'next'
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
    namespace: 'Dashboard'
  })

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/manage/dashboard`

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

export default async function Dashboard({
  params: {locale}
}: {
  params: {
    locale: string
  }
}) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations({
    locale,
    namespace: 'Dashboard'
  })

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardMain />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
