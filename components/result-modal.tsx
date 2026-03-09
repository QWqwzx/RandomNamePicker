"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Student {
  studentId: string
  name: string
  class: string
}

interface ResultModalProps {
  isOpen: boolean
  result: Student | null
  onClose: () => void
  onReset: () => void
}

export function ResultModal({ isOpen, result, onClose, onReset }: ResultModalProps) {
  return (
    <AnimatePresence>
      {isOpen && result && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
          />
          
          {/* 弹窗内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="relative bg-card border border-border rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-2xl pointer-events-auto">
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* 装饰性粒子 */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [0, (Math.random() - 0.5) * 200],
                      y: [0, (Math.random() - 0.5) * 200],
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-primary/60"
                  />
                ))}
              </div>

              {/* 图标 */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6"
              >
                <Sparkles className="w-10 h-10 text-primary" />
              </motion.div>

              {/* 标题 */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center text-xl text-muted-foreground mb-6"
              >
                抽签结果
              </motion.h2>

              {/* 结果 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center space-y-4 mb-8"
              >
                <div className="bg-secondary/50 rounded-2xl p-6 space-y-3">
                  <div className="text-sm text-muted-foreground">学号</div>
                  <div className="text-lg font-mono text-foreground">{result.studentId}</div>
                  
                  <div className="h-px bg-border/50 my-3" />
                  
                  <div className="text-sm text-muted-foreground">姓名</div>
                  <div className="text-3xl font-bold text-primary">{result.name}</div>
                  
                  <div className="h-px bg-border/50 my-3" />
                  
                  <div className="text-sm text-muted-foreground">班级</div>
                  <div className="text-lg text-foreground">{result.class}</div>
                </div>
              </motion.div>

              {/* 操作按钮 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-3"
              >
                <Button
                  onClick={onReset}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6 rounded-xl"
                >
                  再抽一次
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full py-6 rounded-xl"
                >
                  关闭
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
