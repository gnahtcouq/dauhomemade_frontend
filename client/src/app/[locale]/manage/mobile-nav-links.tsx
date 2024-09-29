'use client'
import menuItems from '@/app/[locale]/manage/menuItems'
import {useAppStore} from '@/components/app-provider'
import {Button} from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import {cn} from '@/lib/utils'
import {PanelLeft} from 'lucide-react'
import Image from 'next/image'
import {Link} from '@/navigation'
import {usePathname} from '@/navigation'
import {VisuallyHidden} from '@radix-ui/react-visually-hidden'

export default function MobileNavLinks() {
  const pathname = usePathname()
  const role = useAppStore((state) => state.role)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <SheetTitle>
          <VisuallyHidden>Menu</VisuallyHidden>
        </SheetTitle>
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <Image
              src="/logo.png"
              width={50}
              height={50}
              alt="Banner"
              className="h-auto w-12 transition-all group-hover:scale-110"
            />
            <span className="sr-only">Acme Inc</span>
          </Link>
          {menuItems.map((Item, index) => {
            const isActive = pathname === Item.href
            if (!Item.roles.includes(role as any)) return null
            return (
              <Link
                key={index}
                href={Item.href}
                className={cn(
                  'flex items-center gap-4 px-2.5  hover:text-foreground',
                  {
                    'text-foreground': isActive,
                    'text-muted-foreground': !isActive
                  }
                )}
              >
                <Item.Icon className="h-5 w-5" />
                {Item.title}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
