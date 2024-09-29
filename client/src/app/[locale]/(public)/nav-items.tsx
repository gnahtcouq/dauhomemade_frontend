'use client'

import {useAppStore} from '@/components/app-provider'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import {Role} from '@/constants/type'
import {cn, handleErrorApi} from '@/lib/utils'
import {Link, useRouter} from '@/navigation'
import {useLogoutMutation} from '@/queries/useAuth'
import {RoleType} from '@/types/jwt.types'
import {useTranslations} from 'next-intl'
import React from 'react'

export default function NavItems({className}: {className?: string}) {
  const t = useTranslations('NavItems')

  const menuItems: {
    title: string
    href: string
    role?: RoleType[]
    hiddenWhenLogin?: boolean
    // authRequired?: boolean
  }[] = [
    {
      title: t('home'),
      href: '/'
    },
    {
      title: t('menu'),
      href: '/guest/menu',
      role: [Role.Guest]
    },
    {
      title: t('orders'),
      href: '/guest/orders',
      role: [Role.Guest]
    },
    {
      title: t('login'),
      href: '/login',
      hiddenWhenLogin: true
    },
    {
      title: t('manage'),
      href: '/manage/dashboard',
      role: [Role.Owner]
    },
    {
      title: t('orders'),
      href: '/manage/orders',
      role: [Role.Employee]
    }
  ]

  const role = useAppStore((state) => state.role)
  const setRole = useAppStore((state) => state.setRole)
  const disconnectSocket = useAppStore((state) => state.disconnectSocket)
  const logoutMutation = useLogoutMutation()
  const router = useRouter()

  const logout = async () => {
    if (logoutMutation.isPending) return
    try {
      await logoutMutation.mutateAsync()
      setRole()
      disconnectSocket()
      router.push('/')
    } catch (error: any) {
      handleErrorApi(error)
    }
  }

  return (
    <>
      {menuItems.map((item) => {
        // Truờng hợp đăng nhập thì chỉ hiển thị menu đăng nhập
        const isAuth = item.role && role && item.role.includes(role)
        // Trường hợp menu item có thể hiển thị dù cho đã đăng nhập hay chưa
        const canShow =
          (item.role === undefined && !item.hiddenWhenLogin) ||
          (item.hiddenWhenLogin && !role)
        if (isAuth || canShow) {
          return (
            <Link href={item.href} key={item.href} className={className}>
              {item.title}
            </Link>
          )
        }
        return null
      })}
      {role && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className={cn(className, 'cursor-pointer')}>
              {t('logout.title')}
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('logout.message')}</AlertDialogTitle>
              {role === Role.Guest && (
                <AlertDialogDescription>
                  {t('logout.description')}
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('logout.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={logout}>
                {t('logout.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
