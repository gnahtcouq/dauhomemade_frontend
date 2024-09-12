import guestApiRequest from '@/apiRequests/guest'
import {cookies} from 'next/headers'

export async function POST() {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value

  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')

  if (!accessToken || !refreshToken) {
    return Response.json(
      {message: 'Không tìm thấy access token hoặc refresh token'},
      {status: 200}
    )
  }

  try {
    const result = await guestApiRequest.sLogout({accessToken, refreshToken})
    return Response.json(result.payload)
  } catch (error) {
    console.log(error)
    return Response.json({message: 'Có lỗi xảy ra'}, {status: 200})
  }
}
