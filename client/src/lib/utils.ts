import authApiRequest from '@/apiRequests/auth'
import guestApiRequest from '@/apiRequests/guest'
import envConfig from '@/config'
import {DishStatus, OrderStatus, Role, TableStatus} from '@/constants/type'
import {toast} from '@/hooks/use-toast'
import {EntityError} from '@/lib/http'
import {TokenPayload} from '@/types/jwt.types'
import {clsx, type ClassValue} from 'clsx'
// import {format} from 'date-fns'
import jwt from 'jsonwebtoken'
import {BookX, CookingPot, HandCoins, Loader, Truck} from 'lucide-react'
import {UseFormSetError} from 'react-hook-form'
import {io} from 'socket.io-client'
import {twMerge} from 'tailwind-merge'

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
  const decodedAccessToken = decodeToken(accessToken)
  const decodedRefreshToken = decodeToken(refreshToken)

  // Thời điểm hết hạn của token tính theo epoch time(s)
  // Còn khi dùng cú pháp new Date().getTime() thì sẽ ra epoch time(ms)
  const now = Math.floor(new Date().getTime() / 1000) - 1

  // Trường hợp refreshToken hết hạn thì cho logout
  if (decodedRefreshToken.exp < now) {
    removeTokensFromLocalStorage()
    return param?.onError && param.onError()
  }

  // Nếu accessToken có thời gian là 10s
  // Thì kiểm tra nếu còn 1/3 thời gian (3s) thì refresh token
  if (
    decodedAccessToken.exp - now <
    (decodedAccessToken.exp - decodedAccessToken.iat) / 3
  ) {
    // Gọi API refresh token
    try {
      const role = decodedRefreshToken.role
      const res =
        role === Role.Guest
          ? await guestApiRequest.refreshToken()
          : await authApiRequest.refreshToken()
      setAccessTokenToLocalStorage(res.payload.data.accessToken)
      setRefreshTokenToLocalStorage(res.payload.data.refreshToken)
      param?.onSuccess && param.onSuccess()
    } catch (error) {
      param?.onError && param.onError()
    }
  }
}

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(number)
}

export const getVietnameseDishStatus = (
  status: (typeof DishStatus)[keyof typeof DishStatus]
) => {
  switch (status) {
    case DishStatus.Available:
      return 'Có sẵn'
    case DishStatus.Unavailable:
      return 'Không có sẵn'
    default:
      return 'Ẩn'
  }
}

export const getVietnameseOrderStatus = (
  status: (typeof OrderStatus)[keyof typeof OrderStatus]
) => {
  switch (status) {
    case OrderStatus.Delivered:
      return 'Đã phục vụ'
    case OrderStatus.Paid:
      return 'Đã thanh toán'
    case OrderStatus.Pending:
      return 'Chờ xử lý'
    case OrderStatus.Processing:
      return 'Đang nấu'
    default:
      return 'Từ chối'
  }
}

export const getVietnameseTableStatus = (
  status: (typeof TableStatus)[keyof typeof TableStatus]
) => {
  switch (status) {
    case TableStatus.Available:
      return 'Có sẵn'
    case TableStatus.Reserved:
      return 'Đã đặt'
    default:
      return 'Ẩn'
  }
}

export const getTableLink = ({
  token,
  tableNumber
}: {
  token: string
  tableNumber: number
}) => {
  return (
    envConfig.NEXT_PUBLIC_URL + '/tables/' + tableNumber + '?token=' + token
  )
}

export function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

export const simpleMatchText = (fullText: string, matchText: string) => {
  return removeAccents(fullText.toLowerCase()).includes(
    removeAccents(matchText.trim().toLowerCase())
  )
}

// export const formatDateTimeToLocaleString = (date: string | Date) => {
//   return format(
//     date instanceof Date ? date : new Date(date),
//     'HH:mm:ss dd/MM/yyyy'
//   )
// }

// export const formatDateTimeToTimeString = (date: string | Date) => {
//   return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss')
// }

export const generateSocketInstance = (accessToken: string) => {
  return io(envConfig.NEXT_PUBLIC_API_ENDPOINT, {
    auth: {
      Authorization: `Bearer ${accessToken}`
    }
  })
}

export const OrderStatusIcon = {
  [OrderStatus.Pending]: Loader,
  [OrderStatus.Processing]: CookingPot,
  [OrderStatus.Rejected]: BookX,
  [OrderStatus.Delivered]: Truck,
  [OrderStatus.Paid]: HandCoins
}

export const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload
}

export const truncateDescription = (description: string, maxLength: number) => {
  if (description.length <= maxLength) return description
  const truncated = description.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace === -1) {
    return truncated + '...'
  }
  return truncated.slice(0, lastSpace) + '...'
}
