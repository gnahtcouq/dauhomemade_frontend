'use client'
import {DishesDialog} from '@/app/[locale]/manage/orders/dishes-dialog'
import {useAppStore} from '@/components/app-provider'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {OrderStatus, OrderStatusValues, Role} from '@/constants/type'
import {toast} from '@/hooks/use-toast'
import {getVietnameseOrderStatus, handleErrorApi} from '@/lib/utils'
import {
  useGetOrderDetailQuery,
  useUpdateOrderMutation
} from '@/queries/useOrder'
import {DishListResType} from '@/schemaValidations/dish.schema'
import {
  UpdateOrderBody,
  UpdateOrderBodyType
} from '@/schemaValidations/order.schema'
import {zodResolver} from '@hookform/resolvers/zod'
import {useTranslations} from 'next-intl'
import {useEffect, useState} from 'react'
import {useForm} from 'react-hook-form'

export default function EditOrder({
  id,
  setId,
  onSubmitSuccess
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}) {
  const t = useTranslations('ManageOrders.dialogEdit')
  const [selectedDish, setSelectedDish] = useState<
    DishListResType['data'][0] | null
  >(null)
  const updateOrderMutation = useUpdateOrderMutation()
  const role = useAppStore((state) => state.role)
  const {data} = useGetOrderDetailQuery({id: id!, enabled: Boolean(id)})
  const form = useForm<UpdateOrderBodyType>({
    resolver: zodResolver(UpdateOrderBody),
    defaultValues: {
      status: OrderStatus.Pending,
      dishId: 0,
      quantity: 1
    }
  })

  useEffect(() => {
    if (data) {
      const {
        status,
        dishSnapshot: {dishId},
        quantity
      } = data.payload.data
      form.reset({status, dishId: dishId ?? 0, quantity})
      setSelectedDish(data.payload.data.dishSnapshot)
    }
  }, [data, form])

  const onSubmit = async (values: UpdateOrderBodyType) => {
    if (updateOrderMutation.isPending) return
    try {
      let body: UpdateOrderBodyType & {orderId: number} = {
        orderId: id as number,
        ...values
      }
      const result = await updateOrderMutation.mutateAsync(body)
      toast({
        description: result.payload.message
      })
      reset()
      onSubmitSuccess && onSubmitSuccess()
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  const reset = () => {
    setId(undefined)
  }

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-order-form"
            onSubmit={form.handleSubmit(onSubmit, (e) => {
              console.log(e)
            })}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="dishId"
                render={({field}) => (
                  <FormItem className="grid grid-cols-4 items-center justify-items-start gap-4">
                    <FormLabel>{t('dish')}</FormLabel>
                    <div className="flex items-center col-span-2 space-x-4">
                      {/* <Avatar className="aspect-square w-[50px] h-[50px] rounded-md object-cover">
                        <AvatarImage src={selectedDish?.image} />
                        <AvatarFallback className="rounded-none">
                          {selectedDish?.name}
                        </AvatarFallback>
                      </Avatar> */}
                      <div>{selectedDish?.name}</div>
                    </div>

                    <DishesDialog
                      onChoose={(dish) => {
                        field.onChange(dish.id)
                        setSelectedDish(dish)
                      }}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({field}) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="quantity">{t('quantity')}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="quantity"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-16 text-center"
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            let value = e.target.value
                            const numberValue = Number(value)
                            if (isNaN(numberValue)) {
                              return
                            }
                            field.onChange(numberValue)
                          }}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({field}) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <FormLabel>{t('status')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={role !== Role.Owner}
                      >
                        <FormControl className="col-span-3">
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder={t('status')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {OrderStatusValues.map((status) => (
                            <SelectItem key={status} value={status}>
                              {getVietnameseOrderStatus(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="edit-order-form">
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
