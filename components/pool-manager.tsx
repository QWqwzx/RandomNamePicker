"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Student {
  studentId: string
  name: string
  class: string
}

interface PoolManagerProps {
  items: Student[]
  onAddItem: (item: Student) => void
  onRemoveItem: (index: number) => void
  onClearAll: () => void
}

export function PoolManager({ items, onAddItem, onRemoveItem, onClearAll }: PoolManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newStudentId, setNewStudentId] = useState("")
  const [newName, setNewName] = useState("")
  const [newClass, setNewClass] = useState("")

  const handleAdd = () => {
    if (newStudentId.trim() && newName.trim() && newClass.trim()) {
      onAddItem({
        studentId: newStudentId.trim(),
        name: newName.trim(),
        class: newClass.trim()
      })
      setNewStudentId("")
      setNewName("")
      setNewClass("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd()
    }
  }

  return (
    <div className="relative">
      {/* 触发按钮 */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className={cn(
          "rounded-full px-6 py-5 border-border/50",
          "hover:border-primary/50 hover:bg-primary/5",
          "transition-all duration-300",
          isOpen && "border-primary/50 bg-primary/5"
        )}
      >
        <Settings2 className="w-4 h-4 mr-2" />
        管理签池
        <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
          {items.length}
        </span>
      </Button>

      {/* 下拉面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-4 right-0 w-96 bg-card border border-border rounded-2xl shadow-2xl shadow-black/30 overflow-hidden z-40"
          >
            {/* 头部 */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-medium text-foreground">签池内容</h3>
              {items.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                >
                  清空全部
                </button>
              )}
            </div>

            {/* 添加输入框 */}
            <div className="p-4 border-b border-border/50">
              <div className="space-y-2">
                <Input
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="学号"
                  className="bg-secondary/50 border-0 focus-visible:ring-primary/50"
                />
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="姓名"
                  className="bg-secondary/50 border-0 focus-visible:ring-primary/50"
                />
                <Input
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="班级"
                  className="bg-secondary/50 border-0 focus-visible:ring-primary/50"
                />
                <Button
                  onClick={handleAdd}
                  disabled={!newStudentId.trim() || !newName.trim() || !newClass.trim()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加学生
                </Button>
              </div>
            </div>

            {/* 列表 */}
            <div className="max-h-96 overflow-y-auto p-2">
              {items.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  签池为空，请添加内容或上传Excel文件
                </div>
              ) : (
                <div className="space-y-1">
                  {items.map((item, index) => (
                    <motion.div
                      key={`${item.studentId}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="group flex items-center justify-between px-3 py-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="text-xs text-muted-foreground font-mono truncate">
                          {item.studentId}
                        </div>
                        <div className="text-sm font-medium text-foreground truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {item.class}
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-destructive/20 transition-all ml-2 shrink-0"
                      >
                        <X className="w-3 h-3 text-destructive" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 点击外部关闭 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
