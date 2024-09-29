import z from 'zod'

export const DishSchema = z.lazy(() => DishSchemaDefinition)
const DishSchemaDefinition = z.object({
  id: z.number(),
  name: z.string()
})
// Schema cho tạo mới Category
export const CreateCategoryBody = z.object({
  name: z
    .string()
    .min(1, {message: 'required'})
    .max(256, {message: 'maxLength'})
})

export type CreateCategoryBodyType = z.TypeOf<typeof CreateCategoryBody>

// Schema cho Category object
export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  dishes: z.array(DishSchema).optional()
})

// Schema cho response chứa Category
export const CategoryRes = z.object({
  data: CategorySchema,
  message: z.string()
})

export type CategoryResType = z.TypeOf<typeof CategoryRes>

// Schema cho danh sách Category
export const CategoryListRes = z.object({
  data: z.array(CategorySchema),
  message: z.string()
})

export type CategoryListResType = z.TypeOf<typeof CategoryListRes>

// Schema cho cập nhật Category (giống với tạo mới)
export const UpdateCategoryBody = CreateCategoryBody
export type UpdateCategoryBodyType = CreateCategoryBodyType

// Schema cho tham số khi lấy Category theo id
export const CategoryParams = z.object({
  id: z.coerce.number()
})

export type CategoryParamsType = z.TypeOf<typeof CategoryParams>
