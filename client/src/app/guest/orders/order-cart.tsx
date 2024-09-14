'use client'

import {useAppContext} from '@/components/app-provider'
import {Badge} from '@/components/ui/badge'
import {toast} from '@/hooks/use-toast'
import socket from '@/lib/socket'
import {formatCurrency, getVietnameseOrderStatus} from '@/lib/utils'
import {useGuestGetOrderListQuery} from '@/queries/useGuest'
import {UpdateOrderResType} from '@/schemaValidations/order.schema'
import Image from 'next/image'
import {useEffect, useMemo} from 'react'

export default function OrderCart() {
  const {data, refetch} = useGuestGetOrderListQuery()
  const orders = useMemo(() => data?.payload.data ?? [], [data])
  const {socket} = useAppContext()

  const totalPrice = useMemo(() => {
    return orders.reduce((result, order) => {
      return result + order.dishSnapshot.price * order.quantity
    }, 0)
  }, [orders])

  const totalItems = useMemo(() => {
    return orders.reduce((total, order) => total + order.quantity, 0)
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
      console.log(data)
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

    socket?.on('update-order', onUpdateOrder)
    socket?.on('connect', onConnect)
    socket?.on('disconnect', onDisconnect)

    return () => {
      socket?.off('connect', onConnect)
      socket?.off('disconnect', onDisconnect)
      socket?.off('update-order', onUpdateOrder)
    }
  }, [refetch, socket])

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
              quality={100}
              priority={true}
              className="object-cover w-[80px] h-[80px] rounded-md"
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm">{order.dishSnapshot.name}</h3>
            <div className="text-xs font-semibold">
              {formatCurrency(order.dishSnapshot.price)} x{' '}
              <Badge className="px-1">{order.quantity}</Badge>
            </div>
          </div>
          <div className="flex-shrink-0 ml-auto flex justify-center items-center">
            <Badge variant={'outline'}>
              {getVietnameseOrderStatus(order.status)}
            </Badge>
          </div>
        </div>
      ))}
      <div className="sticky bottom-0">
        <div className="w-full flex space-x-4 justify-between text-xl font-semibold">
          <span>Tổng tiền · {totalItems} món</span>
          <span>{formatCurrency(totalPrice)}</span>
        </div>
      </div>
    </>
  )
}
