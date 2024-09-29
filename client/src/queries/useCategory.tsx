import categoryApiRequest from '@/apiRequests/category'
import {UpdateCategoryBodyType} from '@/schemaValidations/category.schema'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

export const useGetCategoryList = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryApiRequest.list
  })
}

export const useGetCategory = ({
  id,
  enabled
}: {
  id: number
  enabled: boolean
}) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoryApiRequest.getCategory(id),
    enabled
  })
}

export const useAddCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: categoryApiRequest.addCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories']
      })
    }
  })
}

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({id, ...body}: UpdateCategoryBodyType & {id: number}) =>
      categoryApiRequest.updateCategory(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
        exact: true
      })
    }
  })
}

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: categoryApiRequest.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories']
      })
    }
  })
}
