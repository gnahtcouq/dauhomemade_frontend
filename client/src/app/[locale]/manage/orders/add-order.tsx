'use client'
import Quantity from '@/app/[locale]/guest/menu/quantity'
import GuestsDialog from '@/app/[locale]/manage/orders/guests-dialog'
import {TablesDialog} from '@/app/[locale]/manage/orders/tables-dialog'
import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {Form, FormField, FormItem, FormMessage} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Switch} from '@/components/ui/switch'
import {DishStatus} from '@/constants/type'
import {toast} from '@/hooks/use-toast'
import {cn, formatCurrency, handleErrorApi} from '@/lib/utils'
import {useCreateGuestMutation} from '@/queries/useAccount'
import {useGetDishListQuery} from '@/queries/useDish'
import {useCreateOrderMutation} from '@/queries/useOrder'
import {GetListGuestsResType} from '@/schemaValidations/account.schema'
import {
  GuestLoginBody,
  GuestLoginBodyType
} from '@/schemaValidations/guest.schema'
import {CreateOrdersBodyType} from '@/schemaValidations/order.schema'
import {zodResolver} from '@hookform/resolvers/zod'
import {ChevronLeft, LoaderCircle, PlusCircle} from 'lucide-react'
import {useTranslations} from 'next-intl'
import Image from 'next/image'
import React from 'react'
import {useMemo, useState} from 'react'
import {useForm} from 'react-hook-form'

export default function AddOrder() {
  const t = useTranslations('ManageOrders.dialogAdd')
  const [open, setOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<
    GetListGuestsResType['data'][0] | null
  >(null)
  const [isNewGuest, setIsNewGuest] = useState(true)
  const [orders, setOrders] = useState<CreateOrdersBodyType['orders']>([])
  const {data} = useGetDishListQuery()
  const dishes = useMemo(() => data?.payload.data ?? [], [data])
  const categories = useMemo(() => {
    const uniqueCategories = new Set(dishes.map((dish) => dish.category.name))
    return Array.from(uniqueCategories)
  }, [dishes])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const totalPrice = useMemo(() => {
    return dishes.reduce((result, dish) => {
      const order = orders.find((order) => order.dishId === dish.id)
      if (!order) return result
      return result + order.quantity * dish.price
    }, 0)
  }, [dishes, orders])

  const totalItems = useMemo(() => {
    return orders.reduce((total, order) => total + order.quantity, 0)
  }, [orders])

  const createOrderMutation = useCreateOrderMutation()
  const createGuestMutation = useCreateGuestMutation()

  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: '',
      tableNumber: 0
    }
  })
  const name = form.watch('name')
  const tableNumber = form.watch('tableNumber')

  const handleQuantityChange = (dishId: number, quantity: number) => {
    setOrders((prevOrders) => {
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dishId !== dishId)
      }
      const index = prevOrders.findIndex((order) => order.dishId === dishId)
      if (index === -1) {
        return [...prevOrders, {dishId, quantity}]
      }
      const newOrders = [...prevOrders]
      newOrders[index] = {...newOrders[index], quantity}
      return newOrders
    })
  }

  const handleOrder = async () => {
    try {
      let guestId = selectedGuest?.id
      if (isNewGuest) {
        const guestRes = await createGuestMutation.mutateAsync({
          name,
          tableNumber
        })
        guestId = guestRes.payload.data.id
      }
      if (!guestId) {
        toast({
          description: 'Hãy chọn một khách hàng',
          variant: 'destructive'
        })
        return
      }
      await createOrderMutation.mutateAsync({
        guestId,
        orders
      })
      reset()
    } catch (error) {
      handleErrorApi({error, setError: form.setError})
    }
  }

  const reset = () => {
    form.reset()
    setOrders([])
    setSelectedGuest(null)
    setIsNewGuest(true)
    setOpen(false)
    setSelectedCategory(null)
  }

  return (
    <Dialog
      onOpenChange={(value) => {
        if (!value) reset()
        setOpen(value)
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            {t('title')}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 items-center justify-items-start gap-4">
          <Label htmlFor="isNewGuest">{t('newGuest')}</Label>
          <div className="col-span-3 flex items-center">
            <Switch
              id="isNewGuest"
              checked={isNewGuest}
              onCheckedChange={setIsNewGuest}
            />
          </div>
        </div>
        {isNewGuest && (
          <Form {...form}>
            <form
              noValidate
              className="grid auto-rows-max items-start gap-4 md:gap-8"
              id="add-employee-form"
            >
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({field}) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="name">{t('name')}</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Input id="name" className="w-full" {...field} />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tableNumber"
                  render={({field}) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="tableNumber">{t('chooseTable')}</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <div className="flex items-center gap-4">
                            <div>{field.value}</div>
                            <TablesDialog
                              onChoose={(table) => {
                                field.onChange(table.number)
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        )}
        {!isNewGuest && (
          <GuestsDialog
            onChoose={(guest) => {
              setSelectedGuest(guest)
            }}
          />
        )}
        {!isNewGuest && selectedGuest && (
          <div className="grid grid-cols-4 items-center justify-items-start gap-4">
            <Label htmlFor="selectedGuest">{t('selectedGuest')}</Label>
            <div className="col-span-3 w-full gap-4 flex items-center">
              <div>
                {selectedGuest.name} (#{selectedGuest.id})
              </div>
              <div>
                {t('tableNumber')}: {selectedGuest.tableNumber}
              </div>
            </div>
          </div>
        )}
        {!selectedCategory ? (
          <>
            <Label htmlFor="selectedMenu">Menu</Label>
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
          </>
        ) : (
          <>
            <Label htmlFor="selectedMenu">Menu</Label>
            <div className="flex justify-start mb-4">
              <Button variant="ghost" onClick={() => setSelectedCategory(null)}>
                <ChevronLeft />
              </Button>
            </div>
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
                    'pointer-events-none':
                      dish.status === DishStatus.Unavailable
                  })}
                >
                  <div className="flex-shrink-0">
                    {dish.status === DishStatus.Unavailable && (
                      <span className="bg-red-600 text-white text-xs px-1 rounded-md font-bold">
                        {t('outOfStock')}
                      </span>
                    )}
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      height={100}
                      width={100}
                      quality={75}
                      className={`object-cover w-[80px] h-[80px] rounded-md ${
                        dish.status === DishStatus.Unavailable
                          ? 'filter-blur opacity-50'
                          : ''
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm">{dish.name}</h3>
                    {/* <p className="text-xs">{dish.description}</p> */}
                    <p className="font-semibold text-red-600 dark:text-red-400">
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
          </>
        )}
        <div className="sticky bottom-0 bg-white dark:bg-[hsl(var(--background))]">
          <Button
            className="w-full justify-between"
            onClick={handleOrder}
            disabled={totalItems === 0 || createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? (
              <LoaderCircle className="w-5 h-5 mx-auto animate-spin" />
            ) : (
              <>
                <span>
                  {t('order')} · {totalItems} {t('dish')}
                </span>
                <span className="text-red-600 dark:text-red-400">
                  {formatCurrency(totalPrice)}
                </span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
