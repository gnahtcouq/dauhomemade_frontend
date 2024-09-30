import {defaultLocale, locales} from '@/config'
import {Role} from '@/constants/type'
import {TokenPayload} from '@/types/jwt.types'
import jwt from 'jsonwebtoken'
import createMiddleware from 'next-intl/middleware'
import {NextResponse, type NextRequest} from 'next/server'

const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload
}

const managePaths = ['/vi/manage', '/en/manage']
const guestPaths = ['/vi/guest', '/en/guest']
const onlyOwnerPaths = [
  '/vi/manage/dashboard',
  '/vi/manage/accounts',
  '/vi/manage/dishes',
  '/vi/manage/tables',
  '/en/manage/dashboard',
  '/en/manage/accounts',
  '/en/manage/dishes',
  '/en/manage/tables'
]
const unAuthPaths = ['/vi/login', '/en/login']
const loginPaths = ['/vi/login', '/en/login']
const paymentPaths = ['/vi/payment', '/en/payment']
const privatePaths = [...managePaths, ...guestPaths]

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale
  })
  const response = handleI18nRouting(request)
  const {pathname, searchParams} = request.nextUrl
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value
  const locale = request.cookies.get('NEXT_LOCALE')?.value || defaultLocale

  // 1. Chưa đăng nhập thì không cho vào private paths
  if (
    (privatePaths.some((path) => pathname.startsWith(path)) ||
      paymentPaths.some((path) => pathname.startsWith(path))) &&
    !refreshToken
  ) {
    const url = new URL(`/${locale}/login`, request.url)
    url.searchParams.set('clearTokens', 'true')
    return NextResponse.redirect(url)
    // response.headers.set('x-middleware-rewrite', url.toString())
    // return response
  }

  // 2. Đã đăng nhập
  if (refreshToken) {
    // 2.1. Nếu đã đăng nhập rồi thì không cho vào trang login
    if (unAuthPaths.some((path) => pathname.startsWith(path))) {
      if (
        loginPaths.some((path) => pathname.startsWith(path)) &&
        searchParams.get('accessToken')
      ) {
        return response
      }
      return NextResponse.redirect(new URL(`/${locale}`, request.url))
      // response.headers.set(
      //   'x-middleware-rewrite',
      //   new URL(`/${locale}/`, request.url).toString()
      // )
      // return response
    }

    // 2.2 Trường hợp đăng nhập rồi nhưng access token lại hết hạn
    if (
      (privatePaths.some((path) => pathname.startsWith(path)) &&
        !accessToken)
    ) {
      const url = new URL(`/${locale}/refresh-token`, request.url)
      url.searchParams.set('refreshToken', refreshToken)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
      // response.headers.set('x-middleware-rewrite', url.toString())
      // return response
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
      return NextResponse.redirect(new URL(`/${locale}`, request.url))
      // response.headers.set(
      //   'x-middleware-rewrite',
      //   new URL(`/${locale}/`, request.url).toString()
      // )
      // return response
    }
    return response
  }

  return response
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/', '/(vi|en)/:path*']
}
