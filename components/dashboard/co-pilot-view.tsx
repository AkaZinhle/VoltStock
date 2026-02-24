"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const examplePrompts = [
  "Summarize last week's outbound inventory.",
  "Create a low stock report for the electronics category.",
  "Simulate the impact of a 15% sales increase on current stock.",
  "Find all orders from customer 'Acme Corp' and mark as priority.",
]

const chatHistory = [
  { id: 1, title: "Inventory Summary Request", date: "Today" },
  { id: 2, title: "Low Stock Analysis", date: "Yesterday" },
  { id: 3, title: "Sales Forecast Q4", date: "Dec 12" },
]

interface Message {
  id: number
  role: "user" | "model"
  content: string
}

export function CoPilotView() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "model",
      content:
        "Hello! I'm your VoltStock Co-Pilot. I can help you analyze inventory data, generate reports, simulate scenarios, and manage orders. How can I assist you today?",
    },
  ])
  const [input, setInput] = useState("")


  //Backend Interaction
  const handleSend = async () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    setInput("")

    // Call backend
      try {
          const response = await fetch('http://localhost:8000/api/chat', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ messages: updatedMessages }),
          })

          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

          const data = await response.json();

          const botMessage: Message = {
              id: updatedMessages.length + 1,
              role: "model",
              content: data.content,
          }

          setMessages((prev) => [...prev, botMessage])
      } catch (error) {

        console.error('Error fetching chat response:', error);

        const errorMessage: Message = { 
            id: updatedMessages.length + 1,
            role: "model",
            content: "Sorry, there was an error processing your request. Please try again later.",
        }
      setMessages((prev) => [...prev, errorMessage])
      }

  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <div className="h-[calc(100vh-3rem)] flex gap-4">
      {/* Chat History Sidebar 
      <div
        className={cn(
          "bg-card border border-border rounded-lg transition-all duration-300 flex flex-col",
          sidebarCollapsed ? "w-12" : "w-64",
        )}
      >
        <div className="p-3 border-b border-border flex items-center justify-between">
          {!sidebarCollapsed && <span className="font-medium text-foreground">History</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {chatHistory.map((chat) => (
              <button key={chat.id} className="w-full text-left p-2 rounded-lg hover:bg-secondary text-sm">
                <p className="text-foreground truncate">{chat.title}</p>
                <p className="text-xs text-muted-foreground">{chat.date}</p>
              </button>
            ))}
          </div>
        )}
      </div>*/}

      {/* Main Chat Area */}
      <Card className="flex-1 bg-card border-border flex flex-col">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            LLM Co-Pilot
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-3 max-w-3xl", message.role === "user" ? "ml-auto flex-row-reverse" : "")}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    message.role === "user" ? "bg-primary" : "bg-secondary",
                  )}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Bot className="h-4 w-4 text-foreground" />
                  )}
                </div>
                <div
                  className={cn(
                    "p-3 rounded-lg",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Example Prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Try these prompts:</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about your inventory..."
                className="flex-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button onClick={handleSend} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
