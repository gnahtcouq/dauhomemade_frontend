'use client'

import {Card} from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import {formatCurrency, generateSlugUrl} from '@/lib/utils'
import {Link} from '@/navigation'
import {DishListResType} from '@/schemaValidations/dish.schema'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import React, {useMemo, useRef} from 'react'

interface CarouselSectionProps {
  displayedDishesCarousel: DishListResType['data']
}

const CarouselSection: React.FC<CarouselSectionProps> = ({
  displayedDishesCarousel
}) => {
  const plugin = useRef(Autoplay({delay: 5000, stopOnInteraction: false}))
  const carouselItems = useMemo(() => {
    return displayedDishesCarousel.map((dish) => (
      <CarouselItem key={dish.id} className="md:basis-1/2 lg:basis-1/3">
        <div className="p-1">
          <Link
            href={`/dishes/${generateSlugUrl({
              name: dish.name,
              id: dish.id
            })}`}
          >
            <Card className="h-full flex flex-col relative overflow-hidden">
              <Image
                src={dish.image}
                width={300}
                height={300}
                alt={dish.name}
                loading="lazy"
                className="object-cover w-full h-[300px] rounded-md"
              />
              <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-xl font-semibold text-white">
                  {dish.name}
                </h3>
                <p className="font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(dish.price)}
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </CarouselItem>
    ))
  }, [displayedDishesCarousel])

  return (
    <Carousel
      opts={{
        align: 'start'
      }}
      plugins={[plugin.current]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={() => {
        plugin.current.play()
      }}
      className="w-full max-w-screen-lg mx-auto"
      style={{willChange: 'transform'}}
    >
      <CarouselContent>{carouselItems}</CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

export default CarouselSection
