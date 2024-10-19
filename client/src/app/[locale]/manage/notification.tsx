'use client'

import {useAppStore} from '@/components/app-provider'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {Button} from '@/components/ui/button'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {ScrollArea} from '@/components/ui/scroll-area'
import {formatDateTimeToLocaleString} from '@/lib/utils'
import {
  useDeleteNotificationMutation,
  useGetNotificationList,
  useUpdateMarkAllReadNotificationMutation,
  useUpdateNotificationMutation
} from '@/queries/useOrder'
import {Bell, CheckCircle, Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useState} from 'react'

export default function Notification() {
  const t = useTranslations('Notification')
  const updateNotificationMutation = useUpdateNotificationMutation()
  const updateMarkAllReadNotificationMutation =
    useUpdateMarkAllReadNotificationMutation()
  const deleteNotificationMutation = useDeleteNotificationMutation()
  const notificationListQuery = useGetNotificationList()
  const data = notificationListQuery.data?.payload.data ?? []
  const unreadCount = data.filter((notification) => !notification.isRead).length
  const socket = useAppStore((state) => state.socket)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(10)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleNotificationClick = (notificationId: number, isRead: boolean) => {
    if (isRead) return
    updateNotificationMutation.mutate(notificationId, {
      onSuccess: () => {
        notificationListQuery.refetch()
      }
    })
  }

  const handleMarkAllRead = () => {
    updateMarkAllReadNotificationMutation.mutate(null, {
      onSuccess: () => {
        notificationListQuery.refetch()
      }
    })
  }

  const handleDeleteAllNotifications = () => {
    deleteNotificationMutation.mutate()
    setIsDialogOpen(false)
  }

  useEffect(() => {
    if (socket?.connected) {
      onConnect()
    }

    function onConnect() {
      console.log(socket?.id)
    }

    function onDisconnect() {
      console.log('disconnected')
    }

    function onNewOrder() {
      notificationListQuery.refetch()
    }

    function onPayment() {
      notificationListQuery.refetch()
    }

    socket?.on('new-order', onNewOrder)
    socket?.on('payment', onPayment)
    socket?.on('connect', onConnect)
    socket?.on('disconnect', onDisconnect)

    return () => {
      socket?.off('new-order', onNewOrder)
      socket?.off('payment', onPayment)
      socket?.off('connect', onConnect)
      socket?.off('disconnect', onDisconnect)
    }
  }, [socket, notificationListQuery])

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 10)
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full w-10 h-10 transition-transform duration-200 hover:scale-110"
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <span className="absolute top-[-6px] right-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 max-h-96">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t('title')}</h3>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMarkAllRead}
              disabled={
                updateMarkAllReadNotificationMutation.isPending ||
                data.length === 0 ||
                unreadCount === 0
              }
            >
              <CheckCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDialogOpen(true)}
              disabled={
                deleteNotificationMutation.isPending || data.length === 0
              }
            >
              <Trash2 className="h-5 w-5 text-red-500 dark:text-red-400" />
            </Button>
          </div>
        </div>
        <div className="text-sm">
          <ScrollArea className="h-80">
            {data.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span>{t('noResults')}</span>
              </div>
            ) : (
              <ul className="mt-2 space-y-2">
                {data.slice(0, visibleCount).map((notification) => (
                  <li
                    key={notification.id}
                    onClick={() =>
                      handleNotificationClick(
                        notification.id,
                        notification.isRead
                      )
                    }
                    className={`w-full p-2 cursor-pointer transition-colors duration-200 ${
                      notification.isRead ? 'text-gray-500' : 'font-bold'
                    } hover:bg-gray-100 dark:hover:bg-black flex items-start`}
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 mt-2 ${
                        notification.isRead ? 'invisible' : 'bg-blue-500'
                      }`}
                    ></span>
                    <div className="flex-1 ml-1">
                      <div>{notification.message}</div>
                      <span className="text-xs text-gray-500">
                        {formatDateTimeToLocaleString(notification.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {visibleCount < data.length && (
              <Button
                onClick={handleLoadMore}
                variant="secondary"
                className="mt-2 w-full text-center text-blue-500"
              >
                {t('more')}
              </Button>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllNotifications}>
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Popover>
  )
}
