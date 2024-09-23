'use client'

import {Dialog, DialogContent, DialogTitle} from '@/components/ui/dialog'
import {useRouter} from '@/navigation'
import React, {useState} from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

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
      <DialogContent className="max-w-2xl h-120 overflow-auto bg-white dark:bg-black rounded-lg shadow-lg p-12">
        <DialogTitle>
          <VisuallyHidden>Modal Title</VisuallyHidden>
        </DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  )
}
