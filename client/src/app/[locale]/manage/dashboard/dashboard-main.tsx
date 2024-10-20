'use client'

import {DishBarChart} from '@/app/[locale]/manage/dashboard/dish-bar-chart'
import {RevenueLineChart} from '@/app/[locale]/manage/dashboard/revenue-line-chart'
import {Button} from '@/components/ui/button'
import {Calendar} from '@/components/ui/calendar'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {formatCurrency} from '@/lib/utils'
import {useDashboardIndicator} from '@/queries/useIndicator'
import {endOfDay, format, startOfDay} from 'date-fns'
import {useTranslations} from 'next-intl'
import {useState} from 'react'

const initFromDate = startOfDay(new Date())
const initToDate = endOfDay(new Date())

export default function DashboardMain() {
  const t = useTranslations('Dashboard')
  const [fromDate, setFromDate] = useState(initFromDate)
  const [toDate, setToDate] = useState(initToDate)
  const {data} = useDashboardIndicator({fromDate, toDate})
  const revenue = data?.payload?.data?.revenue ?? 0
  const guestCount = data?.payload?.data?.guestCount ?? 0
  const orderCount = data?.payload?.data?.orderCount ?? 0
  const orderPaidCount = data?.payload?.data?.orderPaidCount ?? 0
  const servingTableCount = data?.payload?.data?.servingTableCount ?? 0
  const revenueByDate = data?.payload?.data?.revenueByDate ?? []
  const dishIndicator = data?.payload?.data?.dishIndicator ?? []

  const resetDateFilter = () => {
    setFromDate(initFromDate)
    setToDate(initToDate)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center">
          <span className="mr-2">{t('fromDate')}</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={'outline'} className="w-[240px] text-left">
                {format(fromDate, 'dd/MM/yyyy HH:mm')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={(date) => {
                  if (date) {
                    setFromDate(startOfDay(date))
                    setToDate(endOfDay(date))
                  }
                }}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center">
          <span className="mr-2">{t('toDate')}</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={'outline'} className="w-[240px] text-left">
                {format(toDate, 'dd/MM/yyyy HH:mm')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={(date) => {
                  if (date) {
                    setToDate(endOfDay(date))
                  }
                }}
                disabled={(date) => date < fromDate || date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button className="" variant={'outline'} onClick={resetDateFilter}>
          Reset
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalRevenue.title')}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenue)}</div>
            <p className="text-xs text-muted-foreground">
              {t('totalRevenue.description')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalGuests.title')}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guestCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('totalGuests.description')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalOrders.title')}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderPaidCount}/{orderCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('totalOrders.description')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalTables.title')}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servingTableCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('totalTables.description')}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <div className="lg:col-span-4">
          <RevenueLineChart chartData={revenueByDate} />
        </div>
        <div className="lg:col-span-4">
          <DishBarChart chartData={dishIndicator} />
        </div>
      </div>
    </div>
  )
}
