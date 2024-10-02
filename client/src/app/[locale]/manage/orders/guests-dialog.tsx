import AutoPagination from '@/components/auto-pagination'
import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {formatDateTimeToLocaleString, simpleMatchText} from '@/lib/utils'
import {useGetGuestListQuery} from '@/queries/useAccount'
import {GetListGuestsResType} from '@/schemaValidations/account.schema'
import {
  ColumnDef,
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
import {useTranslations} from 'next-intl'
import React from 'react'
import {useEffect, useState} from 'react'

type GuestItem = GetListGuestsResType['data'][0]

const useTableTranslations = () => {
  return useTranslations('ManageOrders.table')
}

const TableHeaderCustomize = ({translationKey}: {translationKey: string}) => {
  const t = useTableTranslations()
  return <>{t(translationKey as any)}</>
}

export const columns: ColumnDef<GuestItem>[] = [
  {
    accessorKey: 'name',
    header: () => <TableHeaderCustomize translationKey="guest" />,
    cell: ({row}) => (
      <div className="capitalize">
        {row.getValue('name')} (#{row.original.id})
      </div>
    ),
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      return simpleMatchText(
        row.original.name + String(row.original.id),
        String(filterValue)
      )
    }
  },
  {
    accessorKey: 'tableNumber',
    header: () => <TableHeaderCustomize translationKey="table" />,
    cell: ({row}) => (
      <div className="capitalize">{row.getValue('tableNumber')}</div>
    ),
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      return simpleMatchText(
        String(row.original.tableNumber),
        String(filterValue)
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: () => <TableHeaderCustomize translationKey="createdAt" />,
    cell: ({row}) => (
      <div className="flex items-center space-x-4 text-sm">
        {formatDateTimeToLocaleString(row.getValue('createdAt'))}
      </div>
    )
  }
]

const PAGE_SIZE = 10
const initFromDate = startOfDay(new Date())
const initToDate = endOfDay(new Date())

export default function GuestsDialog({
  onChoose
}: {
  onChoose: (guest: GuestItem) => void
}) {
  const t = useTranslations('ManageOrders.chooseGuest')
  const [open, setOpen] = useState(false)
  const [fromDate, setFromDate] = useState(initFromDate)
  const [toDate, setToDate] = useState(initToDate)
  const guestListQuery = useGetGuestListQuery({
    fromDate,
    toDate
  })
  const data = guestListQuery.data?.payload.data ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE //default page size
  })

  const table = useReactTable({
    data,
    columns,
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
      pageIndex: 0,
      pageSize: PAGE_SIZE
    })
  }, [table])

  const choose = (guest: GuestItem) => {
    onChoose(guest)
    setOpen(false)
  }

  const resetDateFilter = () => {
    setFromDate(initFromDate)
    setToDate(initToDate)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t('title')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-full overflow-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div>
          <div className="w-full">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center">
                <span className="mr-2">{t('fromDate')}</span>
                <Input
                  type="datetime-local"
                  placeholder={t('fromDate')}
                  className="text-sm"
                  value={format(fromDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                  onChange={(event) =>
                    setFromDate(new Date(event.target.value))
                  }
                />
              </div>
              <div className="flex items-center">
                <span className="mr-2">{t('toDate')}</span>
                <Input
                  type="datetime-local"
                  placeholder={t('toDate')}
                  value={format(toDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                  onChange={(event) => setToDate(new Date(event.target.value))}
                />
              </div>
              <Button
                className=""
                variant={'outline'}
                onClick={resetDateFilter}
              >
                Reset
              </Button>
            </div>
            <div className="flex items-center py-4 gap-2">
              <Input
                placeholder={t('searchByGuestName')}
                value={
                  (table.getColumn('name')?.getFilterValue() as string) ?? ''
                }
                onChange={(event) =>
                  table.getColumn('name')?.setFilterValue(event.target.value)
                }
                className="w-[170px]"
              />
              <Input
                placeholder={t('searchByTableNumber')}
                value={
                  (table
                    .getColumn('tableNumber')
                    ?.getFilterValue() as string) ?? ''
                }
                onChange={(event) =>
                  table
                    .getColumn('tableNumber')
                    ?.setFilterValue(event.target.value)
                }
                className="w-[170px]"
              />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
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
                        onClick={() => {
                          choose(row.original)
                        }}
                        className="cursor-pointer"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
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
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        {t('noResults')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="text-xs text-muted-foreground py-4 flex-1 ">
                {t('show')}{' '}
                <strong>{table.getPaginationRowModel().rows.length}</strong>{' '}
                {t('outOf')} <strong>{data.length}</strong> {t('results')}
              </div>
              <div>
                <AutoPagination
                  page={table.getState().pagination.pageIndex + 1}
                  pageSize={table.getPageCount()}
                  onClick={(pageNumber) => {
                    table.setPagination({
                      pageIndex: pageNumber - 1,
                      pageSize: PAGE_SIZE
                    })
                  }}
                  isLink={false}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
