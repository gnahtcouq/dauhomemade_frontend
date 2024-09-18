import {Role} from '@/constants/type'
import z from 'zod'

export const LoginBody = z
  .object({
    email: z.string().email({
      message: 'Địa chỉ email không hợp lệ'
    }),
    password: z
      .string()
      .min(6, {
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      })
      .max(100, {
        message: 'Mật khẩu không được vượt quá 100 ký tự'
      })
  })
  .strict()

export type LoginBodyType = z.TypeOf<typeof LoginBody>

export const LoginRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    account: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
      role: z.enum([Role.Owner, Role.Employee])
    })
  }),
  message: z.string()
})

export type LoginResType = z.TypeOf<typeof LoginRes>

export const RefreshTokenBody = z
  .object({
    refreshToken: z.string()
  })
  .strict()

export type RefreshTokenBodyType = z.TypeOf<typeof RefreshTokenBody>

export const RefreshTokenRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string()
  }),
  message: z.string()
})

export type RefreshTokenResType = z.TypeOf<typeof RefreshTokenRes>

export const LogoutBody = z
  .object({
    refreshToken: z.string()
  })
  .strict()

export type LogoutBodyType = z.TypeOf<typeof LogoutBody>
