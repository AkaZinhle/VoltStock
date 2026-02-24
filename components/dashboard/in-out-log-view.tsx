"use client"
import React, { useEffect, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownLeft, ArrowUpRight, Loader2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"

interface LogItem {
    date: string
    id: number
    item: string
    quantity: number
    value: number
    source_customer: string
    responsible: string
    total_value: number
}

interface SummaryStats {
    total_inbound_30d: number
    total_outbound_30d: number
}

// Helper type for sorting
type SortConfig = {
    key: keyof LogItem | null
    direction: 'asc' | 'desc' | null
}

export function InOutLogView() {
    const [inboundData, setInboundData] = useState<LogItem[]>([])
    const [outboundData, setOutboundData] = useState<LogItem[]>([])
    const [stats, setStats] = useState<SummaryStats>({ total_inbound_30d: 0, total_outbound_30d: 0 })
    const [loading, setLoading] = useState(true)

    // State for tri-state sorting
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, inboundRes, outboundRes] = await Promise.all([
                    fetch('http://localhost:8000/api/stats'),
                    fetch('http://localhost:8000/api/logs/inbound'),
                    fetch('http://localhost:8000/api/logs/outbound')
                ])
                const statsData = await statsRes.json()
                const inboundJson = await inboundRes.json()
                const outboundJson = await outboundRes.json()

                setStats(statsData)
                setInboundData(inboundJson)
                setOutboundData(outboundJson)
            } catch (error) {
                console.error("Failed to fetch data from backend:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Sorting Logic
    const requestSort = (key: keyof LogItem) => {
        let direction: 'asc' | 'desc' | null = 'asc'

        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') direction = 'desc'
            else if (sortConfig.direction === 'desc') direction = null // Third click: Reset
        }

        setSortConfig({ key: direction ? key : null, direction })
    }

    const getSortedData = (data: LogItem[]) => {
        if (!sortConfig.key || !sortConfig.direction) return data

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key!]
            const bValue = b[sortConfig.key!]

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
    }

    const sortedInbound = useMemo(() => getSortedData(inboundData), [inboundData, sortConfig])
    const sortedOutbound = useMemo(() => getSortedData(outboundData), [outboundData, sortConfig])

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
    }

    // Sort Indicator Component
    const SortIcon = ({ columnKey }: { columnKey: keyof LogItem }) => {
        if (sortConfig.key !== columnKey) return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        if (sortConfig.direction === 'asc') return <ChevronUp className="ml-2 h-4 w-4 text-primary" />
        return <ChevronDown className="ml-2 h-4 w-4 text-primary" />
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">In & Out Log</h2>
                <p className="text-muted-foreground">Track all inventory movements</p>
            </div>

            {/* Summary Bar Remains the same... */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-card border-border">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-500/20">
                            <ArrowDownLeft className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Inbound Value (Last 30 Days)</p>
                            <p className="text-2xl font-bold text-foreground">
                                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatCurrency(stats.total_inbound_30d)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/20">
                            <ArrowUpRight className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Outbound Value (Last 30 Days)</p>
                            <p className="text-2xl font-bold text-foreground">
                                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatCurrency(stats.total_outbound_30d)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="inbound" className="w-full">
                <TabsList className="bg-secondary border border-border">
                    <TabsTrigger value="inbound" className="data-[state=active]:bg-primary">
                        <ArrowDownLeft className="h-4 w-4 mr-2" /> Inbound
                    </TabsTrigger>
                    <TabsTrigger value="outbound" className="data-[state=active]:bg-primary">
                        <ArrowUpRight className="h-4 w-4 mr-2" /> Outbound
                    </TabsTrigger>
                </TabsList>

                {/* Shared Table Header Logic applied to both TabsContent */}
                {[
                    { value: 'inbound', data: sortedInbound, refPrefix: 'IN-' },
                    { value: 'outbound', data: sortedOutbound, refPrefix: 'OUT-' }
                ].map((tab) => (
                    <TabsContent key={tab.value} value={tab.value} className="mt-4">
                        <Card className="bg-card border-border">
                            <CardContent className="p-0">
                                <div className="relative w-full overflow-auto" style={{ maxHeight: '600px' }}>
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                                            <TableRow className="border-border hover:bg-transparent">
                                                <TableHead onClick={() => requestSort('date')} className="cursor-pointer hover:text-foreground">
                                                    <div className="flex items-center">Date <SortIcon columnKey="date" /></div>
                                                </TableHead>
                                                <TableHead onClick={() => requestSort('id')} className="cursor-pointer hover:text-foreground">
                                                    <div className="flex items-center">Ref ID <SortIcon columnKey="id" /></div>
                                                </TableHead>
                                                <TableHead onClick={() => requestSort('item')} className="cursor-pointer hover:text-foreground">
                                                    <div className="flex items-center">Item <SortIcon columnKey="item" /></div>
                                                </TableHead>
                                                <TableHead onClick={() => requestSort('source_customer')} className="cursor-pointer hover:text-foreground">
                                                    <div className="flex items-center">{tab.value === 'inbound' ? 'Source' : 'Customer'} <SortIcon columnKey="source_customer" /></div>
                                                </TableHead>
                                                <TableHead onClick={() => requestSort('quantity')} className="text-right cursor-pointer hover:text-foreground">
                                                    <div className="flex items-center justify-end">Qty <SortIcon columnKey="quantity" /></div>
                                                </TableHead>
                                                <TableHead onClick={() => requestSort('total_value')} className="text-right cursor-pointer hover:text-foreground">
                                                    <div className="flex items-center justify-end">Total <SortIcon columnKey="total_value" /></div>
                                                </TableHead>
                                                <TableHead onClick={() => requestSort('responsible')} className="cursor-pointer hover:text-foreground">
                                                    <div className="flex items-center">Staff <SortIcon columnKey="responsible" /></div>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow><TableCell colSpan={7} className="text-center h-24">Loading...</TableCell></TableRow>
                                            ) : tab.data.map((row) => (
                                                <TableRow key={row.id} className="border-border">
                                                    <TableCell className="text-muted-foreground">{row.date}</TableCell>
                                                    <TableCell className={`font-mono text-sm ${tab.value === 'inbound' ? 'text-green-400' : 'text-primary'}`}>{tab.refPrefix}{row.id}</TableCell>
                                                    <TableCell className="font-medium text-foreground">{row.item}</TableCell>
                                                    <TableCell className="text-foreground">{row.source_customer}</TableCell>
                                                    <TableCell className="text-right text-foreground">{row.quantity}</TableCell>
                                                    <TableCell className="text-right text-foreground font-medium">{formatCurrency(row.total_value)}</TableCell>
                                                    <TableCell className="text-muted-foreground">{row.responsible}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}