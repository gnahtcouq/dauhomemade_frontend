import {DishStatusValues} from '@/constants/type'
import {CategorySchema} from '@/schemaValidations/category.schema'
import z from 'zod'

export const CreateDishBody = z.object({
  name: z
    .string()
    .min(1, {message: 'required'})
    .max(256, {message: 'maxLength'}),
  price: z.coerce.number().positive({
    message: 'price'
  }),
  description: z
    .string()
    .min(1, {message: 'description.minLength'})
    .max(10000, {
      message: 'description.maxLength'
    }),
  image: z.string().url(),
  status: z.enum(DishStatusValues).optional(),
  categoryId: z.number()
})

export type CreateDishBodyType = z.TypeOf<typeof CreateDishBody>

export const DishSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.coerce.number(),
  description: z.string(),
  image: z.string(),
  status: z.enum(DishStatusValues),
  category: CategorySchema.optional(),
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
