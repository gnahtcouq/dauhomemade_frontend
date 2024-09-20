import {formatCurrency} from '@/lib/utils'
import {DishResType} from '@/schemaValidations/dish.schema'
import Image from 'next/image'

export default async function DishDetail({
  dish
}: {
  dish: DishResType['data'] | undefined
}) {
  if (!dish) {
    return (
      <div className="flex items-center justify-center">
        <h1 className="text-2xl lg:text-3xl font-semibold">
          Xin lỗi, nhà Đậu chưa có món này rồi!
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
          title={dish.name}
        />
      </div>
      <div className="flex-1 space-y-2">
        <h1 className="text-2xl lg:text-3xl font-semibold">{dish.name}</h1>
        <p className="text-xl font-semibold text-red-600 dark:text-red-400">
          {formatCurrency(dish.price)}
        </p>
        <div className="flex justify-between">
          <p className="text-justify">{dish.description}</p>
        </div>
      </div>
    </div>
  )
}
