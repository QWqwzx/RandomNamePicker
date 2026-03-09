"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Student {
  studentId: string
  name: string
  class: string
}

interface LotteryCardProps {
  item: Student
  index: number
  isSelected: boolean
  isRevealing: boolean
  onClick: () => void
}

export function LotteryCard({ 
  item, 
  index, 
  isSelected, 
  isRevealing,
  onClick 
}: LotteryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: isRevealing ? 1 : 1.05, y: isRevealing ? 0 : -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative cursor-pointer select-none",
        "group"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "bg-card border border-border/50",
          "p-6 min-h-[140px]",
          "flex flex-col justify-center",
          "transition-all duration-500",
          "shadow-lg shadow-black/20",
          isSelected && "border-primary/50 bg-primary/10",
          !isRevealing && "hover:border-primary/30 hover:shadow-primary/10 hover:shadow-xl"
        )}
      >
        {/* 装饰性光晕 */}
        <div 
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-500",
            "bg-[radial-gradient(circle_at_50%_50%,_var(--primary)_0%,_transparent_70%)]",
            isSelected && "opacity-20"
          )}
        />
        
        {/* 顶部装饰线 */}
        <div 
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-0",
            "bg-gradient-to-r from-transparent via-primary to-transparent",
            "transition-all duration-500",
            "group-hover:w-full",
            isSelected && "w-full"
          )}
        />

        {/* 内容 */}
        <div className="relative z-10 space-y-2">
          <div 
            className={cn(
              "text-xs text-muted-foreground font-mono",
              "transition-all duration-300",
              isSelected && "text-primary/80"
            )}
          >
            {item.studentId}
          </div>
          <div 
            className={cn(
              "text-xl font-bold text-foreground",
              "transition-all duration-300",
              "group-hover:text-foreground",
              isSelected && "text-primary"
            )}
          >
            {item.name}
          </div>
          <div 
            className={cn(
              "text-sm text-muted-foreground",
              "transition-all duration-300",
              isSelected && "text-primary/70"
            )}
          >
            {item.class}
          </div>
        </div>

        {/* 角标装饰 */}
        <div className="absolute top-3 right-3 text-xs text-muted-foreground/50 font-mono">
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>
    </motion.div>
  )
}
