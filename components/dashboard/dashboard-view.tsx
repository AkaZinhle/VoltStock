"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, AlertTriangle, Package, RefreshCw, Trophy, DollarSign, Loader2 } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

// Define interface for API response
interface DashboardData {
  total_inventory_value: number
  low_stock_count: number
  pending_orders: number
  turnover_rate: number
  top_selling_item: string
  top_selling_qty: number
  mtd_shipped_value: number
  chart_data: Array<{
    day: string
    inbound: number
    outbound: number
  }>
}

const recentActivities = [
  { id: 1, action: "Low stock alert: Widget A (5 remaining)", time: "2 min ago", type: "alert" },
  { id: 2, action: "Order #1234 shipped to Acme Corp", time: "15 min ago", type: "success" },
  { id: 3, action: "Auto-reorder triggered: Pro Widget X", time: "1 hour ago", type: "info" },
  { id: 4, action: "New shipment received: 500 units", time: "3 hours ago", type: "success" },
]

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/dashboard")
        if (!response.ok) throw new Error("Failed to fetch dashboard data")
        const result = await response.json()
        console.log("Chart Data:", result.chart_data)
        setData(result)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Fallback if data is null (prevents crash)
  if (!data) return <div>Error loading dashboard.</div>

  // Map API data to UI metrics format
  const metrics = [
    {
      title: "Total Inventory Value",
      value: `$${data.total_inventory_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      trend: "+2.3%", // Hardcoded trend for now (requires historical snapshot comparison)
      trendUp: true,
      icon: DollarSign,
    },
    {
      title: "Low Stock Alerts",
      value: data.low_stock_count.toString(),
      subtitle: "items needing reorder",
      icon: AlertTriangle,
      alert: data.low_stock_count > 0,
    },
    {
      title: "Orders Pending Shipment",
      value: data.pending_orders.toString(),
      subtitle: "orders",
      icon: Package,
    },
    {
      title: "Monthly Turnover Rate",
      value: `${data.turnover_rate}%`,
      icon: RefreshCw,
    },
    {
      title: "Top Selling Item",
      value: data.top_selling_item,
      subtitle: `${data.top_selling_qty} units sold (30d)`,
      icon: Trophy,
    },
    {
      title: "Value Shipped (MTD)",
      value: `$${data.mtd_shipped_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your inventory metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className={`text-2xl font-bold ${metric.alert ? "text-primary" : "text-foreground"}`}>
                    {metric.value}
                  </p>
                  {metric.trend && (
                    <p className={`text-xs ${metric.trendUp ? "text-green-500" : "text-primary"}`}>{metric.trend}</p>
                  )}
                  {metric.subtitle && <p className="text-xs text-muted-foreground">{metric.subtitle}</p>}
                </div>
                <div className={`p-2 rounded-lg ${metric.alert ? "bg-primary/20" : "bg-secondary"}`}>
                  <metric.icon className={`h-5 w-5 ${metric.alert ? "text-primary" : "text-muted-foreground"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Inventory Value Flow (In vs. Out)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chart_data}>
                  <defs>
                    {/* Green Gradient for Inbound */}
                    <linearGradient id="inboundGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    {/* Blue/Red Gradient for Outbound */}
                    <linearGradient id="outboundGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ebb216" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ebb216" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#F3F4F6" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inbound"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#inboundGradient)"
                    name="Value In ($)"
                  />
                  <Area
                    type="monotone"
                    dataKey="outbound"
                    stroke="#ebb216"
                    strokeWidth={2}
                    fill="url(#outboundGradient)"
                    name="Value Out ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Critical Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg bg-secondary/50">
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${activity.type === "alert"
                      ? "bg-primary"
                      : activity.type === "success"
                        ? "bg-green-500"
                        : "bg-blue-500"
                      }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}