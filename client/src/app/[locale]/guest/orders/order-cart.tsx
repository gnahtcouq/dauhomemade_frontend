'use client'

import {useAppStore} from '@/components/app-provider'
import {Badge} from '@/components/ui/badge'
import {OrderStatus} from '@/constants/type'
import {toast} from '@/hooks/use-toast'
import {
  formatCurrency,
  getVietnameseOrderStatus,
  handleErrorApi
} from '@/lib/utils'
import {useGuestGetOrderListQuery} from '@/queries/useGuest'
import {useZaloPayForGuestMutation} from '@/queries/useOrder'
import {
  PayGuestOrdersResType,
  UpdateOrderResType
} from '@/schemaValidations/order.schema'
import Image from 'next/image'
import {useEffect, useMemo} from 'react'

export default function OrderCart() {
  const {data, refetch} = useGuestGetOrderListQuery()
  const orders = useMemo(() => data?.payload.data ?? [], [data])
  const socket = useAppStore((state) => state.socket)
  const zaloPayForGuestMutation = useZaloPayForGuestMutation()

  const {notYetPaid, paid} = useMemo(() => {
    return orders.reduce(
      (result, order) => {
        if (
          order.status === OrderStatus.Delivered ||
          order.status === OrderStatus.Processing ||
          order.status === OrderStatus.Pending
        ) {
          return {
            ...result,
            notYetPaid: {
              price:
                result.notYetPaid.price +
                order.dishSnapshot.price * order.quantity,
              quantity: result.notYetPaid.quantity + order.quantity
            }
          }
        }
        if (order.status === OrderStatus.Paid) {
          return {
            ...result,
            paid: {
              price:
                result.paid.price + order.dishSnapshot.price * order.quantity,
              quantity: result.paid.quantity + order.quantity
            }
          }
        }
        return result
      },
      {
        notYetPaid: {
          price: 0,
          quantity: 0
        },
        paid: {
          price: 0,
          quantity: 0
        }
      }
    )
  }, [orders])

  useEffect(() => {
    if (socket?.connected) {
      onConnect()
    }

    function onConnect() {
      console.log(socket?.id)
    }

    function onDisconnect() {
      console.log('disconnected')
    }

    function onUpdateOrder(data: UpdateOrderResType['data']) {
      const {
        dishSnapshot: {name},
        quantity
      } = data
      toast({
        description: `Món ${name} (x${quantity}) của bạn đã được cập nhật trạng thái "${getVietnameseOrderStatus(
          data.status
        )}"`
      })
      refetch()
    }

    function onPayment(data: PayGuestOrdersResType['data']) {
      toast({
        description: `Bạn đã thanh toán thành công ${data.length} đơn`
      })
      refetch()
    }

    socket?.on('update-order', onUpdateOrder)
    socket?.on('connect', onConnect)
    socket?.on('disconnect', onDisconnect)
    socket?.on('payment', onPayment)

    return () => {
      socket?.off('connect', onConnect)
      socket?.off('disconnect', onDisconnect)
      socket?.off('update-order', onUpdateOrder)
      socket?.off('payment', onPayment)
    }
  }, [refetch, socket])

  const zaloPay = async () => {
    if (zaloPayForGuestMutation.isPending) return
    try {
      const result = await zaloPayForGuestMutation.mutateAsync({
        guestId: orders[0].guestId!
      })
      const paymentUrl = result?.payload?.data?.paymentUrl

      if (paymentUrl) window.open(paymentUrl, '_blank')
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (isMobile) window.location.href = paymentUrl
    } catch (error) {
      handleErrorApi({error})
    }
  }

  return (
    <>
      {orders.map((order, index) => (
        <div key={order.id} className="flex gap-4">
          <div className="text-xm font-semibold">{index + 1}</div>
          <div className="flex-shrink-0">
            <Image
              src={order.dishSnapshot.image}
              alt={order.dishSnapshot.name}
              height={100}
              width={100}
              quality={75}
              priority={true}
              className="object-cover w-[80px] h-[80px] rounded-md"
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm">{order.dishSnapshot.name}</h3>
            <div className="text-xs text-red-600 dark:text-red-400 font-semibold">
              {formatCurrency(order.dishSnapshot.price)} x{' '}
              <Badge className="px-1" variant={'secondary'}>
                {order.quantity}
              </Badge>
            </div>
          </div>
          <div className="flex-shrink-0 ml-auto flex justify-center items-center">
            <Badge variant={'outline'}>
              {getVietnameseOrderStatus(order.status)}
            </Badge>
          </div>
        </div>
      ))}
      <div className="sticky bottom-0 bg-white dark:bg-gray-800 z-20 mb-24 p-4">
        {paid.quantity !== 0 && (
          <div className="w-full flex space-x-4 justify-between text-md font-semibold">
            <span>Đã thanh toán · {paid.quantity} món</span>
            <span className="text-green-600 dark:text-green-400">
              {formatCurrency(paid.price)}
            </span>
          </div>
        )}
        {notYetPaid.quantity !== 0 && (
          <>
            <div className="w-full flex space-x-4 justify-between text-md font-semibold">
              <span>Chưa thanh toán · {notYetPaid.quantity} món</span>
              <span className="text-red-600 dark:text-red-400">
                {formatCurrency(notYetPaid.price)}
              </span>
            </div>
            <button
              className="w-full bg-blue-600 text-white py-2 mt-4 rounded-md"
              onClick={zaloPay}
            >
              Thanh toán qua ZaloPay
            </button>
          </>
        )}
      </div>
    </>
  )
}
