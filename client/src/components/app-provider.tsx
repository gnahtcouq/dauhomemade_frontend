'use client'

import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import RefreshToken from '@/components/refresh-token'
import {
  decodeToken,
  generateSocketInstance,
  getAccessTokenFromLocalStorage,
  removeTokensFromLocalStorage
} from '@/lib/utils'
import {RoleType} from '@/types/jwt.types'
import {Socket} from 'socket.io-client'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
      // refetchOnMount: false
    }
  }
})

const AppContext = createContext({
  isAuth: false,
  role: undefined as RoleType | undefined,
  setRole: (role?: RoleType | undefined) => {},
  socket: undefined as Socket | undefined,
  setSocket: (socket?: Socket | undefined) => {}
})

export const useAppContext = () => {
  return useContext(AppContext)
}

export default function AppProvider({children}: {children: React.ReactNode}) {
  const [socket, setSocket] = useState<Socket | undefined>()
  const [role, setRoleState] = useState<RoleType | undefined>()

  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage()
    if (accessToken) {
      const role = decodeToken(accessToken).role
      setRoleState(role)
      setSocket(generateSocketInstance(accessToken))
    }
  }, [])

  const setRole = useCallback((role?: RoleType | undefined) => {
    setRoleState(role)
    if (!role) removeTokensFromLocalStorage()
  }, [])

  const isAuth = Boolean(role)

  return (
    <AppContext.Provider value={{role, setRole, isAuth, socket, setSocket}}>
      <QueryClientProvider client={queryClient}>
        {children}
        <RefreshToken />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AppContext.Provider>
  )
}
