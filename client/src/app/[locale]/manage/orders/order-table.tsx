'use client'

import AddOrder from '@/app/[locale]/manage/orders/add-order'
import EditOrder from '@/app/[locale]/manage/orders/edit-order'
import OrderStatics from '@/app/[locale]/manage/orders/order-statics'
import orderTableColumns from '@/app/[locale]/manage/orders/order-table-columns'
import {useOrderService} from '@/app/[locale]/manage/orders/order.service'
import TableSkeleton from '@/app/[locale]/manage/orders/table-skeleton'
import {useAppStore} from '@/components/app-provider'
import AutoPagination from '@/components/auto-pagination'
import {Button} from '@/components/ui/button'
import {Calendar} from '@/components/ui/calendar'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {Input} from '@/components/ui/input'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {OrderStatusValues, Role} from '@/constants/type'
import {toast} from '@/hooks/use-toast'
import {cn, getVietnameseOrderStatus, handleErrorApi} from '@/lib/utils'
import {useGetOrderListQuery, useUpdateOrderMutation} from '@/queries/useOrder'
import {useGetTableList} from '@/queries/useTable'
import {GuestCreateOrdersResType} from '@/schemaValidations/guest.schema'
import {
  GetOrdersResType,
  PayGuestOrdersResType,
  UpdateOrderResType
} from '@/schemaValidations/order.schema'
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import {endOfDay, format, startOfDay} from 'date-fns'
import {Check, ChevronsUpDown} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useSearchParams} from 'next/navigation'
import {createContext, useEffect, useState} from 'react'

export const OrderTableContext = createContext({
  setOrderIdEdit: (value: number | undefined) => {},
  orderIdEdit: undefined as number | undefined,
  changeStatus: (payload: {
    orderId: number
    dishId: number
    status: (typeof OrderStatusValues)[number]
    quantity: number
  }) => {},
  orderObjectByGuestId: {} as OrderObjectByGuestID,
  role: ''
})

export type StatusCountObject = Record<
  (typeof OrderStatusValues)[number],
  number
>
export type Statics = {
  status: StatusCountObject
  table: Record<number, Record<number, StatusCountObject>>
}
export type OrderObjectByGuestID = Record<number, GetOrdersResType['data']>
export type ServingGuestByTableNumber = Record<number, OrderObjectByGuestID>

