import http from '@/lib/http'
import {
  CategoryListResType,
  CategoryResType,
  CreateCategoryBodyType,
  UpdateCategoryBodyType
} from '@/schemaValidations/category.schema'

const prefix = '/categories'
const categoryApiRequest = {
  list: () => http.get<CategoryListResType>(prefix),
  addCategory: (body: CreateCategoryBodyType) =>
    http.post<CategoryResType>(prefix, body),
  updateCategory: (id: number, body: UpdateCategoryBodyType) =>
    http.put<CategoryResType>(`${prefix}/${id}`, body),
  getCategory: (id: number) => http.get<CategoryResType>(`${prefix}/${id}`),
  deleteCategory: (id: number) =>
    http.delete<CategoryResType>(`${prefix}/${id}`)
}

export default categoryApiRequest
