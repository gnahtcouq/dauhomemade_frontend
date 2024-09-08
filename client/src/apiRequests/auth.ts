import http from '@/lib/http'
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType
} from '@/schemaValidations/auth.schema'

const authApiRequest = {
  sLogin: (body: LoginBodyType) => http.post<LoginResType>('/auth/login', body),
  login: (body: LoginBodyType) =>
    http.post<LoginResType>('/api/auth/login', body, {
      baseUrl: ''
    }),

  sLogout: (body: LogoutBodyType & {accessToken: string}) =>
    http.post(
      'auth/logout',
      {refreshToken: body.refreshToken},
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`
        }
      }
    ),
  logout: () =>
    http.post('/api/auth/logout', null, {
      baseUrl: ''
    }) // Client gọi đến route handler, không cần truyền accessToken và refreshToken vì tự động gửi thông qua cookie rồi
}

export default authApiRequest
