import NavItems from '@/app/[locale]/(public)/nav-items'
import DarkModeToggle from '@/components/dark-mode-toggle'
import {SwitchLanguage} from '@/components/switch-language'
import {Button} from '@/components/ui/button'
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet'
import {Menu} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Layout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode
  modal: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col relative">
      <header className="sticky z-20 top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Image
              src="/logo.png"
              width={50}
              height={50}
              quality={100}
              alt="Banner"
              className="h-12 w-12"
            />
            <span className="sr-only">ĐẬU HOMEMADE</span>
          </Link>
          <NavItems className="text-muted-foreground transition-colors hover:text-foreground flex-shrink-0" />
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Image
                  src="/logo.png"
                  width={50}
                  height={50}
                  quality={100}
                  alt="Banner"
                  className="h-12 w-12"
                />
                <span className="sr-only">ĐẬU HOMEMADE</span>
              </Link>

              <NavItems className="text-muted-foreground transition-colors hover:text-foreground" />
            </nav>
          </SheetContent>
        </Sheet>
        <div className="ml-auto flex items-center gap-4">
          <SwitchLanguage />
          <DarkModeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
        {modal}
      </main>
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
