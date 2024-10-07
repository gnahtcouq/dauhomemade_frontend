'use client'

import OrderGuestDetail from '@/app/[locale]/manage/orders/order-guest-detail'
import {OrderTableContext} from '@/app/[locale]/manage/orders/order-table'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {OrderStatus, OrderStatusValues, Role} from '@/constants/type'
import {
  formatCurrency,
  formatDateTimeToLocaleString,
  getVietnameseOrderStatus,
  simpleMatchText
} from '@/lib/utils'
import {GetOrdersResType} from '@/schemaValidations/order.schema'
import {DotsHorizontalIcon} from '@radix-ui/react-icons'
import {ColumnDef} from '@tanstack/react-table'
import {useTranslations} from 'next-intl'
import Image from 'next/image'
import React from 'react'
import {useContext} from 'react'

type OrderItem = GetOrdersResType['data'][0]

const useTableTranslations = () => {
  return useTranslations('ManageOrders.table')
}

const TableHeaderCustomize = ({translationKey}: {translationKey: string}) => {
  const t = useTableTranslations()
  return <>{t(translationKey as any)}</>
}

const orderTableColumns: ColumnDef<OrderItem>[] = [
  {
    accessorKey: 'tableNumber',
    header: () => <TableHeaderCustomize translationKey="table" />,
    cell: ({row}) => <div>{row.getValue('tableNumber')}</div>,
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      return simpleMatchText(
        String(row.getValue(columnId)),
        String(filterValue)
      )
    }
  },
  {
    id: 'guestName',
    header: () => <TableHeaderCustomize translationKey="guest" />,
    cell: function Cell({row}) {
      const {orderObjectByGuestId} = useContext(OrderTableContext)
      const guest = row.original.guest
      return (
        <div>
          {!guest && (
            <div>
              <span>Đã bị xóa</span>
            </div>
          )}
          {guest && (
            <Popover>
              <PopoverTrigger>
                <div>
                  <span>{guest.name} </span>
                  <span className="font-semibold">(#{guest.id})</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] sm:w-[440px]">
                <OrderGuestDetail
                  guest={guest}
                  orders={orderObjectByGuestId[guest.id]}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      )
    },
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      return simpleMatchText(
        row.original.guest?.name ?? 'Đã bị xóa',
        String(filterValue)
      )
    }
  },
  {
    id: 'dishName',
    header: () => <TableHeaderCustomize translationKey="dish" />,
    cell: ({row}) => (
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Image
              src={row.original.dishSnapshot.image}
              alt={row.original.dishSnapshot.name}
              width={0}
              height={0}
              sizes="100vw"
              priority={true}
              className="rounded-md object-cover w-[50px] h-[50px] cursor-pointer"
            />
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-wrap gap-2">
              <Image
                src={row.original.dishSnapshot.image}
                alt={row.original.dishSnapshot.name}
                width={100}
                height={100}
                priority={true}
                className="rounded-md object-cover w-[100px] h-[100px]"
              />
              <div className="space-y-1 text-sm">
                <h3 className="font-semibold">
                  {row.original.dishSnapshot.name}
                </h3>
                <div className="italic font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(row.original.dishSnapshot.price)}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <div className="space-y-2 w-full overflow-hidden text-ellipsis whitespace-nowrap">
          <div className="flex items-center gap-2">
            <Badge className="px-1" variant={'secondary'}>
              x{row.original.quantity}
            </Badge>
            <span>{row.original.dishSnapshot.name}</span>
          </div>
          <span className="italic text-red-600 dark:text-red-400">
            {formatCurrency(
              row.original.dishSnapshot.price * row.original.quantity
            )}
          </span>
        </div>
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: () => <TableHeaderCustomize translationKey="status" />,
    cell: function Cell({row}) {
      const {changeStatus, role} = useContext(OrderTableContext)
      const changeOrderStatus = async (
        status: (typeof OrderStatusValues)[number]
      ) => {
        changeStatus({
          orderId: row.original.id,
          dishId: row.original.dishSnapshot.dishId!,
          status: status,
          quantity: row.original.quantity
        })
      }
      return (
        <Select
          onValueChange={(value: (typeof OrderStatusValues)[number]) => {
            changeOrderStatus(value)
          }}
          defaultValue={OrderStatus.Pending}
          value={row.getValue('status')}
          disabled={role !== Role.Owner}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            {OrderStatusValues.map((status) => (
              <SelectItem key={status} value={status}>
                {getVietnameseOrderStatus(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
  },
  {
    id: 'orderHandlerName',
    header: () => <TableHeaderCustomize translationKey="orderHandler" />,
    cell: ({row}) => <div>{row.original.orderHandler?.name ?? ''}</div>
  },
  {
    accessorKey: 'createdAt',
    header: () => <TableHeaderCustomize translationKey="createdUpdated" />,
    cell: ({row}) => (
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-4">
          {formatDateTimeToLocaleString(row.getValue('createdAt'))}
        </div>
        <div className="flex items-center space-x-4">
          {formatDateTimeToLocaleString(
            row.original.updatedAt as unknown as string
          )}
        </div>
      </div>
    )
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({row}) {
      const {setOrderIdEdit} = useContext(OrderTableContext)
      const openEditOrder = () => {
        setOrderIdEdit(row.original.id)
      }

      const t = useTranslations('ManageOrders.table')

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openEditOrder}>
              {t('edit')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

export default orderTableColumns
