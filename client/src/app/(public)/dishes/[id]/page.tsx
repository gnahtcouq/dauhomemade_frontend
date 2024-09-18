import dishApiRequest from '@/apiRequests/dish'
import {formatCurrency, wrapServerApi} from '@/lib/utils'
import Image from 'next/image'

export default async function DishPage({
  params: {id}
}: {
  params: {
    id: string
  }
}) {
  const data = await wrapServerApi(() => dishApiRequest.getDish(Number(id)))

  const dish = data?.payload.data
  if (!dish) {
    return (
      <div className="flex items-center justify-center">
        <h1 className="text-2xl lg:text-3xl font-semibold">
          Xin lỗi, nhà ĐẬU chưa có món này rồi!
        </h1>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
      <div className="flex-1 relative overflow-hidden group">
        <Image
          src={dish.image}
          width={700}
          height={700}
          quality={100}
          alt={dish.name}
          className="object-cover w-full h-full rounded-md transition-transform duration-300 transform group-hover:scale-110"
        />
      </div>
      <div className="flex-1 space-y-2">
        <h1 className="text-2xl lg:text-3xl font-semibold">{dish.name}</h1>
        <p className="text-xl font-semibold text-red-600 dark:text-red-400">
          {formatCurrency(dish.price)}
        </p>
        <p>{dish.description}</p>
      </div>
    </div>
  )
}
