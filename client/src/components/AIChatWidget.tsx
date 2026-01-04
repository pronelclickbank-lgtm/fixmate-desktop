import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, X, Send, Minimize2, Maximize2, Loader2, Wrench, HeadphonesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/_core/hooks/useAuth";
import { useOptimization } from "@/contexts/OptimizationContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AIChatWidgetProps {
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}

export function AIChatWidget(props: AIChatWidgetProps = {}) {
  const { externalOpen, onExternalOpenChange } = props;
  const { isAuthenticated } = useAuth();
  const { triggerOptimization, triggerScan } = useOptimization();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = (open: boolean) => {
    if (onExternalOpenChange) {
      onExternalOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | undefined>();
  const [showTooltip, setShowTooltip] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check localStorage on mount
  useEffect(() => {
    const tooltipDismissed = localStorage.getItem('fixmate-tooltip-dismissed');
    if (tooltipDismissed === 'true') {
      setShowTooltip(false);
    }
  }, []);

  const handleDismissTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('fixmate-tooltip-dismissed', 'true');
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    // Auto-dismiss tooltip after first interaction
    if (showTooltip) {
      handleDismissTooltip();
    }
  };

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          timestamp: data.timestamp,
        },
      ]);
      setConversationId(data.conversationId);
      
      // Handle action triggers from AI
      if (data.actionTriggered) {
        const { action } = data.actionTriggered;
        
        if (action === "run_system_optimization") {
          // Trigger optimization after a short delay to let user see the message
          setTimeout(() => {
            triggerOptimization();
          }, 1000);
        } else if (action === "run_system_scan") {
          setTimeout(() => {
            triggerScan();
          }, 1000);
        }
      }
    },
  });

  // Fetch system overview for context
  const { data: systemOverview } = trpc.diagnostics.getSystemOverview.useQuery();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !isAuthenticated) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      await sendMessageMutation.mutateAsync({
        message: input,
        conversationId,
        systemContext: systemOverview
          ? {
              cpu: systemOverview.cpu,
              memory: systemOverview.memory,
              disk: systemOverview.disk,
            }
          : undefined,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Don't show floating button if externally controlled
  if (onExternalOpenChange) {
    // When externally controlled, only show the chat window when open
    if (!isOpen) {
      return null;
    }
  } else if (!isAuthenticated || !isOpen) {
    // When not externally controlled, show the floating button
    return (
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-1">
        {/* Tooltip message */}
        {showTooltip && (
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-2 py-1 rounded shadow-lg animate-in fade-in duration-500 flex items-center gap-1">
            <p className="text-xs whitespace-nowrap">Help</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-3 w-3 hover:bg-white/20 rounded-full"
              onClick={handleDismissTooltip}
            >
              <X className="h-2 w-2" />
            </Button>
          </div>
        )}
        <Button
          onClick={handleOpenChat}
          className="h-8 w-8 rounded-full shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 bg-gradient-to-br from-cyan-600 to-cyan-500 hover:scale-110 border border-cyan-400"
          size="icon"
        >
          <div className="relative">
            <HeadphonesIcon className="h-4 w-4" />
            <Wrench className="h-2 w-2 absolute -bottom-0.5 -right-0.5" />
          </div>
        </Button>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 shadow-2xl shadow-cyan-500/30 transition-all duration-300 border-2 border-cyan-500/50 bg-slate-800/95 backdrop-blur-xl z-[9999]",
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]",
        "flex flex-col"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-600/20 to-cyan-500/20">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full animate-pulse shadow-lg shadow-cyan-500/50" />
          <CardTitle className="text-lg font-bold text-cyan-300">Troubleshooting Assistant</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <MessageCircle className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-purple-300 text-lg">Hi! I'm FixMate AI 👋</p>
                    <p className="text-sm text-purple-200 mt-2 leading-relaxed">
                      Ask me anything about your PC, troubleshooting, your internet or printer issues!
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput("Why is my PC running slow?")}
                    >
                      Why is my PC slow?
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput("How do I fix printer issues?")}
                    >
                      Printer issues?
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            AI
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                      className={cn(
                        "rounded-lg px-4 py-2 max-w-[80%] shadow-md",
                        message.role === "user"
                          ? "bg-gradient-to-br from-purple-600 to-purple-500 text-white border border-purple-400"
                          : "bg-slate-700/80 text-slate-100 border border-purple-500/30"
                      )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className="bg-secondary text-xs">U</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {sendMessageMutation.isPending && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg px-4 py-2 bg-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>

          <div className="p-4 border-t">
            {!isAuthenticated ? (
              <p className="text-sm text-muted-foreground text-center">
                Please log in to use the AI chat assistant
              </p>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sendMessageMutation.isPending}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || sendMessageMutation.isPending}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
