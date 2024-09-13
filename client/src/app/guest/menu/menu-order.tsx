'use client'

import Quantity from '@/app/guest/menu/quantity'
import {Button} from '@/components/ui/button'
import {DishStatus} from '@/constants/type'
import {cn, formatCurrency, handleErrorApi} from '@/lib/utils'
import {useGetDishListQuery} from '@/queries/useDish'
import {useGuestOrderMutation} from '@/queries/useGuest'
import {GuestCreateOrdersBodyType} from '@/schemaValidations/guest.schema'
import Image from 'next/image'
import {useRouter} from 'next/navigation'
import {useMemo, useState} from 'react'

export default function MenuOrder() {
  const {data} = useGetDishListQuery()
  const dishes = useMemo(() => data?.payload.data ?? [], [data])
  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([])
  const {mutateAsync} = useGuestOrderMutation()
  const router = useRouter()

  const totalPrice = useMemo(() => {
    return dishes.reduce((result, dish) => {
      const order = orders.find((order) => order.dishId === dish.id)
      if (!order) {
        return result
      }
      return result + dish.price * order.quantity
    }, 0)
  }, [dishes, orders])

  const totalItems = useMemo(() => {
    return orders.reduce((total, order) => total + order.quantity, 0)
  }, [orders])

  const handleQuantityChange = (dishId: number, quantity: number) => {
    setOrders((prev) => {
      if (quantity === 0) {
        return prev.filter((order) => order.dishId !== dishId)
      }
      const index = prev.findIndex((order) => order.dishId === dishId)
      if (index === -1) {
        return [...prev, {dishId, quantity}]
      }
      const newOrders = [...prev]
      newOrders[index] = {...newOrders[index], quantity}
      return newOrders
    })
  }

  const handleOrder = async () => {
    try {
      await mutateAsync(orders)
      router.push('/guest/orders')
    } catch (error) {
      handleErrorApi({
        error
      })
    }
  }

  return (
    <>
      {dishes
        .filter((dish) => dish.status !== DishStatus.Hidden)
        .map((dish) => (
          <div
            key={dish.id}
            className={cn('flex gap-4', {
              'pointer-events-none': dish.status === DishStatus.Unavailable
            })}
          >
            <div className="flex-shrink-0">
              <span>
                {dish.status === DishStatus.Unavailable && (
                  <span className="bg-red-600 text-white text-xs px-1 rounded-md font-bold">
                    Tạm hết
                  </span>
                )}
              </span>
              <Image
                src={dish.image}
                alt={dish.name}
                height={100}
                width={100}
                quality={100}
                className={`object-cover w-[80px] h-[80px] rounded-md ${
                  dish.status === DishStatus.Unavailable
                    ? 'filter-blur opacity-50'
                    : ''
                }`}
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm">{dish.name}</h3>
              <p className="text-xs text-justify">{dish.description}</p>
              <p className="text-xs font-semibold">
                {formatCurrency(dish.price)}
              </p>
            </div>
            <div className="flex-shrink-0 ml-auto flex justify-center items-center">
              <Quantity
                onChange={(value) => handleQuantityChange(dish.id, value)}
                value={
                  orders.find((order) => order.dishId === dish.id)?.quantity ??
                  0
                }
              />
            </div>
          </div>
        ))}
      <div className="sticky bottom-0">
        <Button
          className="w-full justify-between"
          onClick={handleOrder}
          disabled={totalItems === 0}
        >
          <span>Đặt hàng · {totalItems} món</span>
          <span>{formatCurrency(totalPrice)}</span>
        </Button>
      </div>
    </>
  )
}
