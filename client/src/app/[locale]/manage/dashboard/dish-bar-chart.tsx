'use client'

import {Bar, BarChart, Text, XAxis, YAxis} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import {DashboardIndicatorResType} from '@/schemaValidations/indicator.schema'
import {useMemo} from 'react'
import {useTranslations} from 'next-intl'

const colors = [
  'var(--color-chrome)',
  'var(--color-firefox)',
  'var(--color-safari)',
  'var(--color-edge)',
  'var(--color-other)'
]

const chartConfig = {
  visitors: {
    label: 'Visitors'
  },
  chrome: {
    label: 'Chrome',
    color: 'hsl(var(--chart-1))'
  },
  safari: {
    label: 'Safari',
    color: 'hsl(var(--chart-2))'
  },
  firefox: {
    label: 'Firefox',
    color: 'hsl(var(--chart-3))'
  },
  edge: {
    label: 'Edge',
    color: 'hsl(var(--chart-4))'
  },
  other: {
    label: 'Other',
    color: 'hsl(var(--chart-5))'
  }
} satisfies ChartConfig

const CustomYAxisTick = (props: any) => {
  const {x, y, payload} = props
  return (
    <g transform={`translate(${x},${y})`}>
      <Text x={0} y={0} dy={16} textAnchor="end" transform="rotate(-45)">
        {payload.value}
      </Text>
    </g>
  )
}

export function DishBarChart({
  chartData
}: {
  chartData: Pick<
    DashboardIndicatorResType['data']['dishIndicator'][0],
    'name' | 'successOrders'
  >[]
}) {
  const chartDataColors = useMemo(
    () =>
      chartData.map((data, index) => {
        return {
          ...data,
          fill: colors[index] ?? colors[colors.length - 1]
        }
      }),
    [chartData]
  )
  const t = useTranslations('Dashboard')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dishesChart.title')}</CardTitle>
        <CardDescription>{t('dishesChart.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartDataColors}
            layout="vertical"
            margin={{
              left: 100,
              right: 20,
              top: 20,
              bottom: 20
            }}
          >
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              tickFormatter={(value) => {
                return value
              }}
              tick={<CustomYAxisTick />}
            />
            <XAxis dataKey="successOrders" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="successOrders"
              name={'Đơn thanh toán:'}
              layout="vertical"
              radius={[0, 5, 5, 0]}
              label={{position: 'right', fontSize: 12}} // Hiển thị nhãn bên phải của thanh
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
    </Card>
  )
}
