import dishApiRequest from '@/apiRequests/dish'
import DishDetail from '@/app/[locale]/(public)/dishes/[slug]/dish-detail'
import {getIdFromSlugUrl, wrapServerApi} from '@/lib/utils'

export default async function DishPage({
  params: {slug}
}: {
  params: {
    slug: string
  }
}) {
  const id = getIdFromSlugUrl(slug)
  const data = await wrapServerApi(() => dishApiRequest.getDish(Number(id)))
  const dish = data?.payload?.data
  return <DishDetail dish={dish} />
}
