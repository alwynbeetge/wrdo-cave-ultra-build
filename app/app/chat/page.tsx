
'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, 
  Upload, 
  Mic, 
  Settings, 
  Brain, 
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Image,
  Bot
} from 'lucide-react';
import { useWRDO } from '@/lib/wrdo-context';
import { WRDOLayout } from '@/components/layout/wrdo-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { AI_MODELS, AI_AGENTS, aiRouter, estimateMessageCost, formatCost } from '@/lib/ai-router';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  cost?: number;
  processingTime?: number;
  isAgent?: boolean;
  needsApproval?: boolean;
  approved?: boolean;
  metadata?: any;
}

interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

export default function ChatPage() {
  const { state, actions } = useWRDO();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      content: 'Welcome to WRDO Cave Ultra AI Chat! I\'m your intelligent assistant with access to multiple AI models and autonomous agents. How can I help you today?',
      timestamp: new Date(),
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [conversationCost, setConversationCost] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user data for layout
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Simulate getting user data
    const userData = {
      id: 'user_1',
      name: 'Admin User',
      email: 'admin@wrdo.cave',
      role: 'admin',
      permissions: ['chat.send', 'chat.upload', 'ai.configure', 'agent.approve'],
    };
    setUser(userData);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Update conversation context
    actions.updateMemory({
      userId: state.currentUser?.id || 'unknown',
      pageContext: {
        messageCount: messages.length,
        selectedModel,
        conversationCost,
        lastMessage: messages[messages.length - 1]?.timestamp,
      },
      sessionContext: {},
      userPreferences: { preferredModel: selectedModel },
      conversationHistory: messages.slice(-10).map(m => ({
        timestamp: m.timestamp,
        message: m.role === 'user' ? m.content : '',
        response: m.role === 'assistant' ? m.content : '',
        model: m.model || selectedModel,
        cost: m.cost || 0,
      }))
    });
  }, [messages, selectedModel, conversationCost, actions, state.currentUser?.id]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() && uploadedFiles.length === 0) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Check if it's an agent request
      const isAgentRequest = AI_AGENTS[selectedModel];
      
      if (isAgentRequest) {
        // Handle agent approval flow
        const approvalRequest = await aiRouter.requestAgentExecution(
          selectedModel,
          currentMessage,
          {
            userId: state.currentUser?.id || 'unknown',
            justification: 'User requested agent execution',
          }
        );

        const agentMessage: ChatMessage = {
          id: `msg_${Date.now()}_agent`,
          role: 'assistant',
          content: `🤖 **Agent Execution Request**\n\nAgent: ${AI_AGENTS[selectedModel].name}\nTask: ${currentMessage}\nEstimated Cost: ${formatCost(approvalRequest.estimatedCost)}\nEstimated Time: ${approvalRequest.estimatedTime} minutes\nRisk Level: ${approvalRequest.riskLevel}\n\nThis request requires approval before execution. Would you like to proceed?`,
          timestamp: new Date(),
          isAgent: true,
          needsApproval: true,
          approved: false,
        };

        setMessages(prev => [...prev, agentMessage]);
      } else {
        // Regular AI model request
        const chatMessages = messages.slice(-10).map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        }));
        
        chatMessages.push({ role: 'user', content: currentMessage });

        const response = await aiRouter.chatCompletion(chatMessages, selectedModel, {
          userId: state.currentUser?.id,
          conversationId: `chat_${Date.now()}`,
        });

        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}_ai`,
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          model: response.model,
          cost: response.cost,
          processingTime: response.processingTime,
          metadata: {
            provider: response.provider,
            tokensUsed: response.tokensUsed,
            fallbackUsed: response.fallbackUsed,
            fallbackReason: response.fallbackReason,
          },
        };

        setMessages(prev => [...prev, assistantMessage]);
        setConversationCost(prev => prev + response.cost);

        // Add notification for successful response
        actions.addNotification({
          type: 'success',
          title: 'AI Response Generated',
          message: `Response from ${response.model} - Cost: ${formatCost(response.cost)}`,
          read: false,
        });
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: `❌ **Error**: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      actions.addNotification({
        type: 'error',
        title: 'AI Request Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        read: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveAgent = async (messageId: string) => {
    // Simulate agent approval and execution
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      approved: true,
      content: updatedMessages[messageIndex].content.replace('Would you like to proceed?', '✅ **Approved - Executing...**'),
    };
    setMessages(updatedMessages);

    // Simulate agent execution
    setTimeout(() => {
      const resultMessage: ChatMessage = {
        id: `msg_${Date.now()}_agent_result`,
        role: 'assistant',
        content: `🤖 **Agent Execution Complete**\n\nAgent: ${AI_AGENTS[selectedModel].name}\nExecution Time: 2.5 minutes\nCost: ${formatCost(5.00)}\nStatus: ✅ Success\n\n**Results:**\n- Comprehensive analysis completed\n- 15 data points processed\n- 3 recommendations generated\n- Full report available for download`,
        timestamp: new Date(),
        isAgent: true,
        cost: 5.00,
      };
      setMessages(prev => [...prev, resultMessage]);
      setConversationCost(prev => prev + 5.00);
    }, 3000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      const fileUpload: FileUpload = {
        id: `file_${Date.now()}_${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
      };

      setUploadedFiles(prev => [...prev, fileUpload]);
    });

    actions.addNotification({
      type: 'success',
      title: 'Files Uploaded',
      message: `${files.length} file(s) uploaded successfully`,
      read: false,
    });
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    actions.addNotification({
      type: 'info',
      title: 'Voice Feature',
      message: isRecording ? 'Voice recording stopped' : 'Voice recording started (placeholder)',
      read: false,
    });
  };

  const estimateCost = (message: string) => {
    return estimateMessageCost(message, selectedModel);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <WRDOLayout user={user}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">AI Chat Interface</h1>
              <p className="text-slate-400">Intelligent conversation with multiple AI models and agents</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-blue-300 border-blue-400/30">
                {messages.filter(m => m.role !== 'system').length} messages
              </Badge>
              <Badge variant="outline" className="text-green-300 border-green-400/30">
                Total: {formatCost(conversationCost)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card className="bg-slate-800/50 border-slate-700 h-[70vh] flex flex-col">
                <CardHeader className="border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      WRDO AI Chat
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {Object.values(AI_MODELS).map((model) => (
                            <SelectItem key={model.id} value={model.id} className="text-white hover:bg-slate-600">
                              {model.name} - {formatCost(model.costPerToken * 1000)}/1k tokens
                            </SelectItem>
                          ))}
                          {Object.values(AI_AGENTS).map((agent) => (
                            <SelectItem key={agent.id} value={agent.id} className="text-white hover:bg-slate-600">
                              🤖 {agent.name} - ${agent.estimatedCostPerRequest}/request
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : message.role === 'system'
                            ? 'bg-slate-700/50 text-slate-300 border border-slate-600'
                            : 'bg-slate-700 text-white'
                        }`}>
                          {message.isAgent && (
                            <div className="flex items-center gap-2 mb-2">
                              <Bot className="h-4 w-4" />
                              <span className="text-xs font-medium">AI Agent</span>
                            </div>
                          )}
                          
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          
                          {message.needsApproval && !message.approved && (
                            <div className="mt-3 flex gap-2">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveAgent(message.id)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-400 text-red-300 hover:bg-red-500/20">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Deny
                              </Button>
                            </div>
                          )}
                          
                          <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                            <span>{message.timestamp.toLocaleTimeString()}</span>
                            {message.model && <span>Model: {message.model}</span>}
                            {message.cost && <span>Cost: {formatCost(message.cost)}</span>}
                            {message.processingTime && <span>Time: {message.processingTime}ms</span>}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-slate-700 text-white rounded-lg p-4 max-w-[80%]">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>AI is thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </CardContent>
                
                {/* Input Area */}
                <div className="p-4 border-t border-slate-700">
                  {uploadedFiles.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {uploadedFiles.map((file) => (
                        <Badge key={file.id} variant="outline" className="text-blue-300 border-blue-400/30">
                          <FileText className="h-3 w-3 mr-1" />
                          {file.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Textarea
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="bg-slate-700 border-slate-600 text-white resize-none"
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      {currentMessage && (
                        <div className="mt-1 text-xs text-slate-400">
                          Estimated cost: {formatCost(estimateCost(currentMessage))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-white border-slate-600"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleVoiceToggle}
                        className={`text-white border-slate-600 ${isRecording ? 'bg-red-500/20' : ''}`}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={handleSendMessage}
                        disabled={isLoading || (!currentMessage.trim() && uploadedFiles.length === 0)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Model Info */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Current Model</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {AI_MODELS[selectedModel] ? (
                    <>
                      <div>
                        <p className="text-white font-medium">{AI_MODELS[selectedModel].name}</p>
                        <p className="text-xs text-slate-400">{AI_MODELS[selectedModel].provider}</p>
                      </div>
                      <div className="text-xs text-slate-300">
                        <p>Cost: {formatCost(AI_MODELS[selectedModel].costPerToken * 1000)}/1k tokens</p>
                        <p>Max tokens: {AI_MODELS[selectedModel].maxTokens.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {AI_MODELS[selectedModel].capabilities.map((cap) => (
                          <Badge key={cap} variant="outline" className="text-xs text-slate-300">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </>
                  ) : AI_AGENTS[selectedModel] ? (
                    <>
                      <div>
                        <p className="text-white font-medium">{AI_AGENTS[selectedModel].name}</p>
                        <p className="text-xs text-slate-400">AI Agent</p>
                      </div>
                      <div className="text-xs text-slate-300">
                        <p>Est. cost: ${AI_AGENTS[selectedModel].estimatedCostPerRequest}/request</p>
                        <p>Max time: {AI_AGENTS[selectedModel].maxExecutionTime} minutes</p>
                        <p>Risk: {AI_AGENTS[selectedModel].riskLevel}</p>
                      </div>
                      <p className="text-xs text-slate-400">{AI_AGENTS[selectedModel].description}</p>
                    </>
                  ) : null}
                </CardContent>
              </Card>

              {/* Conversation Stats */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Session Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Messages:</span>
                    <span className="text-white">{messages.filter(m => m.role !== 'system').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Cost:</span>
                    <span className="text-white">{formatCost(conversationCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Files Uploaded:</span>
                    <span className="text-white">{uploadedFiles.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-white border-slate-600"
                    onClick={() => setMessages([messages[0]])}
                  >
                    Clear Chat
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-white border-slate-600"
                    onClick={() => {
                      actions.addNotification({
                        type: 'info',
                        title: 'Export Chat',
                        message: 'Chat export feature will be implemented',
                        read: false,
                      });
                    }}
                  >
                    <Download className="h-3 w-3 mr-2" />
                    Export Chat
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-white border-slate-600"
                    onClick={() => window.location.href = '/dashboard/ai'}
                  >
                    <Settings className="h-3 w-3 mr-2" />
                    AI Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </WRDOLayout>
  );
}
