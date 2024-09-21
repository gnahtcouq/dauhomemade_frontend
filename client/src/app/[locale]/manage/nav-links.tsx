'use client'
import menuItems from '@/app/[locale]/manage/menuItems'
import {useAppStore} from '@/components/app-provider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {cn} from '@/lib/utils'
import {Settings} from 'lucide-react'
import Image from 'next/image'
import {Link} from '@/navigation'
import {usePathname} from '@/navigation'

export default function NavLinks() {
  const pathname = usePathname()
  const role = useAppStore((state) => state.role)

  return (
    <TooltipProvider>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-24 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 py-2">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-12 md:w-12 md:text-base"
          >
            <Image
              src="/logo.png"
              width={50}
              height={50}
              quality={100}
              alt="Banner"
              className="h-12 w-12 transition-all group-hover:scale-110"
            />
            <span className="sr-only">Acme Inc</span>
          </Link>

          {menuItems.map((Item, index) => {
            const isActive = pathname === Item.href
            if (!Item.roles.includes(role as any)) return null
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link
                    href={Item.href}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8',
                      {
                        'bg-accent text-accent-foreground': isActive,
                        'text-muted-foreground': !isActive
                      }
                    )}
                  >
                    <Item.Icon className="h-5 w-5" />
                    <span className="sr-only">{Item.title}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{Item.title}</TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/manage/setting"
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg  transition-colors hover:text-foreground md:h-8 md:w-8',
                  {
                    'bg-accent text-accent-foreground':
                      pathname === '/manage/setting',
                    'text-muted-foreground': pathname !== '/manage/setting'
                  }
                )}
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Cài đặt</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Cài đặt</TooltipContent>
          </Tooltip>
        </nav>
      </aside>
    </TooltipProvider>
  )
}
