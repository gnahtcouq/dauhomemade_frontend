'use client'

import {Button} from '@/components/ui/button'
import {DotsHorizontalIcon} from '@radix-ui/react-icons'
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

import AddTable from '@/app/[locale]/manage/tables/add-table'
import EditTable from '@/app/[locale]/manage/tables/edit-table'
import AutoPagination from '@/components/auto-pagination'
import QRCodeTable from '@/components/qrcode.table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {Input} from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {toast} from '@/hooks/use-toast'
import {getVietnameseTableStatus, handleErrorApi} from '@/lib/utils'
import {useDeleteTableMutation, useGetTableList} from '@/queries/useTable'
import {TableListResType} from '@/schemaValidations/table.schema'
import {useSearchParams} from 'next/navigation'
import {createContext, useContext, useEffect, useState} from 'react'
import {useTranslations} from 'next-intl'
import React from 'react'

type TableItem = TableListResType['data'][0]

const TableTableContext = createContext<{
  setTableIdEdit: (value: number) => void
  tableIdEdit: number | undefined
  tableDelete: TableItem | null
  setTableDelete: (value: TableItem | null) => void
}>({
  setTableIdEdit: (value: number | undefined) => {},
  tableIdEdit: undefined,
  tableDelete: null,
  setTableDelete: (value: TableItem | null) => {}
})

const useTableTranslations = () => {
  return useTranslations('ManageTables.table')
}

const TableHeaderCustomize = ({translationKey}: {translationKey: string}) => {
  const t = useTableTranslations()
  return <>{t(translationKey as any)}</>
}

export const columns: ColumnDef<TableItem>[] = [
  {
    accessorKey: 'number',
    header: () => <TableHeaderCustomize translationKey="number" />,
    cell: ({row}) => <div className="capitalize">{row.getValue('number')}</div>,
    filterFn: (rows, columnId, filterValue) => {
      if (!filterValue) return true
      return String(filterValue) === String(rows.getValue('number'))
    }
  },
  {
    accessorKey: 'capacity',
    header: () => <TableHeaderCustomize translationKey="capacity" />,
    cell: ({row}) => (
      <div className="capitalize">{row.getValue('capacity')}</div>
    )
  },
  {
    accessorKey: 'status',
    header: () => <TableHeaderCustomize translationKey="status" />,
    cell: ({row}) => (
      <div>{getVietnameseTableStatus(row.getValue('status'))}</div>
    )
  },
  {
    accessorKey: 'token',
    header: 'QR Code',
    cell: ({row}) => (
      <div>
        <QRCodeTable
          token={row.getValue('token')}
          tableNumber={row.getValue('number')}
        />
      </div>
    )
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({row}) {
      const {setTableIdEdit, setTableDelete} = useContext(TableTableContext)
      const openEditTable = () => {
        setTableIdEdit(row.original.number)
      }

      const openDeleteTable = () => {
        setTableDelete(row.original)
      }

      const t = useTranslations('ManageDishes.table')

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
            <DropdownMenuItem onClick={openEditTable}>
              {t('edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteTable}>
              {t('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

function AlertDialogDeleteTable({
  tableDelete,
  setTableDelete
}: {
  tableDelete: TableItem | null
  setTableDelete: (value: TableItem | null) => void
}) {
  const t = useTranslations('ManageTables.confirmDelete')
  const {mutateAsync} = useDeleteTableMutation()
  const deleteTable = async () => {
    if (tableDelete) {
      try {
        const result = await mutateAsync(tableDelete.number)
        setTableDelete(null)
        toast({
          description: result.payload.message
        })
      } catch (error) {
        handleErrorApi({error})
      }
    }
  }

  return (
    <AlertDialog
      open={Boolean(tableDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setTableDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('title')}{' '}
            <span className="bg-foreground text-primary-foreground rounded px-1">
              {tableDelete?.number}
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription>{t('message')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={deleteTable}>
            {t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
// Số lượng item trên 1 trang
const PAGE_SIZE = 10
export default function TableTable() {
  const t = useTranslations('ManageTables.table')
  const searchParam = useSearchParams()
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1
  // const params = Object.fromEntries(searchParam.entries())
  const [tableIdEdit, setTableIdEdit] = useState<number | undefined>()
  const [tableDelete, setTableDelete] = useState<TableItem | null>(null)
  const tableListQuery = useGetTableList()
  const data = tableListQuery.data?.payload.data ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
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
      pageIndex,
      pageSize: PAGE_SIZE
    })
  }, [table, pageIndex])

  return (
    <TableTableContext.Provider
      value={{tableIdEdit, setTableIdEdit, tableDelete, setTableDelete}}
    >
      <div className="w-full">
        <EditTable id={tableIdEdit} setId={setTableIdEdit} />
        <AlertDialogDeleteTable
          tableDelete={tableDelete}
          setTableDelete={setTableDelete}
        />
        <div className="flex items-center py-4">
          <Input
            placeholder={t('searchByNumber')}
            value={
              (table.getColumn('number')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('number')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="ml-auto flex items-center gap-2">
            <AddTable />
          </div>
        </div>
        <div className="w-full overflow-x-auto rounded-md border">
          <Table className="min-w-[640px] md:min-w-[768px] lg:min-w-[1024px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead className="whitespace-nowrap" key={header.id}>
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
              pathname="/manage/tables"
            />
          </div>
        </div>
      </div>
    </TableTableContext.Provider>
  )
}
