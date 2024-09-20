import Logout from '@/app/[locale]/(public)/(auth)/logout/logout'
import {Metadata} from 'next'
import {Suspense} from 'react'

export const metadata: Metadata = {
  title: 'Logout Redirect',
  description: 'Logout Redirect',
  robots: {
    index: false
  }
}

export default function LogoutPage() {
  return (
    <Suspense>
      <Logout />
    </Suspense>
  )
}
