'use client'

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {useForm} from 'react-hook-form'
import {
  ChangePasswordBody,
  ChangePasswordBodyType
} from '@/schemaValidations/account.schema'
import {zodResolver} from '@hookform/resolvers/zod'
import {Form, FormField, FormItem, FormMessage} from '@/components/ui/form'
import {toast} from '@/hooks/use-toast'
import {handleErrorApi} from '@/lib/utils'
import {useChangePasswordMutation} from '@/queries/useAccount'
import {useTranslations} from 'next-intl'

export default function ChangePasswordForm() {
  const t = useTranslations('UpdateProfile')
  const errorMessageT = useTranslations('ErrorMessage')
  const changePasswordMutation = useChangePasswordMutation()
  const form = useForm<ChangePasswordBodyType>({
    resolver: zodResolver(ChangePasswordBody),
    defaultValues: {
      oldPassword: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (data: ChangePasswordBodyType) => {
    if (changePasswordMutation.isPending) return

    try {
      const result = await changePasswordMutation.mutateAsync(data)
      form.reset()
      toast({description: result.payload.message})
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  const reset = () => {
    form.reset()
  }

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid auto-rows-max items-start gap-4 md:gap-8"
        onSubmit={form.handleSubmit(onSubmit)}
        onReset={reset}
      >
        <Card className="overflow-hidden" x-chunk="dashboard-07-chunk-4">
          <CardHeader>
            <CardTitle>{t('changePassword')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="oldPassword"
                render={({field, formState: {errors}}) => (
                  <FormItem>
                    <div className="grid gap-3">
                      <Label htmlFor="oldPassword">{t('oldPassword')}</Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        autoComplete="current-password"
                        className="w-full"
                        {...field}
                      />
                      <FormMessage>
                        {Boolean(errors.oldPassword?.message) &&
                          errorMessageT(errors.oldPassword?.message as any)}
                      </FormMessage>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({field, formState: {errors}}) => (
                  <FormItem>
                    <div className="grid gap-3">
                      <Label htmlFor="password">{t('newPassword')}</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        className="w-full"
                        {...field}
                      />
                      <FormMessage>
                        {Boolean(errors.password?.message) &&
                          errorMessageT(errors.password?.message as any)}
                      </FormMessage>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({field, formState: {errors}}) => (
                  <FormItem>
                    <div className="grid gap-3">
                      <Label htmlFor="confirmPassword">
                        {t('confirmPassword')}
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        className="w-full"
                        {...field}
                      />
                      <FormMessage>
                        {Boolean(errors.confirmPassword?.message) &&
                          errorMessageT(errors.confirmPassword?.message as any)}
                      </FormMessage>
                    </div>
                  </FormItem>
                )}
              />
              <div className=" items-center gap-2 md:ml-auto flex">
                <Button variant="outline" size="sm" type="reset">
                  {t('cancel')}
                </Button>
                <Button size="sm" type="submit">
                  {t('save')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
