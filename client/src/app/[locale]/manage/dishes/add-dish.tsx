'use client'

import revalidateApiRequest from '@/apiRequests/revalidate'
import {CategoriesDialog} from '@/app/[locale]/manage/categories/categories-dialog'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
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
import {Textarea} from '@/components/ui/textarea'
import {DishStatus, DishStatusValues} from '@/constants/type'
import {toast} from '@/hooks/use-toast'
import {getVietnameseDishStatus, handleErrorApi} from '@/lib/utils'
import {useAddDishMutation} from '@/queries/useDish'
import {useUploadMediaMutation} from '@/queries/useMedia'
import {
  CreateDishBody,
  CreateDishBodyType
} from '@/schemaValidations/dish.schema'
import {zodResolver} from '@hookform/resolvers/zod'
import {PlusCircle, Upload} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useRef, useState} from 'react'
import {useForm} from 'react-hook-form'

export default function AddDish() {
  const t = useTranslations('ManageDishes.dialogAdd')
  const errorMessageT = useTranslations('ErrorMessage.dish')
  const [file, setFile] = useState<File | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedCategoryName, setSelectedCategoryName] = useState('')
  const addDishMutation = useAddDishMutation()
  const uploadMediaMutation = useUploadMediaMutation()
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const form = useForm<CreateDishBodyType>({
    resolver: zodResolver(CreateDishBody),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      image: undefined,
      status: DishStatus.Unavailable,
      categoryId: 0
    }
  })
  const image = form.watch('image')
  const name = form.watch('name')
  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file)
    }
    return image
  }, [file, image])

  const reset = () => {
    form.reset()
    setFile(null)
    setSelectedCategoryName('')
  }

  const onSubmit = async (values: CreateDishBodyType) => {
    if (addDishMutation.isPending) return

    try {
      let body = values
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadImageResult = await uploadMediaMutation.mutateAsync(
          formData
        )
        const imageUrl = uploadImageResult.payload.data
        body = {...values, image: imageUrl}
      }
      const result = await addDishMutation.mutateAsync(body)
      await revalidateApiRequest('dishes')
      toast({
        description: result.payload.message
      })
      reset()
      setOpen(false)
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  return (
    <Dialog
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
        setOpen(value)
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            {t('title')}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('desc')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="add-dish-form"
            onSubmit={form.handleSubmit(onSubmit, (e) => {
              console.log(e)
            })}
            onReset={reset}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="image"
                render={({field}) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-start">
                      <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                        <AvatarImage src={previewAvatarFromFile} />
                        <AvatarFallback className="rounded-none">
                          {name || t('image')}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        ref={imageInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFile(file)
                            field.onChange('http://localhost:3000/' + file.name)
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({field, formState: {errors}}) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="name">{t('name')}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="name" className="w-full" {...field} />
                        <FormMessage>
                          {Boolean(errors.name?.message) &&
                            errorMessageT(errors.name?.message as any)
                              .replace('ErrorMessage.dish.', '')
                              .trim()}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({field, formState: {errors}}) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="price">{t('price')}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="price"
                          className="w-full"
                          {...field}
                          type="number"
                        />
                        <FormMessage>
                          {Boolean(errors.price?.message) &&
                            errorMessageT(errors.price?.message as any)
                              .replace('ErrorMessage.dish.', '')
                              .trim()}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({field, formState: {errors}}) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="description">{t('description')}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Textarea
                          id="description"
                          className="w-full"
                          {...field}
                        />
                        <FormMessage>
                          {Boolean(errors.description?.message) &&
                            errorMessageT(errors.description?.message as any)
                              .replace('ErrorMessage.dish.', '')
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
                            {DishStatusValues.map((status) => (
                              <SelectItem key={status} value={status}>
                                {getVietnameseDishStatus(status)}
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
                name="categoryId"
                render={({field}) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="categoryId">Danh mục</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <div className="flex items-center gap-4">
                          <Input
                            id="categoryId"
                            value={selectedCategoryName}
                            readOnly
                            className="w-full"
                          />
                          <CategoriesDialog
                            onChoose={(category) => {
                              field.onChange(category.id)
                              setSelectedCategoryName(category.name)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="add-dish-form">
            {t('add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
