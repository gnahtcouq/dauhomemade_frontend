import DropdownAvatar from '@/app/[locale]/manage/dropdown-avatar'
import MobileNavLinks from '@/app/[locale]/manage/mobile-nav-links'
import NavLinks from '@/app/[locale]/manage/nav-links'
import Notification from '@/app/[locale]/manage/notification'
import DarkModeToggle from '@/components/dark-mode-toggle'
import SwitchLanguage from '@/components/switch-language'
import {Link} from '@/navigation'

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <NavLinks />
      <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-24">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <MobileNavLinks />
          <div className="relative ml-auto flex-1 md:grow-0">
            <div className="ml-auto flex items-center gap-4">
              <SwitchLanguage />
              <Notification />
              <DarkModeToggle />
            </div>
          </div>
          <DropdownAvatar />
        </header>
        <main className="flex-1">{children}</main>
      </div>
      <footer className="flex items-center justify-center h-16 border-t bg-background">
        <p className="text-center text-sm text-muted-foreground">
          Made by{' '}
          <Link
            href="https://github.com/gnahtcouq"
            target="_blank"
            className="text-foreground"
          >
            @gnahtcouq
          </Link>
        </p>
      </footer>
    </div>
  )
}
