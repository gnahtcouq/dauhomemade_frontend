import {Role} from '@/constants/type'
import {TokenPayload} from '@/types/jwt.types'
import jwt from 'jsonwebtoken'
import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'

const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload
}

const managePaths = ['/manage']
const guestPaths = ['/guest']
const onlyOwnerPaths = ['/manage/accounts', '/manage/dishes', '/manage/tables']
const privatePaths = [...managePaths, ...guestPaths]
const unAuthPaths = ['/login']

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  // 1. Chưa đăng nhập thì không cho vào private paths
  if (privatePaths.some((path) => pathname.startsWith(path)) && !refreshToken) {
    const url = new URL('/login', request.url)
    url.searchParams.set('clearTokens', 'true')
    return NextResponse.redirect(url)
  }

  // 2. Đã đăng nhập
  if (refreshToken) {
    // 2.1. Nếu đã đăng nhập rồi thì không cho vào trang login
    if (unAuthPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 2.2 Trường hợp đăng nhập rồi nhưng access token lại hết hạn
    if (
      privatePaths.some((path) => pathname.startsWith(path)) &&
      !accessToken
    ) {
      const url = new URL('/refresh-token', request.url)
      url.searchParams.set('refreshToken', refreshToken)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // 2.3 Trường hợp truy cập không đúng role, redirect về trang chủ
    const role = decodeToken(refreshToken).role
    // Guest nhưng truy cập vào route Owner
    const isGuestGoToManagePath =
      role === Role.Guest &&
      managePaths.some((path) => pathname.startsWith(path))
    // Không phải Guest nhưng truy cập vào route Guest
    const isNotGuestGoToGuestPath =
      role !== Role.Guest &&
      guestPaths.some((path) => pathname.startsWith(path))

    // Không phải Owner nhưng truy cập vào các route Owner
    const isNotOwnerGoToOwnerPath =
      role !== Role.Owner &&
      onlyOwnerPaths.some((path) => pathname.startsWith(path))

    if (
      isGuestGoToManagePath ||
      isNotGuestGoToGuestPath ||
      isNotOwnerGoToOwnerPath
    ) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/manage/:path*', '/guest/:path*', '/login']
}
