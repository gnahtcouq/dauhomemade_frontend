'use client'

import authApiRequest from '@/apiRequests/auth'
import guestApiRequest from '@/apiRequests/guest'
import ListenLogoutSocket from '@/components/listen-logout-socket'
import RefreshToken from '@/components/refresh-token'
import {Role} from '@/constants/type'
import {
  decodeToken,
  generateSocketInstance,
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  removeTokensFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage
} from '@/lib/utils'
import {RoleType} from '@/types/jwt.types'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import {Analytics} from '@vercel/analytics/react'
import {SpeedInsights} from '@vercel/speed-insights/next'
import React, {useEffect, useRef} from 'react'
import {Socket} from 'socket.io-client'
import {create} from 'zustand'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
      // refetchOnMount: false
    }
  }
})

// const AppContext = createContext({
//   isAuth: false,
//   role: undefined as RoleType | undefined,
//   setRole: (role?: RoleType | undefined) => {},
//   socket: undefined as Socket | undefined,
//   setSocket: (socket?: Socket | undefined) => {},
//   disconnectSocket: () => {}
// })

type AppStoreType = {
  isAuth: boolean
  role: RoleType | undefined
  setRole: (role?: RoleType | undefined) => void
  socket: Socket | undefined
  setSocket: (socket?: Socket | undefined) => void
  disconnectSocket: () => void
}

export const useAppStore = create<AppStoreType>((set) => ({
  isAuth: false,
  role: undefined as RoleType | undefined,
  setRole: (role?: RoleType | undefined) => {
    set({role, isAuth: Boolean(role)})
    if (!role) removeTokensFromLocalStorage()
  },
  socket: undefined as Socket | undefined,
  setSocket: (socket?: Socket | undefined) => set({socket}),
  disconnectSocket: () =>
    set((state) => {
      state.socket?.disconnect()
      return {socket: undefined}
    })
}))

// export const useAppContext = () => {
//   return useContext(AppContext)
// }

export default function AppProvider({children}: {children: React.ReactNode}) {
  // const [socket, setSocket] = useState<Socket | undefined>()
  // const [role, setRoleState] = useState<RoleType | undefined>()
  const setRole = useAppStore((state) => state.setRole)
  const setSocket = useAppStore((state) => state.setSocket)

  const count = useRef(0)

  useEffect(() => {
    const fetchData = async () => {
      if (count.current === 0) {
        const accessToken = getAccessTokenFromLocalStorage()
        const refreshToken = getRefreshTokenFromLocalStorage()
        const now = Math.floor(new Date().getTime() / 1000) - 1
        if (accessToken && refreshToken) {
          const role = decodeToken(accessToken).role
          setRole(role)
          if (
            decodeToken(accessToken).exp < now &&
            decodeToken(refreshToken).exp > now
          ) {
            const res =
              role === Role.Guest
                ? await guestApiRequest.refreshToken()
                : await authApiRequest.refreshToken()
            setAccessTokenToLocalStorage(res.payload.data.accessToken)
            setRefreshTokenToLocalStorage(res.payload.data.refreshToken)
            console.log('Refresh token success')
          }
          setSocket(generateSocketInstance(accessToken))
        }
        count.current++
      }
    }
    fetchData()
  }, [setRole, setSocket])

  // const disconnectSocket = useCallback(() => {
  //   socket?.disconnect()
  //   setSocket(undefined)
  // }, [socket, setSocket])

  // const setRole = useCallback((role?: RoleType | undefined) => {
  //   setRoleState(role)
  //   if (!role) removeTokensFromLocalStorage()
  // }, [])

  // const isAuth = Boolean(role)

  return (
    // <AppContext.Provider
    //   value={{role, setRole, isAuth, socket, setSocket, disconnectSocket}}
    // >
    <QueryClientProvider client={queryClient}>
      {children}
      <SpeedInsights />
      <Analytics />
      <RefreshToken />
      <ListenLogoutSocket />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    // </AppContext.Provider>
  )
}
