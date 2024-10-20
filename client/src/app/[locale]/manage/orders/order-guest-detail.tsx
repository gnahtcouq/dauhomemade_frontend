import {useAppStore} from '@/components/app-provider'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {OrderStatus, Role} from '@/constants/type'
import {
  OrderStatusIcon,
  formatCurrency,
  formatDateTimeToLocaleString,
  formatDateTimeToTimeString,
  getVietnameseOrderStatus,
  handleErrorApi
} from '@/lib/utils'
import {
  usePayForGuestMutation,
  useZaloPayForGuestMutation
} from '@/queries/useOrder'
import {
  GetOrdersResType,
  PayGuestOrdersResType,
  ZaloPayGuestOrdersResType
} from '@/schemaValidations/order.schema'
import {LoaderCircle} from 'lucide-react'
import {useTranslations} from 'next-intl'
import Image from 'next/image'
import React from 'react'
import {Fragment, useState} from 'react'

type Guest = GetOrdersResType['data'][0]['guest']
type Orders = GetOrdersResType['data']
export default function OrderGuestDetail({
  guest,
  orders,
  paid,
  paidZaloPay
}: {
  guest: Guest
  orders: Orders
  paid?: (data: PayGuestOrdersResType) => void
  paidZaloPay?: (data: ZaloPayGuestOrdersResType) => void
}) {
  const t = useTranslations('ManageOrders.detail')
  const role = useAppStore((state) => state.role)
  const ordersFilterToPurchase = guest
    ? orders.filter(
        (order) =>
          order.status !== OrderStatus.Paid &&
          order.status !== OrderStatus.Rejected
      )
    : []
  const purchasedOrderFilter = guest
    ? orders.filter((order) => order.status === OrderStatus.Paid)
    : []
  const payForGuestMutation = usePayForGuestMutation()
  const zaloPayForGuestMutation = useZaloPayForGuestMutation()
  const [isDialogOpen, setIsDialogOpen] = useState(false) // State quản lý dialog

  const pay = async () => {
    if (payForGuestMutation.isPending || !guest) return
    try {
      const result = await payForGuestMutation.mutateAsync({
        guestId: guest.id
      })
      paid && paid(result.payload)
    } catch (error) {
      handleErrorApi({error})
    }
  }

  const zaloPay = async () => {
    if (zaloPayForGuestMutation.isPending || !guest) return
    try {
      const result = await zaloPayForGuestMutation.mutateAsync({
        guestId: guest.id
      })
      const paymentUrl = result?.payload?.data?.paymentUrl
      if (paymentUrl) window.open(paymentUrl, '_blank')
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (isMobile) window.location.href = paymentUrl
      paidZaloPay && paidZaloPay(result.payload)
    } catch (error) {
      handleErrorApi({error})
    }
  }

  const handleCashPayment = () => {
    setIsDialogOpen(true) // Mở dialog khi nhấn thanh toán tiền mặt
  }

  const confirmCashPayment = () => {
    setIsDialogOpen(false) // Đóng dialog khi xác nhận
    pay() // Thực hiện thanh toán
  }

  return (
    <div className="space-y-2 text-sm">
      {guest && (
        <Fragment>
          <div className="space-x-1">
            <span className="font-semibold">{t('name')}:</span>
            <span>{guest.name}</span>
            <span className="font-semibold">(#{guest.id})</span>
          </div>
          <div className="space-x-1">
            <span className="font-semibold">{t('time')}:</span>
            <span>{formatDateTimeToLocaleString(guest.createdAt)}</span>
          </div>
        </Fragment>
      )}

      <div className="space-y-1">
        <div className="font-semibold">{t('order')}:</div>
        {orders.map((order, index) => {
          return (
            <div key={order.id} className="flex gap-2 items-center text-xs">
              <span className="w-[10px]">{index + 1}</span>
              <span title={getVietnameseOrderStatus(order.status)}>
                {order.status === OrderStatus.Pending && (
                  <OrderStatusIcon.Pending className="w-4 h-4" />
                )}
                {order.status === OrderStatus.Processing && (
                  <OrderStatusIcon.Processing className="w-4 h-4" />
                )}
                {order.status === OrderStatus.Rejected && (
                  <OrderStatusIcon.Rejected className="w-4 h-4 text-red-400" />
                )}
                {order.status === OrderStatus.Delivered && (
                  <OrderStatusIcon.Delivered className="w-4 h-4" />
                )}
                {order.status === OrderStatus.Paid && (
                  <OrderStatusIcon.Paid className="w-4 h-4 text-yellow-400" />
                )}
              </span>
              <Image
                src={order.dishSnapshot.image}
                alt={order.dishSnapshot.name}
                title={order.dishSnapshot.name}
                width={30}
                height={30}
                loading="lazy"
                className="h-[30px] w-[30px] rounded object-cover"
              />
              <span
                className="truncate w-[70px] sm:w-[100px]"
                title={order.dishSnapshot.name}
              >
                {order.dishSnapshot.name}
              </span>
              <span className="font-semibold" title={`Tổng: ${order.quantity}`}>
                x{order.quantity}
              </span>
              <span className="italic text-red-600 dark:text-red-400">
                {formatCurrency(order.quantity * order.dishSnapshot.price)}
              </span>
              <span
                className="hidden sm:inline"
                title={`Tạo: ${formatDateTimeToLocaleString(
                  order.createdAt
                )} / Cập nhật: ${formatDateTimeToLocaleString(order.updatedAt)}
          `}
              >
                {formatDateTimeToLocaleString(order.createdAt)}
              </span>
              <span
                className="sm:hidden"
                title={`Tạo: ${formatDateTimeToLocaleString(
                  order.createdAt
                )} / Cập nhật: ${formatDateTimeToLocaleString(order.updatedAt)}
          `}
              >
                {formatDateTimeToTimeString(order.createdAt)}
              </span>
            </div>
          )
        })}
      </div>

      <div className="space-x-1">
        <span className="font-semibold text-green-600 dark:text-green-400">
          {t('paid')}:
        </span>
        <Badge variant={'outline'}>
          <span>
            {formatCurrency(
              purchasedOrderFilter.reduce((acc, order) => {
                return acc + order.quantity * order.dishSnapshot.price
              }, 0)
            )}
          </span>
        </Badge>
      </div>
      <div className="space-x-1">
        <span className="font-semibold text-red-600 dark:text-red-400">
          {t('notYetPaid')}:
        </span>
        <Badge>
          <span>
            {formatCurrency(
              ordersFilterToPurchase.reduce((acc, order) => {
                return acc + order.quantity * order.dishSnapshot.price
              }, 0)
            )}
          </span>
        </Badge>
      </div>

      <div className="space-y-2">
        <Button
          className="w-full"
          size={'sm'}
          variant={'secondary'}
          disabled={
            ordersFilterToPurchase.length === 0 ||
            role === Role.Employee ||
            payForGuestMutation.isPending
          }
          onClick={handleCashPayment} // Mở dialog khi nhấn nút này
        >
          {payForGuestMutation.isPending ? (
            <LoaderCircle className="w-5 h-5 mx-auto animate-spin" />
          ) : (
            <>{t('paymentWithCash')}</>
          )}
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <span className="hidden"></span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('confirm')}</DialogTitle>
              <DialogDescription>{t('description')}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={confirmCashPayment}>
                {t('confirmPayment')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Nút thanh toán bằng ZaloPay */}
        <Button
          className="w-full"
          size={'sm'}
          variant={'secondary'}
          disabled={
            ordersFilterToPurchase.length === 0 ||
            zaloPayForGuestMutation.isPending
          }
          onClick={zaloPay}
        >
          {zaloPayForGuestMutation.isPending ? (
            <LoaderCircle className="w-5 h-5 mx-auto animate-spin" />
          ) : (
            <>{t('paymentWithZaloPay')}</>
          )}
        </Button>
      </div>
    </div>
  )
}
