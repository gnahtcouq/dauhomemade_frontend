import dishApiRequest from '@/apiRequests/dish'
import Modal from '@/app/(public)/@modal/(.)dishes/[id]/modal'
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

  return (
    <Modal>
      <DishDetail dish={dish} />
    </Modal>
  )
}
