import guestApiRequest from '@/apiRequests/guest'
import {jwtDecode} from 'jwt-decode'
import {cookies} from 'next/headers'

export async function POST() {
  const cookieStore = cookies()
  const refreshToken = cookieStore.get('refreshToken')?.value
  if (!refreshToken) {
    return Response.json(
      {
        message: 'Không tìm thấy refreshToken'
      },
      {status: 401}
    )
  }
  try {
    const {payload} = await guestApiRequest.sRefreshToken({
      refreshToken
    })
    const decodedAccessToken = jwtDecode(payload.data.accessToken) as {
      exp: number
    }
    const decodedRefreshToken = jwtDecode(payload.data.refreshToken) as {
      exp: number
    }
    cookieStore.set('accessToken', payload.data.accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedAccessToken.exp * 1000
    })
    cookieStore.set('refreshToken', payload.data.refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedRefreshToken.exp * 1000
    })
    return Response.json(payload)
  } catch (error: any) {
    console.log(error)
    return Response.json(
      {message: error.message ?? 'Có lỗi xảy ra'},
      {status: 401}
    )
  }
}
