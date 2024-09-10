import {toast} from '@/hooks/use-toast'
import {EntityError} from '@/lib/http'
import {clsx, type ClassValue} from 'clsx'
import {UseFormSetError} from 'react-hook-form'
import {twMerge} from 'tailwind-merge'
import jwt from 'jsonwebtoken'
import authApiRequest from '@/apiRequests/auth'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* 
Xoá đi ký tự `/` đầu tiên của path
*/
export function normalizePath(path: string) {
  return path.startsWith('/') ? path.slice(1) : path
}

export const handleErrorApi = ({
  error,
  setError,
  duration
}: {
  error: any
  setError?: UseFormSetError<any>
  duration?: number
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        type: 'server',
        message: item.message
      })
    })
  } else {
    toast({
      title: 'Lỗi',
      description: error?.payload?.message ?? 'Lỗi không xác định',
      variant: 'destructive',
      duration: duration ?? 5000
    })
  }
}

const isBrowser = typeof window !== 'undefined'

export const getAccessTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem('accessToken') : null

export const getRefreshTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem('refreshToken') : null

export const setAccessTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem('accessToken', value)

export const setRefreshTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem('refreshToken', value)

export const removeTokensFromLocalStorage = () => {
  isBrowser && localStorage.removeItem('accessToken')
  isBrowser && localStorage.removeItem('refreshToken')
}

export const checkAndRefreshToken = async (param?: {
  onError?: () => void
  onSuccess?: () => void
}) => {
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
      param?.onSuccess && param.onSuccess()
    } catch (error) {
      param?.onError && param.onError()
    }
  }
}
