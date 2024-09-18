import dishApiRequest from '@/apiRequests/dish'
import DishDetail from '@/app/(public)/dishes/dish-detail'
import {wrapServerApi} from '@/lib/utils'

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

  return <DishDetail dish={dish} />
}
