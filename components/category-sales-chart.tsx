"use client"

import { Card } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface CategorySalesChartProps {
  data: any[]
}

export function CategorySalesChart({ data }: CategorySalesChartProps) {
  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--primary) / 0.8)",
    "hsl(var(--primary) / 0.6)",
    "hsl(var(--primary) / 0.4)",
    "hsl(var(--primary) / 0.2)",
    "hsl(var(--secondary))",
    "hsl(var(--secondary) / 0.8)",
    "hsl(var(--secondary) / 0.6)",
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="revenue"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <Card className="p-2 border shadow-sm">
                  <div className="text-sm font-medium">{payload[0].name}</div>
                  <div className="text-sm text-muted-foreground">Pendapatan: {formatCurrency(payload[0].value)}</div>
                </Card>
              )
            }
            return null
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
