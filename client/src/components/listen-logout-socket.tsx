import {useAppStore} from '@/components/app-provider'
import {handleErrorApi} from '@/lib/utils'
import {useLogoutMutation} from '@/queries/useAuth'
import {usePathname, useRouter} from '@/navigation'
import {useEffect} from 'react'

const UNAUTHENTICATED_PATH = ['/login', 'logout', '/refresh-token']

export default function ListenLogoutSocket() {
  const {isPending, mutateAsync} = useLogoutMutation()
  const pathname = usePathname()
  const router = useRouter()
  const setRole = useAppStore((state) => state.setRole)
  const socket = useAppStore((state) => state.socket)
  const disconnectSocket = useAppStore((state) => state.disconnectSocket)

  useEffect(() => {
    if (UNAUTHENTICATED_PATH.includes(pathname)) return

    async function onLogout() {
      if (isPending) return
      try {
        await mutateAsync()
        setRole()
        disconnectSocket()
        router.push('/')
      } catch (error: any) {
        handleErrorApi(error)
      }
    }

    socket?.on('logout', onLogout)
    return () => {
      socket?.off('logout', onLogout)
    }
  }, [
    socket,
    pathname,
    isPending,
    router,
    setRole,
    mutateAsync,
    disconnectSocket
  ])
  return null
}
