'use client'

import {useAppStore} from '@/components/app-provider'
import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {Form, FormField, FormItem, FormMessage} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {generateSocketInstance, handleErrorApi} from '@/lib/utils'
import {useGuestLoginMutation} from '@/queries/useGuest'
import {
  GuestLoginBody,
  GuestLoginBodyType
} from '@/schemaValidations/guest.schema'
import {zodResolver} from '@hookform/resolvers/zod'
import {useRouter} from '@/navigation'
import {useParams, useSearchParams} from 'next/navigation'
import {useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {useTranslations} from 'next-intl'
import {LoaderCircle} from 'lucide-react'
import React from 'react'

export default function GuestLoginForm() {
  const t = useTranslations('GuestLogin')
  const errorMessageT = useTranslations('ErrorMessage')
  const setRole = useAppStore((state) => state.setRole)
  const setSocket = useAppStore((state) => state.setSocket)
  const searchParams = useSearchParams()
  const params = useParams()
  const tableNumber = Number(params.number)
  const router = useRouter()
  const loginMutation = useGuestLoginMutation()
  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: '',
      token: '',
      tableNumber
    }
  })

  useEffect(() => {
    const token = searchParams.get('token') || localStorage.getItem('token')
    if (!token) {
      router.push('/')
    } else {
      localStorage.setItem('token', token)
      form.setValue('token', token)
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.set('token', token)
      router.push(currentUrl.toString())
    }
  }, [searchParams, router, form])

  async function onSubmit(values: GuestLoginBodyType) {
    if (loginMutation.isPending) return
    try {
      const result = await loginMutation.mutateAsync(values)
      setRole(result.payload.data.guest.role)
      setSocket(generateSocketInstance(result.payload.data.accessToken))
      router.push('/guest/menu')
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-2 max-w-[600px] flex-shrink-0 w-full"
            noValidate
            onSubmit={form.handleSubmit(onSubmit, (e) => {
              console.log(e)
            })}
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({field, formState: {errors}}) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <Label htmlFor="name">{t('name')}</Label>
                      <Input id="name" type="text" required {...field} />
                      <FormMessage>
                        {Boolean(errors.name?.message) &&
                          errorMessageT(errors.name?.message as any)
                            .replace('ErrorMessage.', '')
                            .trim()}
                      </FormMessage>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <LoaderCircle className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  <>{t('login')}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
