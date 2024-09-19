'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {Locale, locales} from '@/config'
import {useLocale, useTranslations} from 'next-intl'
import {
  usePathname,
  useRouter,
  useSearchParams,
  useParams
} from 'next/navigation'

export function SwitchLanguage() {
  const t = useTranslations('SwitchLanguage')
  const locale = useLocale()
  const pathname = usePathname()
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  return (
    <Select
      value={locale}
      onValueChange={(value) => {
        const locale = params.locale as Locale
        const newPathname = pathname.replace(`/${locale}/`, `/${value}/`)
        const fullUrl = `${newPathname}?${searchParams.toString()}`
        router.replace(fullUrl)
        router.refresh()
      }}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder={t('title')}></SelectValue>
      </SelectTrigger>
      <SelectContent>
        {locales.map((locale) => (
          <SelectItem value={locale} key={locale}>
            {t(locale)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
