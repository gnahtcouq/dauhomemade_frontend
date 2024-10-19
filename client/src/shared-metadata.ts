import envConfig from '@/config'

export const baseOpenGraph = {
  locale: 'en_US',
  alternateLocale: ['vi_VN'],
  type: 'website',
  site_name: 'Đậu Homemade',
  images: [
    {
      url: `${envConfig.NEXT_PUBLIC_URL}/banner.jpg`
    }
  ]
}
