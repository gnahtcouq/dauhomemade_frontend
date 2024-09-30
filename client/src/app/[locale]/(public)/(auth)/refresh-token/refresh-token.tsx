'use client'

import {
  checkAndRefreshToken,
  getRefreshTokenFromLocalStorage
} from '@/lib/utils'
import {useRouter} from '@/navigation'
import {useSearchParams} from 'next/navigation'
import {useEffect} from 'react'

export default function RefreshToken() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refreshTokenFromUrl = searchParams.get('refreshToken')
  const redirectPathname = searchParams.get('redirect')
  const pathname = redirectPathname
    ? redirectPathname.replace(/^\/(vi|en)/, '')
    : '/'
  useEffect(() => {
    if (
      refreshTokenFromUrl &&
      refreshTokenFromUrl === getRefreshTokenFromLocalStorage()
    ) {
      checkAndRefreshToken({
        onSuccess: () => {
          router.push(pathname)
        }
      })
    } else {
      router.push('/')
    }
  }, [router, refreshTokenFromUrl, pathname])

  return <div>Refresh token...</div>
}
