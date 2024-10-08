'use client'

import QRCodeTable from '@/components/qrcode.table'
import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import {Switch} from '@/components/ui/switch'
import {TableStatus, TableStatusValues} from '@/constants/type'
import {toast} from '@/hooks/use-toast'
import {
  getTableLink,
  getVietnameseTableStatus,
  handleErrorApi
} from '@/lib/utils'
import {useGetTable, useUpdateTableMutation} from '@/queries/useTable'
import {
  UpdateTableBody,
  UpdateTableBodyType
} from '@/schemaValidations/table.schema'
import {zodResolver} from '@hookform/resolvers/zod'
import {Link} from '@/navigation'
import {useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {useTranslations} from 'next-intl'
import {VisuallyHidden} from '@radix-ui/react-visually-hidden'

export default function EditTable({
  id,
  setId,
  onSubmitSuccess
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}) {
  const t = useTranslations('ManageTables.dialogEdit')
  const errorMessageT = useTranslations('ErrorMessage.table')
  const updateTableMutation = useUpdateTableMutation()
  const {data} = useGetTable({
    id: id as number,
    enabled: Boolean(id)
  })
  const form = useForm<UpdateTableBodyType>({
    resolver: zodResolver(UpdateTableBody),
    defaultValues: {
      capacity: 2,
      status: TableStatus.Hidden,
      changeToken: false
    }
  })

  useEffect(() => {
    if (data) {
      const {capacity, status} = data.payload.data
      form.reset({
        capacity,
        status,
        changeToken: form.getValues('changeToken')
      })
    }
  }, [data, form])

  const onSubmit = async (values: UpdateTableBodyType) => {
    if (updateTableMutation.isPending) return
    try {
      let body: UpdateTableBodyType & {id: number} = {
        id: id as number,
        ...values
      }
      const result = await updateTableMutation.mutateAsync(body)
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
      <DialogContent
        className="sm:max-w-[600px] max-h-screen overflow-auto"
        onCloseAutoFocus={() => {
          form.reset()
          setId(undefined)
        }}
      >
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            <VisuallyHidden>Description</VisuallyHidden>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-table-form"
            onSubmit={form.handleSubmit(onSubmit, (e) => {
              console.log(e)
            })}
          >
            <div className="grid gap-4 py-4">
              <FormItem>
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <Label htmlFor="name">{t('number')}</Label>
                  <div className="col-span-3 w-full space-y-2">
                    <Input
                      id="number"
                      type="number"
                      className="w-full"
                      value={data?.payload.data.number ?? 0}
                      readOnly
                      disabled
                    />
                    <FormMessage />
                  </div>
                </div>
              </FormItem>
              <FormField
                control={form.control}
                name="capacity"
                render={({field, formState: {errors}}) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="price">{t('capacity')}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="capacity"
                          className="w-full"
                          {...field}
                          type="number"
                        />
                        <FormMessage>
                          {Boolean(errors.capacity?.message) &&
                            errorMessageT(errors.capacity?.message as any)
                              .replace('ErrorMessage.table.', '')
                              .trim()}
                        </FormMessage>
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
                      <Label htmlFor="description">{t('status')}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TableStatusValues.map((status) => (
                              <SelectItem key={status} value={status}>
                                {getVietnameseTableStatus(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="changeToken"
                render={({field}) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="price">{t('changeQRCode')}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="changeToken"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      </div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormItem>
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <Label>QR Code</Label>
                  <div className="col-span-3 w-full space-y-2">
                    {data && (
                      <QRCodeTable
                        token={data.payload.data.token}
                        tableNumber={data.payload.data.number}
                      />
                    )}
                  </div>
                </div>
              </FormItem>
              <FormItem>
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <Label>{t('orderURL')}</Label>
                  <div className="col-span-3 w-full space-y-2">
                    {data && (
                      <Link
                        href={getTableLink({
                          token: data.payload.data.token,
                          tableNumber: data.payload.data.number
                        })}
                        target="_blank"
                        className="break-all"
                      >
                        {getTableLink({
                          token: data.payload.data.token,
                          tableNumber: data.payload.data.number
                        })}
                      </Link>
                    )}
                  </div>
                </div>
              </FormItem>
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="edit-table-form">
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
