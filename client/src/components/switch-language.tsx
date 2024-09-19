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
import {setUserLocale} from '@/services/locale'

export function SwitchLanguage() {
  const t = useTranslations('SwitchLanguage')
  const locale = useLocale()
  return (
    <Select
      value={locale}
      onValueChange={(value) => {
        setUserLocale(value as Locale)
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
