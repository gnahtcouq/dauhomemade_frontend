import {DishStatusValues} from '@/constants/type'
import z from 'zod'

export const CreateDishBody = z.object({
  name: z
    .string()
    .min(1, {message: 'Tên món ăn không được để trống'})
    .max(256, {message: 'Tên món ăn không được vượt quá 256 ký tự'}),
  price: z.coerce.number().positive({
    message: 'Giá tiền phải lớn hơn 0'
  }),
  description: z.string().max(10000, {
    message: 'Mô tả không được vượt quá 10000 ký tự'
  }),
  image: z.string().url(),
  status: z.enum(DishStatusValues).optional()
})

export type CreateDishBodyType = z.TypeOf<typeof CreateDishBody>

export const DishSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.coerce.number(),
  description: z.string(),
  image: z.string(),
  status: z.enum(DishStatusValues),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const DishRes = z.object({
  data: DishSchema,
  message: z.string()
})

export type DishResType = z.TypeOf<typeof DishRes>

export const DishListRes = z.object({
  data: z.array(DishSchema),
  message: z.string()
})

export type DishListResType = z.TypeOf<typeof DishListRes>

export const UpdateDishBody = CreateDishBody
export type UpdateDishBodyType = CreateDishBodyType
export const DishParams = z.object({
  id: z.coerce.number()
})
export type DishParamsType = z.TypeOf<typeof DishParams>
