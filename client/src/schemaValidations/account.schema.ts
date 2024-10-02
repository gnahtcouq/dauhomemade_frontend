import {Role, RoleValues} from '@/constants/type'
import z from 'zod'

export const AccountSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.enum([Role.Owner, Role.Employee]),
  avatar: z.string().nullable()
})

export type AccountType = z.TypeOf<typeof AccountSchema>

export const AccountListRes = z.object({
  data: z.array(AccountSchema),
  message: z.string()
})

export type AccountListResType = z.TypeOf<typeof AccountListRes>

export const AccountRes = z
  .object({
    data: AccountSchema,
    message: z.string()
  })
  .strict()

export type AccountResType = z.TypeOf<typeof AccountRes>

export const CreateEmployeeAccountBody = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, {message: 'name.minLength'})
      .max(50, {message: 'name.maxLength'}),
    email: z.string().email({message: 'invalidEmail'}),
    avatar: z.string().url().optional(),
    password: z
      .string()
      .min(6, {message: 'password.minLength'})
      .max(100, {message: 'password.maxLength'}),
    confirmPassword: z.string()
  })
  .strict()
  .superRefine(({confirmPassword, password}, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'password.notMatch',
        path: ['confirmPassword']
      })
    }
  })

export type CreateEmployeeAccountBodyType = z.TypeOf<
  typeof CreateEmployeeAccountBody
>

export const UpdateEmployeeAccountBody = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, {message: 'name.minLength'})
      .max(50, {message: 'name.maxLength'}),
    email: z.string().email({message: 'invalidEmail'}),
    avatar: z.string().url().optional(),
    changePassword: z.boolean().optional(),
    password: z
      .string()
      .min(6, {message: 'password.minLength'})
      .max(100, {message: 'password.maxLength'})
      .optional(),
    confirmPassword: z.string().optional(),
    role: z.enum([Role.Owner, Role.Employee]).optional().default(Role.Employee)
  })
  .strict()
  .superRefine(({confirmPassword, password, changePassword}, ctx) => {
    if (changePassword) {
      if (!password || !confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'password.description',
          path: ['changePassword']
        })
      } else if (confirmPassword !== password) {
        ctx.addIssue({
          code: 'custom',
          message: 'password.notMatch',
          path: ['confirmPassword']
        })
      }
    }
  })

export type UpdateEmployeeAccountBodyType = z.TypeOf<
  typeof UpdateEmployeeAccountBody
>

export const UpdateMeBody = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, {message: 'name.minLength'})
      .max(50, {message: 'name.maxLength'}),
    avatar: z.string().url().optional()
  })
  .strict()

export type UpdateMeBodyType = z.TypeOf<typeof UpdateMeBody>

export const ChangePasswordBody = z
  .object({
    oldPassword: z.string().min(1, {message: 'required'}),
    password: z
      .string()
      .min(6, {message: 'password.minLength'})
      .max(100, {message: 'password.maxLength'}),
    confirmPassword: z.string().min(1, {message: 'required'})
  })
  .strict()
  .superRefine(({confirmPassword, password}, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'password.notMatch',
        path: ['confirmPassword']
      })
    }
  })

export type ChangePasswordBodyType = z.TypeOf<typeof ChangePasswordBody>

export const AccountIdParam = z.object({
  id: z.coerce.number()
})

export type AccountIdParamType = z.TypeOf<typeof AccountIdParam>

export const GetListGuestsRes = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      tableNumber: z.number().nullable(),
      createdAt: z.date(),
      updatedAt: z.date()
    })
  ),
  message: z.string()
})

export type GetListGuestsResType = z.TypeOf<typeof GetListGuestsRes>

export const GetGuestListQueryParams = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional()
})

export type GetGuestListQueryParamsType = z.TypeOf<
  typeof GetGuestListQueryParams
>

export const CreateGuestBody = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, {message: 'name.minLength'})
      .max(50, {message: 'name.maxLength'}),
    tableNumber: z.number()
  })
  .strict()

export type CreateGuestBodyType = z.TypeOf<typeof CreateGuestBody>

export const CreateGuestRes = z.object({
  message: z.string(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    role: z.enum(RoleValues),
    tableNumber: z.number().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
})

export type CreateGuestResType = z.TypeOf<typeof CreateGuestRes>
