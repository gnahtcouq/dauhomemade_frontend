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
  getAccessTokenFromLocalStorage,
  removeTokensFromLocalStorage
} from '@/lib/utils'
import {RoleType} from '@/types/jwt.types'

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
  setRole: (role?: RoleType | undefined) => {}
})

export const useAppContext = () => {
  return useContext(AppContext)
}

export default function AppProvider({children}: {children: React.ReactNode}) {
  const [role, setRoleState] = useState<RoleType | undefined>()

  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage()
    if (accessToken) {
      const role = decodeToken(accessToken).role
      setRoleState(role)
    }
  }, [])

  const setRole = useCallback((role?: RoleType | undefined) => {
    setRoleState(role)
    if (!role) removeTokensFromLocalStorage()
  }, [])

  const isAuth = Boolean(role)

  return (
    <AppContext.Provider value={{role, setRole, isAuth}}>
      <QueryClientProvider client={queryClient}>
        {children}
        <RefreshToken />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AppContext.Provider>
  )
}
