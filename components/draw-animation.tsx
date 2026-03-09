"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Student {
  studentId: string
  name: string
  class: string
}

interface DrawAnimationProps {
  isDrawing: boolean
  items: Student[]
  currentIndex: number
}

export function DrawAnimation({ isDrawing, items, currentIndex }: DrawAnimationProps) {
  if (!isDrawing || items.length === 0) return null

  const currentStudent = items[currentIndex]

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      {/* 背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
      />

      {/* 旋转容器 */}
      <div className="relative">
        {/* 外圈装饰 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-80 h-80 rounded-full border-2 border-dashed border-primary/30"
          style={{ margin: "-40px" }}
        />
        
        {/* 内圈装饰 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-72 h-72 rounded-full border border-primary/20"
          style={{ margin: "-20px" }}
        />

        {/* 中心卡片 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "relative w-64 h-64 rounded-2xl",
            "bg-card border border-primary/50",
            "flex flex-col items-center justify-center",
            "shadow-2xl shadow-primary/20 p-6"
          )}
        >
          {/* 内部光晕 */}
          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_50%,_var(--primary)_0%,_transparent_70%)] opacity-10" />
          
          {/* 滚动内容 */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-3 relative z-10"
          >
            <div className="text-xs text-muted-foreground font-mono">
              {currentStudent.studentId}
            </div>
            <div className="text-3xl font-bold text-primary">
              {currentStudent.name}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentStudent.class}
            </div>
          </motion.div>
        </motion.div>

        {/* 脉冲效果 */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl border-2 border-primary/50"
        />
      </div>

      {/* 底部提示 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-1/4 text-muted-foreground text-sm"
      >
        命运正在抉择...
      </motion.p>
    </div>
  )
}
