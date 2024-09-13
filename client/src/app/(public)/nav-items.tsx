'use client'

import {useAppContext} from '@/components/app-provider'
import {Role} from '@/constants/type'
import {cn, handleErrorApi} from '@/lib/utils'
import {useLogoutMutation} from '@/queries/useAuth'
import {RoleType} from '@/types/jwt.types'
import Link from 'next/link'
import {useRouter} from 'next/navigation'

const menuItems: {
  title: string
  href: string
  role?: RoleType[]
  hiddenWhenLogin?: boolean
  // authRequired?: boolean
}[] = [
  {
    title: 'Trang chủ',
    href: '/'
  },
  {
    title: 'Menu',
    href: '/guest/menu',
    role: [Role.Guest]
  },
  {
    title: 'Đăng nhập',
    href: '/login',
    hiddenWhenLogin: true
  },
  {
    title: 'Quản lý',
    href: '/manage/dashboard',
    role: [Role.Owner, Role.Employee]
  }
]

export default function NavItems({className}: {className?: string}) {
  const {role, setRole} = useAppContext()
  const logoutMutation = useLogoutMutation()
  const router = useRouter()
  const logout = async () => {
    if (logoutMutation.isPending) return
    try {
      await logoutMutation.mutateAsync()
      setRole()
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
        <div className={cn(className, 'cursor-pointer')} onClick={logout}>
          <Link href="/logout">Đăng xuất</Link>
        </div>
      )}
    </>
  )
}
