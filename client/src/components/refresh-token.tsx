'use client'

import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage
} from '@/lib/utils'
import {usePathname} from 'next/navigation'
import {useEffect} from 'react'
import jwt from 'jsonwebtoken'
import authApiRequest from '@/apiRequests/auth'

// Những path không cần check refresh token
const UNAUTHENTICATED_PATH = ['/login', 'logout', '/refresh-token']

export default function RefreshToken() {
  const pathname = usePathname()
  useEffect(() => {
    if (UNAUTHENTICATED_PATH.includes(pathname)) return
    let interval: any = null
    const checkAndRefreshToken = async () => {
      // Không nên đưa logic get accessToken và refreshToken ngoài function này
      // Vì để mỗi lần mà checkAndRefreshToken chạy sẽ lấy lại accessToken và refreshToken mới
      // Tránh hiện tượng bug nó lấy accessToken và refreshToken cũ ở lần đầu rồi gọi cho các lần sau
      const accessToken = getAccessTokenFromLocalStorage()
      const refreshToken = getRefreshTokenFromLocalStorage()

      // Chưa đăng nhập thì return
      if (!accessToken || !refreshToken) return

      // Check token hết hạn
      const decodedAccessToken = jwt.decode(accessToken) as {
        exp: number
        iat: number
      }
      const decodedRefreshToken = jwt.decode(refreshToken) as {
        exp: number
        iat: number
      }

      // Thời điểm hết hạn của token tính theo epoch time(s)
      // Còn khi dùng cú pháp new Date().getTime() thì sẽ ra epoch time(ms)
      const now = Math.floor(new Date().getTime() / 1000)

      // Trường hợp refreshToken hết hạn thì không xử lý
      if (decodedRefreshToken.exp < now) return

      // Nếu accessToken có thời gian là 10s
      // Thì kiểm tra nếu còn 1/3 thời gian (3s) thì refresh token
      if (
        decodedAccessToken.exp - now <
        (decodedAccessToken.exp - decodedAccessToken.iat) / 3
      ) {
        // Gọi API refresh token
        try {
          const res = await authApiRequest.refreshToken()
          setAccessTokenToLocalStorage(res.payload.data.accessToken)
          setRefreshTokenToLocalStorage(res.payload.data.refreshToken)
        } catch (error) {
          clearInterval(interval)
        }
      }
    }

    // Phải gọi lần đầu tiên vì interval sẽ chạy sau thời gian TIMEOUT
    checkAndRefreshToken()
    // Timeout interval phải bé hơn thời gian hết hạn của access token
    // Ví dụ thời gian hết hạn access token là 10s thì 1s phải check 1 lần
    const TIMEOUT = 1000
    interval = setInterval(checkAndRefreshToken, TIMEOUT)
    return () => clearInterval(interval)
  }, [pathname])
  return null
}
