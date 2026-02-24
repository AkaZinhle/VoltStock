"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Download, MoreHorizontal, Edit, Trash, Filter, Loader2 } from "lucide-react"

interface InventoryItem {
    sku: string
    name: string
    category: string
    stock: number
    minStock: number
    location: string
    totalValue: string
    unitPrice?: number
}

export function InventoryView() {
    const [searchQuery, setSearchQuery] = useState("")
    const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // --- ADD STATE ---
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newItem, setNewItem] = useState({ name: "", category: "", stock: "", minStock: "", location: "", unitPrice: "" })

    // --- BULK STATE ---
    const [isBulkOpen, setIsBulkOpen] = useState(false)
    const [bulkData, setBulkData] = useState({ name: "", category: "", stock: "", minStock: "", location: "" })

    // --- EDIT STATE ---
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingSku, setEditingSku] = useState<string | null>(null)
    const [editFormData, setEditFormData] = useState({
        name: "",
        category: "",
        stock: "",
        minStock: "",
        location: "",
        unitPrice: ""
    })

    const fetchInventory = () => {
        setIsLoading(true)
        fetch("http://localhost:8000/api/inventory")
            .then((res) => res.json())
            .then((data) => {
                setInventoryData(data)
                setIsLoading(false)
            })
            .catch((err) => {
                console.error("Failed to fetch inventory:", err)
                setIsLoading(false)
            })
    }

    useEffect(() => {
        fetchInventory()
    }, [])

    // --- HANDLERS ---

    // Generic input change for Add
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setNewItem(prev => ({ ...prev, [name]: value }))
    }

    // Generic input change for Edit
    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setEditFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const payload = {
                name: newItem.name,
                category: newItem.category,
                stock: parseInt(newItem.stock) || 0,
                minStock: parseInt(newItem.minStock) || 0,
                location: newItem.location,
                unitPrice: parseFloat(newItem.unitPrice) || 0.00
            }
            const res = await fetch("http://localhost:8000/api/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            if (!res.ok) throw new Error("Failed to add item")
            await fetchInventory()
            setIsAddOpen(false)
            setNewItem({ name: "", category: "", stock: "", minStock: "", location: "", unitPrice: "" })
        } catch (error) {
            console.error(error)
            alert("Error adding item")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBulkUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        const payload = {
            skus: filteredData.map(item => item.sku),
            name: bulkData.name || null,
            category: bulkData.category || null,
            location: bulkData.location || null,
            stock: bulkData.stock !== "" ? parseInt(bulkData.stock) : null,
            minStock: bulkData.minStock !== "" ? parseInt(bulkData.minStock) : null,
        }
        try {
            const res = await fetch("http://localhost:8000/api/inventory/bulk", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            if (!res.ok) throw new Error("Bulk update failed")
            await fetchInventory()
            setIsBulkOpen(false)
            setBulkData({ name: "", category: "", stock: "", minStock: "", location: "" })
        } catch (error) {
            alert("Error during bulk update")
        } finally {
            setIsSubmitting(false)
        }
    }

    // --- NEW EDIT & DELETE HANDLERS ---

    const openEditModal = (item: InventoryItem) => {
        setEditingSku(item.sku)
        setEditFormData({
            name: item.name,
            category: item.category,
            stock: item.stock.toString(),
            minStock: item.minStock.toString(),
            location: item.location,
            unitPrice: item.unitPrice ? item.unitPrice.toString() : "0"
        })
        setIsEditOpen(true)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingSku) return

        setIsSubmitting(true)
        try {
            const payload = {
                name: editFormData.name,
                category: editFormData.category,
                stock: parseInt(editFormData.stock) || 0,
                minStock: parseInt(editFormData.minStock) || 0,
                location: editFormData.location,
                unitPrice: parseFloat(editFormData.unitPrice) || 0.00
            }

            const res = await fetch(`http://localhost:8000/api/inventory/${editingSku}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error("Failed to update item")

            await fetchInventory()
            setIsEditOpen(false)
        } catch (error) {
            console.error(error)
            alert("Error updating item")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (sku: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return

        try {
            const res = await fetch(`http://localhost:8000/api/inventory/${sku}`, {
                method: "DELETE"
            })
            if (!res.ok) throw new Error("Failed to delete item")
            await fetchInventory()
        } catch (error) {
            console.error(error)
            alert("Error deleting item")
        }
    }

    const handleExport = () => {
        if (filteredData.length === 0) return
        const headers = ["SKU", "Name", "Category", "Stock", "Min Stock", "Location", "Total Value"]
        const csvContent = [
            headers.join(","),
            ...filteredData.map(item => [
                `"${item.sku}"`, `"${item.name}"`, `"${item.category}"`, item.stock, item.minStock, `"${item.location}"`, `"${item.totalValue}"`
            ].join(","))
        ].join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const filteredData = inventoryData.filter(
        (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Inventory</h2>
                    <p className="text-muted-foreground">Manage your inventory items</p>
                </div>

                {/* Add Item Dialog */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
                        <DialogHeader>
                            <DialogTitle>Add New Item</DialogTitle>
                            <DialogDescription>Enter the details of the new inventory item below.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddItem} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" name="name" value={newItem.name} onChange={handleInputChange} className="col-span-3 bg-secondary border-border" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">Category</Label>
                                <Input id="category" name="category" value={newItem.category} onChange={handleInputChange} className="col-span-3 bg-secondary border-border" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="stock" className="text-right">Stock</Label>
                                <Input id="stock" name="stock" type="number" value={newItem.stock} onChange={handleInputChange} className="col-span-3 bg-secondary border-border" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="minStock" className="text-right">Min Stock</Label>
                                <Input id="minStock" name="minStock" type="number" value={newItem.minStock} onChange={handleInputChange} className="col-span-3 bg-secondary border-border" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="location" className="text-right">Location</Label>
                                <Input id="location" name="location" value={newItem.location} onChange={handleInputChange} className="col-span-3 bg-secondary border-border" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="unitPrice" className="text-right">Price ($)</Label>
                                <Input id="unitPrice" name="unitPrice" type="number" step="0.01" value={newItem.unitPrice} onChange={handleInputChange} className="col-span-3 bg-secondary border-border" required />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Item"}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Edit Item Dialog - Triggered via state */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
                    <DialogHeader>
                        <DialogTitle>Edit Item</DialogTitle>
                        <DialogDescription>
                            Update the details for {editingSku}.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">Name</Label>
                            <Input id="edit-name" name="name" value={editFormData.name} onChange={handleEditInputChange} className="col-span-3 bg-secondary border-border" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-category" className="text-right">Category</Label>
                            <Input id="edit-category" name="category" value={editFormData.category} onChange={handleEditInputChange} className="col-span-3 bg-secondary border-border" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-stock" className="text-right">Stock</Label>
                            <Input id="edit-stock" name="stock" type="number" value={editFormData.stock} onChange={handleEditInputChange} className="col-span-3 bg-secondary border-border" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-minStock" className="text-right">Min Stock</Label>
                            <Input id="edit-minStock" name="minStock" type="number" value={editFormData.minStock} onChange={handleEditInputChange} className="col-span-3 bg-secondary border-border" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-location" className="text-right">Location</Label>
                            <Input id="edit-location" name="location" value={editFormData.location} onChange={handleEditInputChange} className="col-span-3 bg-secondary border-border" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-unitPrice" className="text-right">Price ($)</Label>
                            <Input id="edit-unitPrice" name="unitPrice" type="number" step="0.01" value={editFormData.unitPrice} onChange={handleEditInputChange} className="col-span-3 bg-secondary border-border" required />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Updating..." : "Update Item"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Card className="bg-card border-border">
                <CardHeader className="border-b border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search by SKU, name, or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground" />
                            </div>
                            <Button variant="outline" size="icon" className="border-border bg-transparent"><Filter className="h-4 w-4" /></Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="border-border text-foreground bg-transparent" onClick={handleExport}><Download className="h-4 w-4 mr-2" /> Export</Button>

                            {/* Bulk Adjust Dialog */}
                            <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="border-border text-foreground bg-transparent" disabled={filteredData.length === 0}>
                                        Bulk Adjust ({filteredData.length})
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
                                    <DialogHeader>
                                        <DialogTitle>Bulk Adjust Items</DialogTitle>
                                        <DialogDescription>Updating {filteredData.length} filtered items. Leave fields blank to keep existing values.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleBulkUpdate} className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="bulk-name" className="text-right">Name</Label>
                                            <Input id="bulk-name" placeholder="New name for all..." value={bulkData.name} onChange={(e) => setBulkData({ ...bulkData, name: e.target.value })} className="col-span-3 bg-secondary border-border" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="bulk-category" className="text-right">Category</Label>
                                            <Input id="bulk-category" placeholder="New category..." value={bulkData.category} onChange={(e) => setBulkData({ ...bulkData, category: e.target.value })} className="col-span-3 bg-secondary border-border" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="bulk-stock" className="text-right">Stock</Label>
                                            <Input id="bulk-stock" type="number" placeholder="New stock level..." value={bulkData.stock} onChange={(e) => setBulkData({ ...bulkData, stock: e.target.value })} className="col-span-3 bg-secondary border-border" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="bulk-minstock" className="text-right">Min Stock</Label>
                                            <Input id="bulk-minstock" type="number" placeholder="New min stock..." value={bulkData.minStock} onChange={(e) => setBulkData({ ...bulkData, minStock: e.target.value })} className="col-span-3 bg-secondary border-border" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="bulk-location" className="text-right">Location</Label>
                                            <Input id="bulk-location" placeholder="New location..." value={bulkData.location} onChange={(e) => setBulkData({ ...bulkData, location: e.target.value })} className="col-span-3 bg-secondary border-border" />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={isSubmitting || !Object.values(bulkData).some(v => v !== "")}>
                                                {isSubmitting ? "Updating..." : `Update ${filteredData.length} Items`}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="text-muted-foreground">SKU</TableHead>
                                <TableHead className="text-muted-foreground">Name</TableHead>
                                <TableHead className="text-muted-foreground">Category</TableHead>
                                <TableHead className="text-muted-foreground text-right">Stock</TableHead>
                                <TableHead className="text-muted-foreground text-right">Min Stock</TableHead>
                                <TableHead className="text-muted-foreground">Location</TableHead>
                                <TableHead className="text-muted-foreground text-right">Total Value</TableHead>
                                <TableHead className="text-muted-foreground w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center"><div className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading data...</div></TableCell>
                                </TableRow>
                            ) : filteredData.length === 0 ? (
                                <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No items found.</TableCell></TableRow>
                            ) : (
                                filteredData.map((item) => (
                                    <TableRow key={item.sku} className="border-border">
                                        <TableCell className="font-mono text-sm text-foreground">{item.sku}</TableCell>
                                        <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{item.category}</TableCell>
                                        <TableCell className="text-right"><span className={item.stock < item.minStock ? "text-primary font-medium" : "text-foreground"}>{item.stock}</span></TableCell>
                                        <TableCell className="text-right text-muted-foreground">{item.minStock}</TableCell>
                                        <TableCell className="text-muted-foreground">{item.location}</TableCell>
                                        <TableCell className="text-right text-foreground">{item.totalValue}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-popover border-border">
                                                    {/* Updated Menu Items */}
                                                    <DropdownMenuItem className="text-foreground" onClick={() => openEditModal(item)}>
                                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive-foreground" onClick={() => handleDelete(item.sku)}>
                                                        <Trash className="h-4 w-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}