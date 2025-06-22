
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Loader2, 
  Trash2,
  MessageSquare,
  Sparkles,
  Settings,
  Zap,
  AlertTriangle,
  DollarSign,
  Clock,
  Brain,
  Code,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { User } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import { AI_MODELS, AI_AGENTS, estimateMessageCost, formatCost } from '@/lib/ai-router'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  metadata?: {
    model?: string
    provider?: string
    cost?: number
    tokensUsed?: number
    processingTime?: number
    fallbackUsed?: boolean
    fallbackReason?: string
  }
}

interface ChatInterfaceProps {
  user: User
}

interface AgentRequestData {
  agentId: string
  task: string
  justification: string
  maxExecutionTime?: number
}

export function ChatInterface({ user }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const [showModelSettings, setShowModelSettings] = useState(false)
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [agentRequestData, setAgentRequestData] = useState<AgentRequestData | null>(null)
  const [agentJustification, setAgentJustification] = useState('')
  const [isSubmittingAgent, setIsSubmittingAgent] = useState(false)
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const getAvailableModels = () => {
    return [
      ...Object.values(AI_MODELS),
      ...Object.values(AI_AGENTS),
    ]
  }

  const getModelInfo = (modelId: string) => {
    return AI_MODELS[modelId] || AI_AGENTS[modelId] || null
  }

  const isAgentModel = (modelId: string) => {
    return !!AI_AGENTS[modelId]
  }

  const handleModelChange = (modelId: string) => {
    if (isAgentModel(modelId)) {
      // Show agent request modal
      setAgentRequestData({
        agentId: modelId,
        task: input.trim(),
        justification: '',
      })
      setShowAgentModal(true)
    } else {
      setSelectedModel(modelId)
    }
  }

  const submitAgentRequest = async () => {
    if (!agentRequestData || !agentJustification.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a justification for the agent request.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmittingAgent(true)

    try {
      const response = await fetch('/api/chat/agent-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agentRequestData.agentId,
          task: agentRequestData.task,
          justification: agentJustification,
          maxExecutionTime: agentRequestData.maxExecutionTime,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit agent request')
      }

      const data = await response.json()

      toast({
        title: 'Agent Request Submitted',
        description: `Your request has been submitted for approval. Request ID: ${data.requestId.substring(0, 8)}...`,
      })

      // Add a system message about the request
      const systemMessage: Message = {
        id: Date.now().toString(),
        content: `🤖 Agent Request Submitted\n\nYour ${AI_AGENTS[agentRequestData.agentId].name} request has been submitted for approval.\n\n**Estimated Cost:** ${formatCost(data.approvalRequest.estimatedCost)}\n**Estimated Time:** ${data.approvalRequest.estimatedTime} minutes\n**Risk Level:** ${data.approvalRequest.riskLevel}\n\nRequest ID: ${data.requestId.substring(0, 8)}...\n\nYou will be notified once the request is reviewed.`,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, systemMessage])
      setInput('')
      setShowAgentModal(false)
      setAgentRequestData(null)
      setAgentJustification('')

    } catch (error) {
      console.error('Error submitting agent request:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit agent request. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmittingAgent(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageToSend = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          model: selectedModel,
          userId: user.id,
          temperature: 0.7,
          maxTokens: 2000,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.requiresApproval) {
          // Handle agent request requirement
          setAgentRequestData({
            agentId: selectedModel,
            task: messageToSend,
            justification: '',
          })
          setShowAgentModal(true)
          return
        }
        throw new Error(data.error || 'Failed to send message')
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        metadata: data.metadata,
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    toast({
      title: 'Chat cleared',
      description: 'All messages have been removed.',
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectedModelInfo = getModelInfo(selectedModel)
  const estimatedCost = selectedModelInfo ? estimateMessageCost(input, selectedModel) : 0

  return (
    <>
      <Card className="h-full bg-slate-800/50 border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              <Sparkles className="h-3 w-3 mr-1" />
              Online
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowModelSettings(!showModelSettings)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Model
            </Button>
            
            {messages.length > 0 && (
              <Button
                onClick={clearChat}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Model Settings */}
        {showModelSettings && (
          <div className="p-4 border-b border-slate-700 bg-slate-800/30">
            <div className="space-y-3">
              <div>
                <Label className="text-gray-200 text-sm">AI Model</Label>
                <Select value={selectedModel} onValueChange={handleModelChange}>
                  <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <div className="p-2 text-xs text-gray-400 font-medium">Regular Models</div>
                    {Object.values(AI_MODELS).map((model) => (
                      <SelectItem key={model.id} value={model.id} className="text-white hover:bg-slate-600">
                        <div className="flex items-center justify-between w-full">
                          <span>{model.name}</span>
                          <div className="flex items-center space-x-2 ml-2">
                            <Badge variant="outline" className="text-xs">
                              {model.provider}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {formatCost(model.costPerToken)}/token
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                    <div className="p-2 text-xs text-gray-400 font-medium border-t border-slate-600 mt-2">
                      AI Agents (Requires Approval)
                    </div>
                    {Object.values(AI_AGENTS).map((agent) => (
                      <SelectItem key={agent.id} value={agent.id} className="text-white hover:bg-slate-600">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            {agent.id === 'deep-agent' ? (
                              <Brain className="h-3 w-3 text-purple-400" />
                            ) : (
                              <Code className="h-3 w-3 text-green-400" />
                            )}
                            <span>{agent.name}</span>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <Badge variant="outline" className={`text-xs ${
                              agent.riskLevel === 'high' ? 'border-red-500 text-red-400' :
                              agent.riskLevel === 'medium' ? 'border-yellow-500 text-yellow-400' :
                              'border-green-500 text-green-400'
                            }`}>
                              {agent.riskLevel}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              ~{formatCost(agent.estimatedCostPerRequest!)}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedModelInfo && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-gray-400">Provider:</span>
                    <p className="text-white">{selectedModelInfo.provider}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400">Max Tokens:</span>
                    <p className="text-white">{selectedModelInfo.maxTokens.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400">Cost/Token:</span>
                    <p className="text-white">{formatCost(selectedModelInfo.costPerToken)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400">Est. Cost:</span>
                    <p className="text-white">{formatCost(estimatedCost)}</p>
                  </div>
                </div>
              )}
              
              {isAgentModel(selectedModel) && (
                <Alert className="bg-yellow-900/50 border-yellow-700">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-yellow-200">
                    This is an AI agent that requires approval before execution. Higher costs and processing time apply.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-gray-400 max-w-md">
                    Select an AI model above and ask me anything! I can help with analysis, planning, research, 
                    coding, writing, and much more.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!message.isUser && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-600 text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-gray-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      
                      <div className={`flex items-center justify-between mt-2 text-xs ${
                        message.isUser ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        
                        {message.metadata && !message.isUser && (
                          <div className="flex items-center space-x-2">
                            {message.metadata.fallbackUsed && (
                              <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500">
                                Fallback
                              </Badge>
                            )}
                            {message.metadata.cost && (
                              <span className="flex items-center space-x-1">
                                <DollarSign className="h-3 w-3" />
                                <span>{formatCost(message.metadata.cost)}</span>
                              </span>
                            )}
                            {message.metadata.processingTime && (
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{message.metadata.processingTime}ms</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {message.isUser && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-slate-600 text-white">
                          <UserIcon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-600 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-slate-700 rounded-lg p-3 flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                      <p className="text-gray-300 text-sm">
                        {selectedModelInfo?.name || 'AI'} is thinking...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex space-x-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Type your message here... (${selectedModelInfo?.name || 'Select model'})`}
              className="flex-1 min-h-[40px] max-h-[120px] bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 resize-none"
              disabled={isLoading}
            />
            <div className="flex flex-col space-y-2">
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isAgentModel(selectedModel) ? (
                  <Zap className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
              
              {estimatedCost > 0 && (
                <div className="text-xs text-gray-400 text-center">
                  ~{formatCost(estimatedCost)}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Agent Request Modal */}
      <Dialog open={showAgentModal} onOpenChange={setShowAgentModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span>Agent Request</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {agentRequestData && AI_AGENTS[agentRequestData.agentId] && (
                <>
                  You're requesting <strong>{AI_AGENTS[agentRequestData.agentId].name}</strong> execution.
                  This requires approval due to higher costs and capabilities.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {agentRequestData && AI_AGENTS[agentRequestData.agentId] && (
            <div className="space-y-4">
              <Alert className={`${
                AI_AGENTS[agentRequestData.agentId].riskLevel === 'high' ? 'bg-red-900/50 border-red-700' :
                AI_AGENTS[agentRequestData.agentId].riskLevel === 'medium' ? 'bg-yellow-900/50 border-yellow-700' :
                'bg-green-900/50 border-green-700'
              }`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className={
                  AI_AGENTS[agentRequestData.agentId].riskLevel === 'high' ? 'text-red-200' :
                  AI_AGENTS[agentRequestData.agentId].riskLevel === 'medium' ? 'text-yellow-200' :
                  'text-green-200'
                }>
                  <strong>Risk Level:</strong> {AI_AGENTS[agentRequestData.agentId].riskLevel.toUpperCase()}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-400">Estimated Cost</Label>
                  <p className="text-white font-medium">
                    {formatCost(AI_AGENTS[agentRequestData.agentId].estimatedCostPerRequest!)}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400">Max Time</Label>
                  <p className="text-white font-medium">
                    {AI_AGENTS[agentRequestData.agentId].maxExecutionTime} min
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-gray-400">Task Description</Label>
                <p className="text-white text-sm bg-slate-700 p-2 rounded border border-slate-600 mt-1">
                  {agentRequestData.task}
                </p>
              </div>

              <div>
                <Label htmlFor="justification" className="text-gray-200">
                  Justification <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="justification"
                  value={agentJustification}
                  onChange={(e) => setAgentJustification(e.target.value)}
                  placeholder="Explain why this agent execution is necessary and justified..."
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAgentModal(false)}
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={submitAgentRequest}
              disabled={!agentJustification.trim() || isSubmittingAgent}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isSubmittingAgent ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
