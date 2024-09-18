'use client'

import {Dialog, DialogContent} from '@/components/ui/dialog'
import {useRouter} from 'next/navigation'
import React, {useState} from 'react'

export default function Modal({children}: {children: React.ReactNode}) {
  const router = useRouter()
  const [open, setOpen] = useState(true)

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open)
        if (!open) router.back()
      }}
    >
      <DialogContent className="max-w-2xl h-120  overflow-auto bg-white rounded-lg shadow-lg p-12">
        {children}
      </DialogContent>
    </Dialog>
  )
}
