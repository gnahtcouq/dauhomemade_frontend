'use client'

import React, {useMemo, useState} from 'react'
import {useTranslations} from 'next-intl'
import {useRouter} from '@/navigation'
import {useGetDishListQuery} from '@/queries/useDish'
import {useGuestOrderMutation} from '@/queries/useGuest'
import {DishStatus} from '@/constants/type'
import {cn, formatCurrency, handleErrorApi} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import Quantity from '@/app/[locale]/guest/menu/quantity'
import Image from 'next/image'
import {ChevronLeft, LoaderCircle} from 'lucide-react'
import {GuestCreateOrdersBodyType} from '@/schemaValidations/guest.schema'

export default function MenuOrder() {
  const t = useTranslations('ManageOrders.dialogAdd')
  const {data} = useGetDishListQuery()
  const dishes = useMemo(() => data?.payload.data ?? [], [data])
  // Lọc danh sách món ăn để chỉ bao gồm các món ăn không có trạng thái Hidden
  const visibleDishes = useMemo(() => {
    return dishes.filter((dish) => dish.status !== DishStatus.Hidden)
  }, [dishes])
  // Tạo danh sách danh mục từ các món ăn không có trạng thái Hidden
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      visibleDishes.map((dish) => dish.category.name)
    )
    return Array.from(uniqueCategories)
  }, [visibleDishes])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([])
  const {mutateAsync} = useGuestOrderMutation()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

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
    setIsLoading(true)
    try {
      await mutateAsync(orders)
      router.push('/guest/orders')
    } catch (error) {
      handleErrorApi({error})
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {!selectedCategory ? (
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <Button
              key={category}
              className="w-full capitalize"
              variant="outline"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      ) : (
        <>
          <Button variant="ghost" onClick={() => setSelectedCategory(null)}>
            <ChevronLeft />
          </Button>
          {dishes
            .filter(
              (dish) =>
                dish.category.name === selectedCategory &&
                dish.status !== DishStatus.Hidden
            )
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
                        {t('outOfStock')}
                      </span>
                    )}
                  </span>
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    height={100}
                    width={100}
                    priority={true}
                    className={`object-cover w-[80px] h-[80px] rounded-md ${
                      dish.status === DishStatus.Unavailable
                        ? 'filter-blur opacity-50'
                        : ''
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">{dish.name}</h3>
                  <p className="text-xs text-justify">{dish.description}</p>
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(dish.price)}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-auto flex justify-center items-center">
                  <Quantity
                    onChange={(value) => handleQuantityChange(dish.id, value)}
                    value={
                      orders.find((order) => order.dishId === dish.id)
                        ?.quantity ?? 0
                    }
                  />
                </div>
              </div>
            ))}
          <div className="sticky bottom-0 bg-white dark:bg-[hsl(var(--background))]">
            <Button
              className="w-full justify-between"
              onClick={handleOrder}
              disabled={totalItems === 0 || isLoading}
            >
              {isLoading ? (
                <LoaderCircle className="w-5 h-5 mx-auto animate-spin" />
              ) : (
                <>
                  <span>
                    {t('order')} · {totalItems} {t('dish')}
                  </span>
                  <span className="text-red-600 dark:text-red-600">
                    {formatCurrency(totalPrice)}
                  </span>
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </>
  )
}
