'use client'
import {useAppStore} from '@/components/app-provider'
import SearchParamsLoader, {
  useSearchParamsLoader
} from '@/components/search-params-loader'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Form, FormField, FormItem, FormMessage} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {toast} from '@/hooks/use-toast'
import {generateSocketInstance, handleErrorApi} from '@/lib/utils'
import {useRouter} from '@/navigation'
import {useLoginMutation} from '@/queries/useAuth'
import {LoginBody, LoginBodyType} from '@/schemaValidations/auth.schema'
import {zodResolver} from '@hookform/resolvers/zod'
import {useTranslations} from 'next-intl'
import {useEffect} from 'react'
import {useForm} from 'react-hook-form'

export default function LoginForm() {
  const t = useTranslations('Login')
  const {searchParams, setSearchParams} = useSearchParamsLoader()
  const loginMutation = useLoginMutation()
  const clearTokens = searchParams?.get('clearTokens')
  const setRole = useAppStore((state) => state.setRole)
  const setSocket = useAppStore((state) => state.setSocket)

  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const router = useRouter()

  useEffect(() => {
    if (clearTokens) {
      setRole()
    }
  }, [clearTokens, setRole])

  const onSubmit = async (data: LoginBodyType) => {
    // Khi nhấn ubmit thì React hook form sẽ validate cái form bằng zod schema ở client trước
    // Nếu không có lỗi thì mới gọi api
    if (loginMutation.isPending) return
    try {
      const result = await loginMutation.mutateAsync(data)
      toast({
        description: result.payload.message
      })
      setRole(result.payload.data.account.role)
      setSocket(generateSocketInstance(result.payload.data.accessToken))
      if (result.payload.data.account.role === 'Owner')
        router.push('/manage/dashboard')
      else router.push('/manage/orders')
    } catch (error: any) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  return (
    <Card className="mx-auto max-w-sm w-full">
      <SearchParamsLoader onParamsReceived={setSearchParams} />
      <CardHeader>
        <CardTitle className="text-2xl text-center">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-2 max-w-[600px] flex-shrink-0 w-full"
            noValidate
            onSubmit={form.handleSubmit(onSubmit, (err) => {
              console.warn(err)
            })}
            method="post"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({field}) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <Label htmlFor="email">{t('email')}</Label>
                      <Input id="email" type="email" required {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({field}) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">{t('password')}</Label>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        required
                        {...field}
                      />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {t('login')}
              </Button>
            </div>
          </form>
        </Form>
        <div className="text-center mt-4">
          <a href="/forgot-password" className="text-blue-600">
            {t('forgotPassword')}
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
