"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shuffle, Sparkles, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LotteryCard } from "@/components/lottery-card"
import { ResultModal } from "@/components/result-modal"
import { PoolManager } from "@/components/pool-manager"
import { DrawAnimation } from "@/components/draw-animation"
import { cn } from "@/lib/utils"
import * as XLSX from 'xlsx'

interface Student {
  studentId: string
  name: string
  class: string
}

const DEFAULT_ITEMS: Student[] = []

export default function LotteryPage() {
  const [items, setItems] = useState<Student[]>(DEFAULT_ITEMS)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [result, setResult] = useState<Student | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // 读取 Excel 文件
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        // 跳过表头，从第二行开始读取
        const students: Student[] = jsonData.slice(1).map((row) => ({
          studentId: String(row[0] || ''),
          name: String(row[1] || ''),
          class: String(row[2] || '')
        })).filter(s => s.studentId && s.name) // 过滤空行

        setItems(students)
      } catch (error) {
        console.error('读取 Excel 文件失败:', error)
        alert('读取文件失败，请确保文件格式正确')
      }
    }
    reader.readAsBinaryString(file)
  }

  // 自动加载名单.xlsx
  useEffect(() => {
    fetch('/名单.xlsx')
      .then(res => res.arrayBuffer())
      .then(data => {
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        // 跳过表头
        const students: Student[] = jsonData.slice(1).map((row) => ({
          studentId: String(row[0] || ''),
          name: String(row[1] || ''),
          class: String(row[2] || '')
        })).filter(s => s.studentId && s.name)

        setItems(students)
      })
      .catch(err => {
        console.log('未找到名单.xlsx文件，请手动上传')
      })
  }, [])

  // 抽签动画
  const startDraw = useCallback(() => {
    if (items.length === 0 || isDrawing) return
    
    setIsDrawing(true)
    setResult(null)
    setSelectedIndex(null)
    
    let count = 0
    const maxCount = 20 + Math.floor(Math.random() * 10)
    const baseInterval = 50
    
    const animate = () => {
      count++
      const newIndex = Math.floor(Math.random() * items.length)
      setCurrentIndex(newIndex)
      
      if (count < maxCount) {
        // 逐渐减速
        const delay = baseInterval + (count / maxCount) * 200
        setTimeout(animate, delay)
      } else {
        // 动画结束
        const finalIndex = Math.floor(Math.random() * items.length)
        setSelectedIndex(finalIndex)
        setResult(items[finalIndex])
        setIsDrawing(false)
        
        // 延迟显示结果弹窗
        setTimeout(() => {
          setShowResult(true)
        }, 300)
      }
    }
    
    animate()
  }, [items, isDrawing])

  // 添加签
  const handleAddItem = (item: Student) => {
    setItems(prev => [...prev, item])
  }

  // 移除签
  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  // 清空所有
  const handleClearAll = () => {
    setItems([])
  }

  // 重置
  const handleReset = () => {
    setShowResult(false)
    setResult(null)
    setSelectedIndex(null)
  }

  // 关闭弹窗
  const handleCloseModal = () => {
    setShowResult(false)
  }

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isDrawing && items.length > 0) {
        e.preventDefault()
        startDraw()
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [startDraw, isDrawing, items.length])

  return (
    <div className="min-h-screen bg-background">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* 主内容 */}
      <div className="relative z-10">
        {/* 头部 */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-foreground">命运抽签</h1>
                <p className="text-xs text-muted-foreground">Fortune Draw</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              {/* 上传按钮 */}
              <label className={cn(
                "cursor-pointer rounded-full px-6 py-5 border border-border/50",
                "hover:border-primary/50 hover:bg-primary/5",
                "transition-all duration-300 flex items-center gap-2"
              )}>
                <Upload className="w-4 h-4" />
                <span className="text-sm">上传名单</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <PoolManager
                items={items}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onClearAll={handleClearAll}
              />
            </motion.div>
          </div>
        </header>

        {/* 主区域 */}
        <main className="max-w-6xl mx-auto px-6 py-12">
          {/* 标题区 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 text-balance">
              让命运做出选择
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-balance">
              将选择交给命运，点击下方按钮开始抽签
            </p>
          </motion.div>

          {/* 抽签按钮 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-16"
          >
            <Button
              onClick={startDraw}
              disabled={isDrawing || items.length === 0}
              className={cn(
                "relative group",
                "px-12 py-8 text-lg font-medium",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "rounded-2xl shadow-lg shadow-primary/30",
                "transition-all duration-300",
                "hover:shadow-xl hover:shadow-primary/40",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {/* 脉冲动画 */}
              <span 
                className={cn(
                  "absolute inset-0 rounded-2xl bg-primary",
                  "animate-ping opacity-20",
                  (isDrawing || items.length === 0) && "hidden"
                )}
              />
              
              <span className="relative flex items-center gap-3">
                <Shuffle className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  isDrawing && "animate-spin"
                )} />
                {isDrawing ? "抽签中..." : "开始抽签"}
              </span>
            </Button>
          </motion.div>

          {/* 快捷键提示 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm text-muted-foreground mb-12"
          >
            按下 <kbd className="px-2 py-1 rounded bg-secondary text-foreground text-xs font-mono mx-1">Space</kbd> 快速抽签
          </motion.p>

          {/* 签池展示 */}
          {items.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-foreground">
                  当前签池
                </h3>
                <span className="text-sm text-muted-foreground">
                  共 {items.length} 个选项
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <LotteryCard
                      key={`${item.studentId}-${index}`}
                      item={item}
                      index={index}
                      isSelected={selectedIndex === index}
                      isRevealing={isDrawing}
                      onClick={() => {}}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">
                签池为空
              </h3>
              <p className="text-muted-foreground">
                点击右上角"管理签池"添加内容
              </p>
            </motion.div>
          )}
        </main>

        {/* 底部 */}
        <footer className="border-t border-border/50 py-8 mt-12">
          <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
            <p>命运抽签 · 让选择变得简单</p>
          </div>
        </footer>
      </div>

      {/* 抽签动画 */}
      <AnimatePresence>
        {isDrawing && (
          <DrawAnimation
            isDrawing={isDrawing}
            items={items}
            currentIndex={currentIndex}
          />
        )}
      </AnimatePresence>

      {/* 结果弹窗 */}
      <ResultModal
        isOpen={showResult}
        result={result}
        onClose={handleCloseModal}
        onReset={handleReset}
      />
    </div>
  )
}
