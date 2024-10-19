'use client'

import {useAppStore} from '@/components/app-provider'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
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
import {LoaderCircle} from 'lucide-react'
import {useTranslations} from 'next-intl'
import Image from 'next/image'
import React, {useState} from 'react'
import {useEffect, useMemo} from 'react'

export default function OrderCart() {
  const t = useTranslations('ManageOrders.detail')
  const {data, refetch} = useGuestGetOrderListQuery()
  const orders = useMemo(() => data?.payload.data ?? [], [data])
  const socket = useAppStore((state) => state.socket)
  const zaloPayForGuestMutation = useZaloPayForGuestMutation()
  const [isZaloPayDisabled, setIsZaloPayDisabled] = useState(false) // State quản lý nút ZaloPay
  const [remainingTime, setRemainingTime] = useState(0) // State quản lý thời gian còn lại

  useEffect(() => {
    const savedTime = localStorage.getItem('zaloPayDisabledTime')
    if (savedTime) {
      const elapsedTime = Math.floor(
        (Date.now() - parseInt(savedTime, 10)) / 1000
      )
      if (elapsedTime < 300) {
        setRemainingTime(300 - elapsedTime)
        setIsZaloPayDisabled(true)
        const interval = setInterval(() => {
          setRemainingTime((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(interval)
              setIsZaloPayDisabled(false)
              localStorage.removeItem('zaloPayDisabledTime')
              return 0
            }
            return prevTime - 1
          })
        }, 1000)
      }
    }
  }, [])

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
      setIsZaloPayDisabled(true) // Disable the button
      setRemainingTime(300) // Set the countdown timer to 5 minutes (300 seconds)
      localStorage.setItem('zaloPayDisabledTime', Date.now().toString())
      const interval = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval)
            setIsZaloPayDisabled(false) // Re-enable the button
            localStorage.removeItem('zaloPayDisabledTime')
            return 0
          }
          return prevTime - 1
        })
      }, 1000) // Update the timer every second
    } catch (error) {
      handleErrorApi({error})
    }
  }

  return (
    <>
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          {t('haventOrderedYet')}
        </div>
      ) : (
        orders.map((order, index) => (
          <div key={order.id} className="flex gap-4">
            <div className="text-xm font-semibold">{index + 1}</div>
            <div className="flex-shrink-0">
              <Image
                src={order.dishSnapshot.image}
                alt={order.dishSnapshot.name}
                height={100}
                width={100}
                loading="lazy"
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
        ))
      )}
      <div className="sticky bottom-0 bg-white dark:bg-[hsl(var(--background))] z-20 mb-24 p-4">
        {paid.quantity !== 0 && (
          <div className="w-full flex space-x-4 justify-between text-md font-semibold">
            <span>
              {t('paid')} · {paid.quantity} {t('dish')}
            </span>
            <span className="text-green-600 dark:text-green-400">
              {formatCurrency(paid.price)}
            </span>
          </div>
        )}
        {notYetPaid.quantity !== 0 && (
          <>
            <div className="w-full flex space-x-4 justify-between text-md font-semibold">
              <span>
                {t('notYetPaid')} · {notYetPaid.quantity} {t('dish')}
              </span>
              <span className="text-red-600 dark:text-red-400">
                {formatCurrency(notYetPaid.price)}
              </span>
            </div>
            <Button
              className="w-full text-white dark:text-black bg-blue-500 py-2 mt-4 rounded-md"
              onClick={zaloPay}
              disabled={zaloPayForGuestMutation.isPending || isZaloPayDisabled}
            >
              {zaloPayForGuestMutation.isPending ? (
                <LoaderCircle className="w-5 h-5 mx-auto animate-spin" />
              ) : isZaloPayDisabled ? (
                <>{`${t('paymentWithZaloPay')} (${Math.floor(
                  remainingTime / 60
                )}:${String(remainingTime % 60).padStart(2, '0')})`}</>
              ) : (
                <>{t('paymentWithZaloPay')}</>
              )}
            </Button>
          </>
        )}
      </div>
    </>
  )
}
