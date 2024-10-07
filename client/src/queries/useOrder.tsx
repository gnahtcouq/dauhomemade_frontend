import orderApiRequest from '@/apiRequests/order'
import {
  GetOrdersQueryParamsType,
  PayGuestOrdersBodyType,
  UpdateOrderBodyType
} from '@/schemaValidations/order.schema'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

export const useUpdateOrderMutation = () => {
  return useMutation({
    mutationFn: ({
      orderId,
      ...body
    }: UpdateOrderBodyType & {
      orderId: number
    }) => orderApiRequest.updateOrder(orderId, body)
  })
}

export const useGetOrderListQuery = (queryParams: GetOrdersQueryParamsType) => {
  return useQuery({
    queryFn: () => orderApiRequest.getOrderList(queryParams),
    queryKey: ['orders', queryParams]
  })
}

export const useGetNotificationList = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: orderApiRequest.getNotificationList
  })
}

export const useUpdateNotificationMutation = () => {
  return useMutation({
    mutationFn: (notificationId: number) =>
      orderApiRequest.updateNotification(notificationId)
  })
}

export const useUpdateMarkAllReadNotificationMutation = () => {
  return useMutation({
    mutationFn: () => orderApiRequest.updateMarkAllReadNotification()
  })
}

export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: orderApiRequest.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications']
      })
    }
  })
}

export const useGetOrderDetailQuery = ({
  id,
  enabled
}: {
  id: number
  enabled: boolean
}) => {
  return useQuery({
    queryFn: () => orderApiRequest.getOrderDetail(id),
    queryKey: ['orders', id],
    enabled
  })
}

export const usePayForGuestMutation = () => {
  return useMutation({
    mutationFn: (body: PayGuestOrdersBodyType) => orderApiRequest.pay(body)
  })
}

export const useZaloPayForGuestMutation = () => {
  return useMutation({
    mutationFn: (body: PayGuestOrdersBodyType) => orderApiRequest.zaloPay(body)
  })
}

export const useCreateOrderMutation = () => {
  return useMutation({
    mutationFn: orderApiRequest.createOrders
  })
}
