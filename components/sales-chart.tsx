"use client"

import { Card } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface SalesChartProps {
  data: any[]
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" className="text-xs text-muted-foreground" />
        <YAxis className="text-xs text-muted-foreground" tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <Card className="p-2 border shadow-sm">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-sm text-muted-foreground">Penjualan: {formatCurrency(payload[0].value)}</div>
                </Card>
              )
            }
            return null
          }}
        />
        <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
