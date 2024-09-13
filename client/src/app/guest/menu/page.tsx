import MenuOrder from '@/app/guest/menu/maneu-order'

export default async function MenuPage() {
  return (
    <div className="max-w-[400px] mx-auto space-y-4">
      <h1 className="text-center text-xl font-bold">Menu nhà ĐẬU</h1>
      <MenuOrder />
    </div>
  )
}
