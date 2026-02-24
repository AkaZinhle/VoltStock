"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { CoPilotView } from "@/components/dashboard/co-pilot-view"
import { InventoryView } from "@/components/dashboard/inventory-view"
import { ShippingView } from "@/components/dashboard/shipping-view"
import { InOutLogView } from "@/components/dashboard/in-out-log-view"
import { AdminView } from "@/components/dashboard/admin-view"
import { SplashScreen } from "@/components/dashboard/splash-screen" // Import the new component
import { AnimatePresence } from "framer-motion" // Import AnimatePresence

export type NavItem = "dashboard" | "copilot" | "inventory" | "shipping" | "inout" | "admin"

export default function Home() {
    const [activeNav, setActiveNav] = useState<NavItem>("dashboard")
    const [isLoading, setIsLoading] = useState(true) // State to track splash screen

    // Optional: Prevent scrolling while splash is active
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
    }, [isLoading])

    const renderView = () => {
        switch (activeNav) {
            case "dashboard":
                return <DashboardView />
            case "copilot":
                return <CoPilotView />
            case "inventory":
                return <InventoryView />
            case "shipping":
                return <ShippingView />
            case "inout":
                return <InOutLogView />
            case "admin":
                return <AdminView />
            default:
                return <DashboardView />
        }
    }

    return (
        <div className="relative flex h-screen bg-background">
            {/* The AnimatePresence wrapper allows the SplashScreen to 
         play its exit animation before being removed from the DOM.
      */}
            <AnimatePresence mode="wait">
                {isLoading && (
                    <SplashScreen finishLoading={() => setIsLoading(false)} />
                )}
            </AnimatePresence>

            {/* The main app sits behind the splash screen.
         We only start interaction once loading is done, 
         though it renders immediately to prevent pop-in.
      */}
            {!isLoading && (
                <>
                    <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
                    <main className="flex-1 overflow-auto p-6">{renderView()}</main>
                </>
            )}
        </div>
    )
}