'use client'

import {useAppContext} from '@/components/app-provider'
import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage
} from '@/lib/utils'
import {useLogoutMutation} from '@/queries/useAuth'
import {useRouter, useSearchParams} from 'next/navigation'
import {useEffect, useRef} from 'react'

export default function LogoutPage() {
  const {mutateAsync} = useLogoutMutation()
  const router = useRouter()
  const {setIsAuth} = useAppContext()
  const searchParams = useSearchParams()
  const refreshTokenFromUrl = searchParams.get('refreshToken')
  const accessTokenFromUrl = searchParams.get('accessToken')
  const ref = useRef<any>(null)
  useEffect(() => {
    if (
      !ref.current &&
      ((refreshTokenFromUrl &&
        refreshTokenFromUrl === getRefreshTokenFromLocalStorage()) ||
        (accessTokenFromUrl &&
          accessTokenFromUrl === getAccessTokenFromLocalStorage()))
    ) {
      ref.current = mutateAsync
      mutateAsync().then(() => {
        setTimeout(() => {
          ref.current = null
        }, 1000)
        setIsAuth(false)
        router.push('/login')
      })
    } else {
      router.push('/')
    }
  }, [mutateAsync, router, refreshTokenFromUrl, accessTokenFromUrl, setIsAuth])

  return <div>Logout...</div>
}
