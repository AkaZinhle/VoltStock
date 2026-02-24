"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useState } from "react"

interface SplashScreenProps {
    finishLoading: () => void
}

export function SplashScreen({ finishLoading }: SplashScreenProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // The splash screen will stay for 2.5 seconds, then trigger the finish function
        const timeout = setTimeout(() => {
            finishLoading()
        }, 2500)

        return () => clearTimeout(timeout)
    }, [finishLoading])

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-sidebar"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        >
            <div className="relative flex flex-col items-center gap-4">
                {/* Logo Animation */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    className="relative h-24 w-24"
                >
                    <Image
                        src="/voltstock_mini_logo.png"
                        alt="VoltStock Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </motion.div>

                {/* Text Animation */}
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-4xl font-bold text-primary tracking-tight"
                >
                    VoltStock
                </motion.h1>

                {/* Loading Bar */}
                <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
                    />
                </div>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-2 text-xs text-muted-foreground"
                >
                    Initializing Inventory Systems...
                </motion.p>
            </div>
        </motion.div>
    )
}