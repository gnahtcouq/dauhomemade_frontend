'use client'

import {Button} from '@/components/ui/button'
import {CaretSortIcon, DotsHorizontalIcon} from '@radix-ui/react-icons'
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
import AddDish from '@/app/[locale]/manage/dishes/add-dish'
import EditDish from '@/app/[locale]/manage/dishes/edit-dish'
import AutoPagination from '@/components/auto-pagination'
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
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
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
import {
  formatCurrency,
  getVietnameseDishStatus,
  handleErrorApi,
  simpleMatchText,
  truncateDescription
} from '@/lib/utils'
import {useDeleteDishMutation, useGetDishListQuery} from '@/queries/useDish'
import {DishListResType} from '@/schemaValidations/dish.schema'
import {useSearchParams} from 'next/navigation'
import {createContext, useContext, useEffect, useState} from 'react'
import DOMPurify from 'dompurify'
import {useTranslations} from 'next-intl'
import React from 'react'
import TableSkeleton from '@/app/[locale]/manage/orders/table-skeleton'

type DishItem = DishListResType['data'][0]

const DishTableContext = createContext<{
  setDishIdEdit: (value: number) => void
  dishIdEdit: number | undefined
  dishDelete: DishItem | null
  setDishDelete: (value: DishItem | null) => void
}>({
  setDishIdEdit: (value: number | undefined) => {},
  dishIdEdit: undefined,
  dishDelete: null,
  setDishDelete: (value: DishItem | null) => {}
})

const useTableTranslations = () => {
  return useTranslations('ManageDishes.table')
}

const TableHeaderCustomize = ({translationKey}: {translationKey: string}) => {
  const t = useTableTranslations()
  return <>{t(translationKey as any)}</>
}

export const columns: ColumnDef<DishItem>[] = [
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'image',
    header: () => <TableHeaderCustomize translationKey="image" />,
    cell: ({row}) => (
      <div>
        <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
          <AvatarImage src={row.getValue('image')} loading="lazy" />
          <AvatarFallback className="rounded-none">
            {row.original.name}
          </AvatarFallback>
        </Avatar>
      </div>
    )
  },
  {
    accessorKey: 'name',
    header: () => <TableHeaderCustomize translationKey="name" />,
    cell: ({row}) => <div className="capitalize">{row.getValue('name')}</div>,
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      return simpleMatchText(
        String(row.getValue(columnId)),
        String(filterValue)
      )
    }
  },
  {
    accessorKey: 'description',
    header: () => <TableHeaderCustomize translationKey="description" />,
    cell: ({row}) => {
      const description = DOMPurify.sanitize(
        row.getValue('description')
      ) as string
      return (
        <div className="whitespace-pre-line">
          {truncateDescription(description, 50)}
        </div>
      )
    }
  },
  {
    accessorKey: 'category',
    header: () => <TableHeaderCustomize translationKey="category" />,
    cell: ({row}) => (
      <div className="capitalize">{row.original.category.name}</div>
    ),
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      return simpleMatchText(
        row.original.category?.name ?? '',
        String(filterValue)
      )
    }
  },
  {
    accessorKey: 'price',
    header: ({column}) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <TableHeaderCustomize translationKey="price" />
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({row}) => (
      <div className="capitalize">{formatCurrency(row.getValue('price'))}</div>
    )
  },
  {
    accessorKey: 'status',
    header: () => <TableHeaderCustomize translationKey="status" />,
    cell: ({row}) => (
      <div>{getVietnameseDishStatus(row.getValue('status'))}</div>
    )
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({row}) {
      const {setDishIdEdit, setDishDelete} = useContext(DishTableContext)
      const openEditDish = () => {
        setDishIdEdit(row.original.id)
      }

      const openDeleteDish = () => {
        setDishDelete(row.original)
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
            <DropdownMenuItem onClick={openEditDish}>
              {t('edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteDish}>
              {t('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

function AlertDialogDeleteDish({
  dishDelete,
  setDishDelete
}: {
  dishDelete: DishItem | null
  setDishDelete: (value: DishItem | null) => void
}) {
  const t = useTranslations('ManageDishes.confirmDelete')
  const {mutateAsync} = useDeleteDishMutation()
  const deleteDish = async () => {
    if (dishDelete) {
      try {
        const result = await mutateAsync(dishDelete.id)
        setDishDelete(null)
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
      open={Boolean(dishDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setDishDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('title')}{' '}
            <span className="bg-foreground text-primary-foreground rounded px-1">
              {dishDelete?.name}
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription>{t('message')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={deleteDish}>
            {t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
// Số lượng item trên 1 trang
const PAGE_SIZE = 10
export default function DishTable() {
  const t = useTranslations('ManageDishes.table')
  const searchParam = useSearchParams()
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1
  const [dishIdEdit, setDishIdEdit] = useState<number | undefined>()
  const [dishDelete, setDishDelete] = useState<DishItem | null>(null)
  const dishListQuery = useGetDishListQuery()
  const data = dishListQuery.data?.payload.data ?? []
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
    <DishTableContext.Provider
      value={{dishIdEdit, setDishIdEdit, dishDelete, setDishDelete}}
    >
      <div className="w-full">
        <EditDish id={dishIdEdit} setId={setDishIdEdit} />
        <AlertDialogDeleteDish
          dishDelete={dishDelete}
          setDishDelete={setDishDelete}
        />
        <div className="flex items-center gap-4 py-4">
          <Input
            placeholder={t('searchByName')}
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Input
            placeholder={t('searchByCategoryName')}
            value={
              (table.getColumn('category')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('category')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="ml-auto flex items-center gap-2">
            <AddDish />
          </div>
        </div>
        {dishListQuery.isPending && <TableSkeleton />}
        {!dishListQuery.isPending && (
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
        )}
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
              pathname="/manage/dishes"
            />
          </div>
        </div>
      </div>
    </DishTableContext.Provider>
  )
}
