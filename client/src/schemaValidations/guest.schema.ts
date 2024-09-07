import { DishStatusValues, RoleValues } from '@/constants/type'
import { AccountSchema } from '@/schemaValidations/account.schema'
import z from 'zod'

export const GuestLoginBody = z
  .object({
    name: z.string(),
    tableNumber: z.number(),
    token: z.string()
  })
  .strict()

export type GuestLoginBodyType = z.TypeOf<typeof GuestLoginBody>

export const GuestLoginRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    guest: z.object({
      id: z.number(),
      name: z.string(),
      role: z.enum(RoleValues)
    })
  }),
  message: z.string()
})

export type GuestLoginResType = z.TypeOf<typeof GuestLoginRes>

export const GuestCreateOrdersBody = z
  .object({
    orders: z.array(
      z.object({
        dishId: z.number(),
        quantity: z.number()
      })
    )
  })
  .strict()

export type GuestCreateOrdersBodyType = z.TypeOf<typeof GuestCreateOrdersBody>
const DishSnapshotSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  image: z.string(),
  description: z.string(),
  status: z.enum(DishStatusValues),
  dishId: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const GuestCreateOrdersRes = z.object({
  message: z.string(),
  data: z.array(
    z.object({
      id: z.number(),
      guestId: z.number().nullable(),
      guest: z
        .object({
          id: z.number(),
          name: z.string()
        })
        .nullable(),
      tableNumber: z.number().nullable(),
      dishSnapshotId: z.number(),
      dishSnapshot: DishSnapshotSchema,
      quantity: z.number(),
      orderHandlerId: z.number().nullable(),
      orderHandler: AccountSchema.nullable()
    })
  )
})

export type GuestCreateOrdersResType = z.TypeOf<typeof GuestCreateOrdersRes>

export const GuestGetOrdersRes = z.object({})
