import http from '@/lib/http'
import {
  GetOrdersResType,
  UpdateOrderBodyType,
  UpdateOrderResType
} from '@/schemaValidations/order.schema'

const orderApiRequest = {
  getOrderList: () => http.get<GetOrdersResType>('/orders'),

  updateOrder: (orderId: number, body: UpdateOrderBodyType) =>
    http.put<UpdateOrderResType>(`/orders/${orderId}`, body)
}

export default orderApiRequest