const PAGE_SIZE = 10
const initFromDate = startOfDay(new Date())
const initToDate = endOfDay(new Date())
export default function OrderTable() {
  const t = useTranslations('ManageOrders.table')
  const role = useAppStore((state) => state.role) ?? ''
  const socket = useAppStore((state) => state.socket)
  const searchParam = useSearchParams()
  const [openStatusFilter, setOpenStatusFilter] = useState(false)
  const [fromDate, setFromDate] = useState(initFromDate)
  const [toDate, setToDate] = useState(initToDate)
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1
  const [orderIdEdit, setOrderIdEdit] = useState<number | undefined>()
  const orderListQuery = useGetOrderListQuery({
    fromDate,
    toDate
  })
  const refetchOrderList = orderListQuery.refetch
  const orderList = orderListQuery.data?.payload.data ?? []
  const tableListQuery = useGetTableList()
  const tableList = tableListQuery.data?.payload.data ?? []
  const tableListSortedByNumber = tableList.sort((a, b) => a.number - b.number)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE //default page size
  })
  const updateOrderMutation = useUpdateOrderMutation()

  const {statics, orderObjectByGuestId, servingGuestByTableNumber} =
    useOrderService(orderList)

  const changeStatus = async (body: {
    orderId: number
    dishId: number
    status: (typeof OrderStatusValues)[number]
    quantity: number
  }) => {
    try {
      await updateOrderMutation.mutateAsync(body)
    } catch (error) {
      handleErrorApi({
        error
      })
    }
  }

  const table = useReactTable({
    data: orderList,
    columns: orderTableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    }
  })

  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE
    })
  }, [table, pageIndex])

  const resetDateFilter = () => {
    setFromDate(initFromDate)
    setToDate(initToDate)
  }

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

    function refetch() {
      const now = new Date()
      if (fromDate <= now && toDate >= now) {
        refetchOrderList()
      }
    }

    function onUpdateOrder(data: UpdateOrderResType['data']) {
      const {
        dishSnapshot: {name},
        quantity
      } = data
      toast({
        description: `Món ${name} (x${quantity}) đã được cập nhật trạng thái "${getVietnameseOrderStatus(
          data.status
        )}"`
      })
      refetch()
    }

    function onNewOrder(data: GuestCreateOrdersResType['data']) {
      const {guest, tableNumber} = data[0]
      toast({
        description: `Khách hàng ${guest?.name} tại bàn ${tableNumber} vừa đặt món mới`
      })
      refetch()
    }

    function onPayment(data: PayGuestOrdersResType['data']) {
      const {guest, tableNumber} = data[0]
      toast({
        description: `Khách hàng ${guest?.name} tại bàn ${tableNumber} thanh toán thành công ${data.length} đơn`
      })
      refetch()
    }

    socket?.on('update-order', onUpdateOrder)
    socket?.on('new-order', onNewOrder)
    socket?.on('connect', onConnect)
    socket?.on('disconnect', onDisconnect)
    socket?.on('payment', onPayment)

    return () => {
      socket?.off('connect', onConnect)
      socket?.off('disconnect', onDisconnect)
      socket?.off('update-order', onUpdateOrder)
      socket?.off('new-order', onNewOrder)
      socket?.off('payment', onPayment)
    }
  }, [refetchOrderList, fromDate, toDate, socket])

  return (
    <OrderTableContext.Provider
      value={{
        orderIdEdit,
        setOrderIdEdit,
        changeStatus,
        orderObjectByGuestId,
        role
      }}
    >
      <div className="w-full">
        <EditOrder
          id={orderIdEdit}
          setId={setOrderIdEdit}
          onSubmitSuccess={() => {}}
        />
        <div className=" flex items-center">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <span className="mr-2">{t('fromDate')}</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={'outline'} className="w-[240px] text-left">
                    {format(fromDate, 'dd/MM/yyyy HH:mm')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(date) => {
                      if (date) {
                        setFromDate(startOfDay(date))
                        setToDate(endOfDay(date))
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || role !== Role.Owner
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center">
              <span className="mr-2">{t('toDate')}</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={'outline'} className="w-[240px] text-left">
                    {format(toDate, 'dd/MM/yyyy HH:mm')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => {
                      if (date) {
                        setToDate(endOfDay(date))
                      }
                    }}
                    disabled={(date) =>
                      date < fromDate ||
                      date > new Date() ||
                      role !== Role.Owner
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button className="" variant={'outline'} onClick={resetDateFilter}>
              Reset
            </Button>
          </div>
          <div className="ml-auto">
            <AddOrder />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 py-4">
          <Input
            placeholder={t('searchByGuestName')}
            value={
              (table.getColumn('guestName')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('guestName')?.setFilterValue(event.target.value)
            }
            className="max-w-[120px]"
          />
          <Input
            placeholder={t('searchByTableNumber')}
            value={
              (table.getColumn('tableNumber')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('tableNumber')?.setFilterValue(event.target.value)
            }
            className="max-w-[120px]"
          />
          <Popover open={openStatusFilter} onOpenChange={setOpenStatusFilter}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openStatusFilter}
                className="w-[150px] text-sm justify-between"
              >
                {table.getColumn('status')?.getFilterValue()
                  ? getVietnameseOrderStatus(
                      table
                        .getColumn('status')
                        ?.getFilterValue() as (typeof OrderStatusValues)[number]
                    )
                  : t('status')}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandGroup>
                  <CommandList>
                    {OrderStatusValues.map((status) => (
                      <CommandItem
                        key={status}
                        value={status}
                        onSelect={(currentValue) => {
                          table
                            .getColumn('status')
                            ?.setFilterValue(
                              currentValue ===
                                table.getColumn('status')?.getFilterValue()
                                ? ''
                                : currentValue
                            )
                          setOpenStatusFilter(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            table.getColumn('status')?.getFilterValue() ===
                              status
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {getVietnameseOrderStatus(status)}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <OrderStatics
          statics={statics}
          tableList={tableListSortedByNumber}
          servingGuestByTableNumber={servingGuestByTableNumber}
        />
        {orderListQuery.isPending && <TableSkeleton />}
        {!orderListQuery.isPending && (
          <div className="w-full overflow-x-auto rounded-md border">
            <Table className="min-w-[640px] md:min-w-[768px] lg:min-w-[1024px]">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          className="whitespace-nowrap"
                          key={header.id}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell className="whitespace-nowrap" key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={orderTableColumns.length}
                      className="h-24 text-center"
                    >
                      {t('noResults')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-xs text-muted-foreground py-4 flex-1 ">
            {t('show')}{' '}
            <strong>{table.getPaginationRowModel().rows.length}</strong>{' '}
            {t('outOf')} <strong>{orderList.length}</strong> {t('results')}
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname="/manage/orders"
            />
          </div>
        </div>
      </div>
    </OrderTableContext.Provider>
  )
}
