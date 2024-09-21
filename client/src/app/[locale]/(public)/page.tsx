import dishApiRequest from '@/apiRequests/dish'
import {DishListResType} from '@/schemaValidations/dish.schema'
import Image from 'next/image'
import {Link} from '@/navigation'
import {getTranslations} from 'next-intl/server'
import {
  formatCurrency,
  generateSlugUrl,
  htmlToTextForDescription,
  truncateDescription
} from '@/lib/utils'
import {unstable_setRequestLocale} from 'next-intl/server'
import {Locale} from '@/config'

export async function generateMetadata({
  params: {locale}
}: {
  params: {locale: Locale}
}) {
  const t = await getTranslations({locale, namespace: 'HomePage'})

  return {
    title: t('title'),
    description: htmlToTextForDescription(t('description'))
  }
}

export default async function Home({
  params: {locale}
}: {
  params: {
    locale: string
  }
}) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('HomePage')
  let dishList: DishListResType['data'] = []
  try {
    const result = await dishApiRequest.list()
    const {
      payload: {data}
    } = result
    dishList = data
  } catch (error) {
    return <div>Đã có lỗi xảy ra</div>
  }

  // Chỉ lấy ra 6 món ăn đầu tiên
  const displayedDishes = dishList.slice(0, 6)

  return (
    <div className="w-full space-y-4">
      <section className="relative z-10">
        <span className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></span>
        <Image
          src="/banner.jpg"
          width={1200}
          height={600}
          quality={100}
          alt="Banner"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="z-20 relative py-10 md:py-20 px-4 sm:px-10 md:px-20">
          <h1 className="text-center text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white">
            ĐẬU HOMEMADE
          </h1>
          <p className="text-center text-sm sm:text-base mt-4 text-white">
            {t('description')}
          </p>
        </div>
      </section>
      <section className="space-y-10 py-16">
        <h2 className="text-center text-2xl font-bold">{t('menu')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {displayedDishes.map((dish) => (
            <Link
              href={`/dishes/${generateSlugUrl({
                name: dish.name,
                id: dish.id
              })}`}
              className="flex gap-4 w"
              key={dish.id}
            >
              <div className="flex-shrink-0">
                <Image
                  src={dish.image}
                  width={150}
                  height={150}
                  alt={dish.name}
                  className="object-cover w-[150px] h-[150px] rounded-md"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{dish.name}</h3>
                <p className="">{truncateDescription(dish.description, 150)}</p>
                <p className="font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(dish.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
