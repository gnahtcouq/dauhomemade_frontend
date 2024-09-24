'use client'

import {useRouter} from '@/navigation'
import {useEffect} from 'react'

export default function PaymentSuccess() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/')
    }, 5000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl text-center">
        <h1 className="text-2xl font-semibold text-green-500 dark:text-green-400 mb-4">
          Thanh toán thành công!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Bạn sẽ được chuyển hướng
          về trang chủ trong giây lát...
        </p>

        <button
          onClick={() => router.push('/')}
          className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Về trang chủ ngay
        </button>
      </div>
    </div>
  )
}
