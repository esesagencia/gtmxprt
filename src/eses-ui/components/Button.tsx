import React, { useRef, useState } from 'react'
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion'
import { cn } from '../core/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    magnetic?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', magnetic = true, children, ...props }, ref) => {
        const buttonRef = useRef<HTMLButtonElement>(null)

        // Magnetic Effect Logic
        const mouseX = useMotionValue(0)
        const mouseY = useMotionValue(0)

        const springConfig = { damping: 15, stiffness: 150 }
        const x = useSpring(mouseX, springConfig)
        const y = useSpring(mouseY, springConfig)

        const handleMouseMove = (e: React.MouseEvent) => {
            if (!magnetic || !buttonRef.current) return
            const { clientX, clientY } = e
            const { left, top, width, height } = buttonRef.current.getBoundingClientRect()
            const centerX = left + width / 2
            const centerY = top + height / 2

            mouseX.set((clientX - centerX) * 0.4)
            mouseY.set((clientY - centerY) * 0.4)
        }

        const handleMouseLeave = () => {
            mouseX.set(0)
            mouseY.set(0)
        }

        const variants = {
            primary: "bg-brand-boreal text-brand-carbon shadow-lg shadow-brand-boreal/20 hover:shadow-brand-boreal/40",
            secondary: "bg-brand-polar text-white shadow-lg shadow-brand-polar/20 hover:shadow-brand-polar/40",
            outline: "bg-transparent border-2 border-brand-carbon/10 text-brand-carbon hover:bg-brand-carbon/5",
            ghost: "bg-transparent text-brand-carbon/60 hover:text-brand-carbon hover:bg-brand-carbon/5"
        }

        const sizes = {
            sm: "px-4 py-2 text-xs",
            md: "px-8 py-4 text-sm",
            lg: "px-10 py-5 text-base"
        }

        return (
            <motion.button
                ref={buttonRef}
                style={{ x, y }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "relative overflow-hidden rounded-2xl font-display font-bold uppercase tracking-widest transition-colors duration-300",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                <span className="relative z-10">{children}</span>
                {/* Shine Effect */}
                <motion.div
                    className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
            </motion.button>
        )
    }
)

Button.displayName = 'Button'
