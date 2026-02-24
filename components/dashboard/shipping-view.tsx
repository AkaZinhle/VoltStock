"use client"
import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Edit, X, Zap, Loader2, AlertTriangle, Link as LinkIcon, Save } from "lucide-react"

// Types matching the Python API response
interface Order {
    id: string
    customer: string
    items: number
    status: string
    tracking: string
    date: string
}

// New Interface for Automations based on your MongoDB structure
interface AutomationRule {
    id: string
    sku: string
    type: "stock" | "repeat"
    condition: number
    amount: number
    source_name: string
    source_link: string
    status: "active" | "disabled"
    linked_items?: Array<{
        name: string
        category: string
    }>
}

const statusColors: Record<string, string> = {
    Processing: "bg-primary/20 text-primary border-primary/30",
    Shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Delivered: "bg-green-500/20 text-green-400 border-green-500/30",
}

export function ShippingView() {
    const [orders, setOrders] = useState<Order[]>([])
    const [automations, setAutomations] = useState<AutomationRule[]>([])

    const [loading, setLoading] = useState(true)
    const [loadingAuto, setLoadingAuto] = useState(true)

    // Modal States
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // New Rule Form State
    const [newRule, setNewRule] = useState({
        sku: "",
        type: "stock",
        condition: "",
        amount: "",
        source_name: "",
        source_link: "",
        status: "active"
    })

    // Fetch data from Python backend
    useEffect(() => {
        fetchOrders()
        fetchAutomations()
    }, [])

    const fetchOrders = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/orders")
            if (response.ok) {
                const data = await response.json()
                setOrders(data)
            }
        } catch (error) {
            console.error("Error fetching orders:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchAutomations = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/automations")
            if (response.ok) {
                const data = await response.json()
                setAutomations(data)
            }
        } catch (error) {
            console.error("Error fetching automations:", error)
        } finally {
            setLoadingAuto(false)
        }
    }

    // Handle Create Automation
    const handleCreateRule = async () => {
        try {
            // Basic validation
            if (!newRule.sku || !newRule.condition || !newRule.amount) return

            const payload = {
                ...newRule,
                condition: parseInt(newRule.condition),
                amount: parseInt(newRule.amount)
            }

            const response = await fetch("http://localhost:8000/api/automations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                const created = await response.json()
                setAutomations([...automations, created])
                setIsCreateModalOpen(false)
                // Reset form
                setNewRule({
                    sku: "", type: "stock", condition: "", amount: "", source_name: "", source_link: "", status: "active"
                })
            }
        } catch (error) {
            console.error("Error creating rule", error)
        }
    }

    // Handle Delete Interaction
    const promptDelete = (id: string) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        if (!deleteId) return
        try {
            const response = await fetch(`http://localhost:8000/api/orders/${deleteId}`, {
                method: "DELETE",
            })
            if (response.ok) {
                setOrders(orders.filter((o) => o.id !== deleteId))
                setIsDeleteModalOpen(false)
            }
        } catch (error) {
            console.error("Error deleting order:", error)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Shipping & Orders</h2>
                <p className="text-muted-foreground">Manage orders and auto-reorder rules</p>
            </div>

            <Tabs defaultValue="orders" className="w-full">
                <TabsList className="bg-secondary border border-border">
                    <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Active Orders
                    </TabsTrigger>
                    <TabsTrigger value="auto" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Auto-Order Setup
                    </TabsTrigger>
                </TabsList>

                {/* --- EXISTING ORDERS TAB --- */}
                <TabsContent value="orders" className="mt-4">
                    <Card className="bg-card border-border">
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center p-12 text-muted-foreground">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    Loading orders...
                                </div>
                            ) : (
                                <div className="max-h-[600px] overflow-y-auto">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-card z-10">
                                            <TableRow className="border-border hover:bg-transparent">
                                                <TableHead className="text-muted-foreground">Order ID</TableHead>
                                                <TableHead className="text-muted-foreground">Source</TableHead>
                                                <TableHead className="text-muted-foreground text-right">Items</TableHead>
                                                <TableHead className="text-muted-foreground">Status</TableHead>
                                                <TableHead className="text-muted-foreground">Tracking #</TableHead>
                                                <TableHead className="text-muted-foreground">Date</TableHead>
                                                <TableHead className="text-muted-foreground">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orders.map((order) => (
                                                <TableRow key={order.id} className="border-border">
                                                    <TableCell className="font-mono text-sm text-primary">#{order.id.slice(-6)}</TableCell>
                                                    <TableCell className="font-medium text-foreground">{order.customer}</TableCell>
                                                    <TableCell className="text-right text-foreground">{order.items}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={statusColors[order.status] || "bg-secondary text-secondary-foreground"}>
                                                            {order.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">{order.tracking}</TableCell>
                                                    <TableCell className="text-muted-foreground">{order.date}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            <Button variant="ghost" size="sm" onClick={() => promptDelete(order.id)} className="h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- AUTO ORDER TAB --- */}
                <TabsContent value="auto" className="mt-4">
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Rule
                            </Button>
                        </div>

                        {loadingAuto ? (
                            <div className="flex items-center justify-center p-12 text-muted-foreground">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                Loading automations...
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {automations.map((rule) => {
                                    // Helper to get name from linked item
                                    const itemName = rule.linked_items?.[0]?.name || "Unknown Item";
                                    const isActive = rule.status === "active";

                                    return (
                                        <Card key={rule.id} className={`bg-card border-border ${!isActive ? "opacity-60" : ""}`}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/20' : 'bg-secondary'}`}>
                                                            <Zap className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-foreground">
                                                                <span className="text-sm text-muted-foreground uppercase mr-2">{rule.type === 'stock' ? 'Low Stock' : 'Recurring'}</span>
                                                                WHEN <span className="text-primary">'{itemName}'</span>
                                                                {rule.type === 'stock' ? ` stock < ${rule.condition}` : ` every ${rule.condition} days`}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                                THEN order {rule.amount} units from <span className="text-foreground font-medium">{rule.source_name}</span>
                                                                {rule.source_link && (
                                                                    <a href={rule.source_link} target="_blank" className="ml-2 hover:text-primary">
                                                                        <LinkIcon className="h-3 w-3 inline" />
                                                                    </a>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
                                                            {rule.status}
                                                        </Badge>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* --- CREATE RULE MODAL --- */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="bg-card border-border sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-foreground">Create Automation Rule</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Set up conditions to automatically reorder stock or send alerts.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* SKU Input */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium text-muted-foreground">Item SKU</label>
                            <input
                                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="e.g., 12"
                                value={newRule.sku}
                                onChange={(e) => setNewRule({ ...newRule, sku: e.target.value })}
                            />
                        </div>

                        {/* Type & Condition Row */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium text-muted-foreground">Trigger</label>
                            <div className="col-span-3 flex gap-2">
                                <select
                                    className="flex h-9 w-1/3 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={newRule.type}
                                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value as "stock" | "repeat" })}
                                >
                                    <option value="stock">Low Stock</option>
                                    <option value="repeat">Repeat Time</option>
                                </select>
                                <input
                                    type="number"
                                    className="flex h-9 w-2/3 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder={newRule.type === 'stock' ? "Min Stock Level" : "Days interval"}
                                    value={newRule.condition}
                                    onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium text-muted-foreground">Reorder Qty</label>
                            <input
                                type="number"
                                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="Amount to order"
                                value={newRule.amount}
                                onChange={(e) => setNewRule({ ...newRule, amount: e.target.value })}
                            />
                        </div>

                        {/* Source Name (Email or Store) */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium text-muted-foreground">Source</label>
                            <input
                                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="Supplier Name or 'Email'"
                                value={newRule.source_name}
                                onChange={(e) => setNewRule({ ...newRule, source_name: e.target.value })}
                            />
                        </div>

                        {/* Link */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium text-muted-foreground">Link/Email</label>
                            <input
                                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder={newRule.source_name.toLowerCase().includes('email') ? "recipient@example.com" : "https://supplier.com/item"}
                                value={newRule.source_link}
                                onChange={(e) => setNewRule({ ...newRule, source_link: e.target.value })}
                            />
                        </div>

                        {/* Status Toggle */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium text-muted-foreground">Status</label>
                            <div className="col-span-3 flex items-center gap-2">
                                <button
                                    onClick={() => setNewRule({ ...newRule, status: newRule.status === "active" ? "disabled" : "active" })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${newRule.status === 'active' ? 'bg-primary' : 'bg-input'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${newRule.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm text-muted-foreground">{newRule.status === "active" ? "Active" : "Disabled"}</span>
                            </div>
                        </div>

                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-border text-foreground hover:bg-secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleCreateRule} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <Save className="h-4 w-4 mr-2" />
                            Save Rule
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- DELETE ORDER MODAL (Existing) --- */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="bg-card border-border sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-destructive mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <DialogTitle className="text-lg font-bold text-foreground">Cancel Order</DialogTitle>
                        </div>
                        <DialogDescription className="text-muted-foreground">
                            Are you sure you want to cancel Order <span className="font-mono text-primary">#{deleteId?.slice(-6)}</span>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="border-border text-foreground hover:bg-secondary">
                            Keep Order
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Yes, Cancel Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}