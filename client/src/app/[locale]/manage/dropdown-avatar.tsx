'use client'

import {useAppStore} from '@/components/app-provider'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {handleErrorApi} from '@/lib/utils'
import {useAccountMe} from '@/queries/useAccount'
import {useLogoutMutation} from '@/queries/useAuth'
import {Link, useRouter} from '@/navigation'
import {useTranslations} from 'next-intl'

export default function DropdownAvatar() {
  const t = useTranslations('DropdownAvatar')
  const logoutMutation = useLogoutMutation()
  const router = useRouter()
  const {data} = useAccountMe()
  const setRole = useAppStore((state) => state.setRole)
  const disconnectSocket = useAppStore((state) => state.disconnectSocket)
  const account = data?.payload.data

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <Avatar>
            <AvatarImage
              src={account?.avatar ?? undefined}
              alt={account?.name}
            />
            <AvatarFallback>
              {account?.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{account?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={'/'} className="cursor-pointer">
            {t('home')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={'/manage/setting'} className="cursor-pointer">
            {t('settings')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          {t('support')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer">
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
