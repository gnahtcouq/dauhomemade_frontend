import {getRequestConfig} from 'next-intl/server'

export default getRequestConfig(async () => {
  // Ngôn ngữ website
  // Các giá trị locale có thể lấy từ cookie của người dùng
  const locale = 'vi'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
