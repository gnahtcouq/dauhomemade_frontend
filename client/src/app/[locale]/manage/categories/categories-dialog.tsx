import AutoPagination from '@/components/auto-pagination'
import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {useGetCategoryList} from '@/queries/useCategory'
import {CategoryListResType} from '@/schemaValidations/category.schema'
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
import {useTranslations} from 'next-intl'
import {useEffect, useState} from 'react'
import {VisuallyHidden} from '@radix-ui/react-visually-hidden'
import {simpleMatchText} from '@/lib/utils'

type CategoryItem = CategoryListResType['data'][0]

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
  }
]

const PAGE_SIZE = 10

export function CategoriesDialog({
  onChoose
}: {
  onChoose: (table: CategoryItem) => void
}) {
  const t = useTranslations('ManageDishes.chooseCategory')
  const [open, setOpen] = useState(false)
  const categoryListQuery = useGetCategoryList()
  const data = categoryListQuery.data?.payload.data ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
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
      pageIndex: 0,
      pageSize: PAGE_SIZE
    })
  }, [category])

  const choose = (category: CategoryItem) => {
    onChoose(category)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t('changeCategory')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-full overflow-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            <VisuallyHidden>Description</VisuallyHidden>
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="w-full">
            <div className="flex items-center py-4">
              <Input
                placeholder={t('searchByCategoryName')}
                value={
                  (category.getColumn('name')?.getFilterValue() as string) ?? ''
                }
                onChange={(event) =>
                  category.getColumn('name')?.setFilterValue(event.target.value)
                }
                className="w-full"
              />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {category.getHeaderGroups().map((headerGroup) => (
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
                  {category.getRowModel().rows?.length ? (
                    category.getRowModel().rows.map((row) => (
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
                <strong>{category.getPaginationRowModel().rows.length}</strong>{' '}
                {t('outOf')} <strong>{data.length}</strong> {t('results')}
              </div>
              <div>
                <AutoPagination
                  page={category.getState().pagination.pageIndex + 1}
                  pageSize={category.getPageCount()}
                  onClick={(pageNumber) => {
                    category.setPagination({
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
