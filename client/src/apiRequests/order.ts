import http from '@/lib/http'
import {
  CreateOrdersBodyType,
  CreateOrdersResType,
  GetNotificationResType,
  GetOrderDetailResType,
  GetOrdersQueryParamsType,
  GetOrdersResType,
  PayGuestOrdersBodyType,
  PayGuestOrdersResType,
  UpdateNotificationResType,
  UpdateOrderBodyType,
  UpdateOrderResType,
  ZaloPayGuestOrdersResType
} from '@/schemaValidations/order.schema'
import queryString from 'query-string'

const orderApiRequest = {
  createOrders: (body: CreateOrdersBodyType) =>
    http.post<CreateOrdersResType>('/orders', body),

  getOrderList: (queryParams: GetOrdersQueryParamsType) =>
    http.get<GetOrdersResType>(
      '/orders?' +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString()
        })
    ),

  getNotificationList: () =>
    http.get<GetNotificationResType>('/orders/notifications'),

  updateNotification: (notificationId: number) =>
    http.put<UpdateNotificationResType>(
      `/orders/notifications/${notificationId}`,
      {}
    ),

  updateMarkAllReadNotification: () =>
    http.put<{message: string}>(`/orders/notifications/mark-all-read`, {}),

  deleteNotification: () =>
    http.delete<{message: string}>(`/orders/notifications`),

  updateOrder: (orderId: number, body: UpdateOrderBodyType) =>
    http.put<UpdateOrderResType>(`/orders/${orderId}`, body),

  getOrderDetail: (orderId: number) =>
    http.get<GetOrderDetailResType>(`/orders/${orderId}`),

  pay: (body: PayGuestOrdersBodyType) =>
    http.post<PayGuestOrdersResType>(`/orders/pay`, body),

  zaloPay: (body: PayGuestOrdersBodyType) =>
    http.post<ZaloPayGuestOrdersResType>(`/orders/zalopay`, body)
}

export default orderApiRequest
