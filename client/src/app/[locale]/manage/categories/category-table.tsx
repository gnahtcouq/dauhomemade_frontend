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

import AddCategory from '@/app/[locale]/manage/categories/add-category'
import EditCategory from '@/app/[locale]/manage/categories/edit-category'
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
import {handleErrorApi, simpleMatchText} from '@/lib/utils'
import {
  useDeleteCategoryMutation,
  useGetCategoryList
} from '@/queries/useCategory'
import {CategoryListResType} from '@/schemaValidations/category.schema'
import {useTranslations} from 'next-intl'
import {useSearchParams} from 'next/navigation'
import {createContext, useContext, useEffect, useState} from 'react'
import React from 'react'
import TableSkeleton from '@/app/[locale]/manage/orders/table-skeleton'

type CategoryItem = CategoryListResType['data'][0]

const CategoryTableContext = createContext<{
  setCategoryIdEdit: (value: number) => void
  categoryIdEdit: number | undefined
  categoryDelete: CategoryItem | null
  setCategoryDelete: (value: CategoryItem | null) => void
}>({
  setCategoryIdEdit: (value: number | undefined) => {},
  categoryIdEdit: undefined,
  categoryDelete: null,
  setCategoryDelete: (value: CategoryItem | null) => {}
})

const useTableTranslations = () => {
  return useTranslations('ManageCategories.table')
}

const TableHeaderCustomize = ({translationKey}: {translationKey: string}) => {
  const t = useTableTranslations()
  return <>{t(translationKey as any)}</>
}

export const columns: ColumnDef<CategoryItem>[] = [
  {
    accessorKey: 'id',
    header: 'ID'
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
    id: 'actions',
    enableHiding: false,
    cell: function Actions({row}) {
      const {setCategoryIdEdit, setCategoryDelete} =
        useContext(CategoryTableContext)
      const openEditCategory = () => {
        setCategoryIdEdit(row.original.id)
      }

      const openDeleteCategory = () => {
        setCategoryDelete(row.original)
      }

      const t = useTranslations('ManageCategories.table')

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
            <DropdownMenuItem onClick={openEditCategory}>
              {t('edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteCategory}>
              {t('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

function AlertDialogDeleteCategory({
  categoryDelete,
  setCategoryDelete
}: {
  categoryDelete: CategoryItem | null
  setCategoryDelete: (value: CategoryItem | null) => void
}) {
  const t = useTranslations('ManageCategories.confirmDelete')
  const {mutateAsync} = useDeleteCategoryMutation()
  const deleteCategory = async () => {
    if (categoryDelete) {
      try {
        const result = await mutateAsync(categoryDelete.id)
        setCategoryDelete(null)
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
      open={Boolean(categoryDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setCategoryDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('title')}{' '}
            <span className="bg-foreground text-primary-foreground rounded px-1">
              {categoryDelete?.name}
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription>{t('message')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={deleteCategory}>
            {t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
// Số lượng item trên 1 trang
const PAGE_SIZE = 10
export default function CategoryTable() {
  const t = useTranslations('ManageCategories.table')
  const searchParam = useSearchParams()
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1
  // const params = Object.fromEntries(searchParam.entries())
  const [categoryIdEdit, setCategoryIdEdit] = useState<number | undefined>()
  const [categoryDelete, setCategoryDelete] = useState<CategoryItem | null>(
    null
  )
  const categoryListQuery = useGetCategoryList()
  const data = categoryListQuery.data?.payload.data ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE //default page size
  })

  const category = useReactTable({
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
    category.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE
    })
  }, [category, pageIndex])

  return (
    <CategoryTableContext.Provider
      value={{
        categoryIdEdit,
        setCategoryIdEdit,
        categoryDelete,
        setCategoryDelete
      }}
    >
      <div className="w-full">
        <EditCategory id={categoryIdEdit} setId={setCategoryIdEdit} />
        <AlertDialogDeleteCategory
          categoryDelete={categoryDelete}
          setCategoryDelete={setCategoryDelete}
        />
        <div className="flex items-center py-4">
          <Input
            placeholder={t('searchByName')}
            value={
              (category.getColumn('name')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              category.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="ml-auto flex items-center gap-2">
            <AddCategory />
          </div>
        </div>
        {categoryListQuery.isPending && <TableSkeleton />}
        {!categoryListQuery.isPending && (
          <div className="w-full overflow-x-auto rounded-md border">
            <Table className="min-w-[640px] md:min-w-[768px] lg:min-w-[1024px]">
              <TableHeader>
                {category.getHeaderGroups().map((headerGroup) => (
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
                {category.getRowModel().rows?.length ? (
                  category.getRowModel().rows.map((row) => (
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
        )}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-xs text-muted-foreground py-4 flex-1 ">
            {t('show')}{' '}
            <strong>{category.getPaginationRowModel().rows.length}</strong>{' '}
            {t('outOf')} <strong>{data.length}</strong> {t('results')}
          </div>
          <div>
            <AutoPagination
              page={category.getState().pagination.pageIndex + 1}
              pageSize={category.getPageCount()}
              pathname="/manage/categories"
            />
          </div>
        </div>
      </div>
    </CategoryTableContext.Provider>
  )
}
