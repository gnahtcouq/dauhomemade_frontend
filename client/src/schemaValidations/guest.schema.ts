import {DishStatusValues, Role, RoleValues} from '@/constants/type'
import {AccountSchema} from '@/schemaValidations/account.schema'
import z from 'zod'

export const GuestLoginBody = z
  .object({
    name: z
      .string()
      .min(2, {
        message: 'Tên phải có ít nhất 2 ký tự'
      })
      .max(50, {
        message: 'Tên không được vượt quá 50 ký tự'
      }),
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
      role: z.enum([Role.Guest]),
      tableNumber: z.number().nullable(),
      createdAt: z.date(),
      updatedAt: z.date()
    })
  }),
  message: z.string()
})

export type GuestLoginResType = z.TypeOf<typeof GuestLoginRes>

// export const GuestCreateOrdersBody = z
//   .object({
//     orders: z.array(
//       z.object({
//         dishId: z.number(),
//         quantity: z.number()
//       })
//     )
//   })
//   .strict()

export const GuestCreateOrdersBody = z.array(
  z.object({
    dishId: z.number(),
    quantity: z.number()
  })
)

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
      orderHandler: AccountSchema.nullable(),
      status: z.enum(['Pending', 'Processing', 'Rejected', 'Delivered', 'Paid'])
    })
  )
})

export type GuestCreateOrdersResType = z.TypeOf<typeof GuestCreateOrdersRes>

export const GuestGetOrdersRes = GuestCreateOrdersRes

export type GuestGetOrdersResType = z.TypeOf<typeof GuestGetOrdersRes>
