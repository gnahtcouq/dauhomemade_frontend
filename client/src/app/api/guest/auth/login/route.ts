import guestApiRequest from '@/apiRequests/guest'
import {HttpError} from '@/lib/http'
import {GuestLoginBodyType} from '@/schemaValidations/guest.schema'
import {jwtDecode} from 'jwt-decode'
import {cookies} from 'next/headers'

export async function POST(request: Request) {
  const body = (await request.json()) as GuestLoginBodyType
  const cookieStore = cookies()
  try {
    const {payload} = await guestApiRequest.sLogin(body)
    const {accessToken, refreshToken} = payload.data
    const decodedAccessToken = jwtDecode(accessToken) as {exp: number}
    const decodedRefreshToken = jwtDecode(refreshToken) as {exp: number}
    cookieStore.set('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedAccessToken.exp * 1000
    })
    cookieStore.set('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedRefreshToken.exp * 1000
    })
    return Response.json(payload)
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, {status: error.status})
    } else {
      return Response.json({message: 'Có lỗi xảy ra'}, {status: 500})
    }
  }
}
