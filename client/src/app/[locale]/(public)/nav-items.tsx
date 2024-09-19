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
    title: 'Đơn hàng',
    href: '/guest/orders',
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
    role: [Role.Owner]
  },
  {
    title: 'Đơn hàng',
    href: '/manage/orders',
    role: [Role.Employee]
  }
]

export default function NavItems({className}: {className?: string}) {
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
            <div className={cn(className, 'cursor-pointer')}>Đăng xuất</div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có muốn đăng xuất không?</AlertDialogTitle>
              {role === Role.Guest && (
                <AlertDialogDescription>
                  Việc đăng xuất có thể làm mất đi lịch sử hoá đơn hiện tại của
                  bạn
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huỷ</AlertDialogCancel>
              <AlertDialogAction onClick={logout}>Xác nhận</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
