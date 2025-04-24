"use client"

import { Card } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface ProductSalesChartProps {
  data: any[]
}

export function ProductSalesChart({ data }: ProductSalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 10,
          right: 30,
          left: 100,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
        <XAxis type="number" className="text-xs text-muted-foreground" />
        <YAxis
          type="category"
          dataKey="name"
          className="text-xs text-muted-foreground"
          width={100}
          tickFormatter={(value) => (value.length > 15 ? `${value.substring(0, 15)}...` : value)}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <Card className="p-2 border shadow-sm">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-sm text-muted-foreground">Jumlah: {payload[0].value}</div>
                  <div className="text-sm text-muted-foreground">Pendapatan: {formatCurrency(payload[1].value)}</div>
                </Card>
              )
            }
            return null
          }}
        />
        <Bar dataKey="quantitySold" fill="hsl(var(--primary) / 0.7)" name="Jumlah" />
        <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Pendapatan" />
      </BarChart>
    </ResponsiveContainer>
  )
}
