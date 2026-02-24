"use client"

import { cn } from "@/lib/utils"
import { LayoutDashboard, MessageSquare, Box, Truck, ArrowLeftRight, Shield } from "lucide-react"
import type { NavItem } from "@/app/page"
import Image from "next/image" // Import the Image component

interface SidebarProps {
    activeNav: NavItem
    setActiveNav: (nav: NavItem) => void
}

const navItems = [
    { id: "dashboard" as NavItem, label: "Dashboard", icon: LayoutDashboard },
    { id: "copilot" as NavItem, label: "LLM Co-Pilot", icon: MessageSquare },
    { id: "inventory" as NavItem, label: "Inventory", icon: Box },
    { id: "shipping" as NavItem, label: "Shipping & Orders", icon: Truck },
    { id: "inout" as NavItem, label: "In & Out Log", icon: ArrowLeftRight },
]

const adminItems = [{ id: "admin" as NavItem, label: "Admin & Audit", icon: Shield }]

export function Sidebar({ activeNav, setActiveNav }: SidebarProps) {
    return (
        <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
            {/* Header section with Logo and Text */}
            <div className="p-6 flex items-center gap-3">
                <Image
                    src="/voltstock_mini_logo.png"
                    alt="VoltStock Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                />
                <h1 className="text-2xl font-bold text-primary">VoltStock</h1>
            </div>

            <nav className="flex-1 px-3">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => setActiveNav(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    activeNav === item.id
                                        ? "bg-primary text-primary-foreground"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent",
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="my-4 border-t border-sidebar-border" />

                <ul className="space-y-1">
                    {adminItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => setActiveNav(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    activeNav === item.id
                                        ? "bg-primary text-primary-foreground"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent",
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-sidebar-border">
                <p className="text-xs text-muted-foreground">© 2025 VoltStock</p>
            </div>
        </aside>
    )
}