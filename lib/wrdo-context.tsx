
'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Core types for WRDO global context
export interface WRDOUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'agent';
  permissions: string[];
  lastLogin?: Date;
  ipAddress?: string;
  device?: string;
}

export interface WRDOPage {
  path: string;
  title: string;
  type: 'dashboard' | 'chat' | 'settings' | 'admin' | 'monitoring';
  entities: string[];
  permissions: string[];
  lastVisited?: Date;
  context?: Record<string, any>;
}

export interface WRDOAIModel {
  id: string;
  name: string;
  provider: 'openai' | 'gemini' | 'deepseek';
  isActive: boolean;
  isPrimary: boolean;
  costPerToken: number;
  fallbackOrder: number;
}

export interface WRDOMemory {
  userId: string;
  pageContext: Record<string, any>;
  sessionContext: Record<string, any>;
  userPreferences: Record<string, any>;
  conversationHistory: Array<{
    timestamp: Date;
    message: string;
    response: string;
    model: string;
    cost: number;
  }>;
}

export interface WRDOState {
  // Core system state
  isInitialized: boolean;
  currentUser: WRDOUser | null;
  currentPage: WRDOPage | null;
  
  // AI & Models
  activeModels: WRDOAIModel[];
  selectedModel: string | null;
  fallbackChain: string[];
  
  // Memory & Context
  memory: WRDOMemory | null;
  pageAwareness: {
    entitiesOnPage: any[];
    availableActions: string[];
    suggestions: string[];
  };
  
  // System status
  systemHealth: {
    aiStatus: 'healthy' | 'degraded' | 'offline';
    dbStatus: 'connected' | 'degraded' | 'offline';
    apiStatus: Record<string, 'connected' | 'error' | 'disabled'>;
  };
  
  // Real-time data
  dashboardData: Record<string, any>;
  notifications: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
}

type WRDOAction = 
  | { type: 'INITIALIZE'; payload: Partial<WRDOState> }
  | { type: 'SET_USER'; payload: WRDOUser }
  | { type: 'SET_PAGE'; payload: WRDOPage }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'UPDATE_MEMORY'; payload: Partial<WRDOMemory> }
  | { type: 'UPDATE_PAGE_ENTITIES'; payload: any[] }
  | { type: 'ADD_NOTIFICATION'; payload: WRDOState['notifications'][0] }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'UPDATE_SYSTEM_HEALTH'; payload: Partial<WRDOState['systemHealth']> }
  | { type: 'UPDATE_DASHBOARD_DATA'; payload: { key: string; data: any } }
  | { type: 'SET_AI_SUGGESTIONS'; payload: string[] };

const initialState: WRDOState = {
  isInitialized: false,
  currentUser: null,
  currentPage: null,
  activeModels: [],
  selectedModel: null,
  fallbackChain: ['gpt-4o', 'gemini-pro', 'deepseek-chat'],
  memory: null,
  pageAwareness: {
    entitiesOnPage: [],
    availableActions: [],
    suggestions: [],
  },
  systemHealth: {
    aiStatus: 'healthy',
    dbStatus: 'connected',
    apiStatus: {},
  },
  dashboardData: {},
  notifications: [],
};

function wrdoReducer(state: WRDOState, action: WRDOAction): WRDOState {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, ...action.payload, isInitialized: true };
      
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
      
    case 'SET_PAGE':
      return { 
        ...state, 
        currentPage: action.payload,
        pageAwareness: {
          ...state.pageAwareness,
          entitiesOnPage: [],
          availableActions: getPageActions(action.payload.type),
          suggestions: [],
        }
      };
      
    case 'SET_MODEL':
      return { ...state, selectedModel: action.payload };
      
    case 'UPDATE_MEMORY':
      return {
        ...state,
        memory: state.memory 
          ? { ...state.memory, ...action.payload }
          : action.payload as WRDOMemory
      };
      
    case 'UPDATE_PAGE_ENTITIES':
      return {
        ...state,
        pageAwareness: {
          ...state.pageAwareness,
          entitiesOnPage: action.payload,
        }
      };
      
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications.slice(0, 19)] // Keep last 20
      };
      
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, read: true } : n
        )
      };
      
    case 'UPDATE_SYSTEM_HEALTH':
      return {
        ...state,
        systemHealth: { ...state.systemHealth, ...action.payload }
      };
      
    case 'UPDATE_DASHBOARD_DATA':
      return {
        ...state,
        dashboardData: { ...state.dashboardData, [action.payload.key]: action.payload.data }
      };
      
    case 'SET_AI_SUGGESTIONS':
      return {
        ...state,
        pageAwareness: {
          ...state.pageAwareness,
          suggestions: action.payload
        }
      };
      
    default:
      return state;
  }
}

// Helper function to get available actions based on page type
function getPageActions(pageType: string): string[] {
  const actions: Record<string, string[]> = {
    dashboard: ['create_entry', 'edit_entry', 'delete_entry', 'export_data', 'analyze_trends'],
    chat: ['send_message', 'upload_file', 'change_model', 'save_conversation', 'voice_input'],
    settings: ['update_setting', 'manage_api_keys', 'backup_data', 'reset_preferences'],
    admin: ['manage_users', 'view_logs', 'system_health', 'security_events', 'manage_permissions'],
    monitoring: ['view_metrics', 'set_alerts', 'export_logs', 'investigate_issues'],
  };
  
  return actions[pageType] || [];
}

const WRDOContext = createContext<{
  state: WRDOState;
  dispatch: React.Dispatch<WRDOAction>;
  actions: {
    initializeWRDO: (initialData?: Partial<WRDOState>) => void;
    setCurrentUser: (user: WRDOUser) => void;
    updatePageContext: (page: WRDOPage) => void;
    selectModel: (modelId: string) => void;
    addNotification: (notification: Omit<WRDOState['notifications'][0], 'id' | 'timestamp'>) => void;
    updateMemory: (memory: Partial<WRDOMemory>) => void;
    suggestActions: (context?: any) => void;
    logAction: (action: string, details?: any) => void;
  };
} | null>(null);

export function WRDOProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wrdoReducer, initialState);
  const pathname = usePathname();

  // Page awareness - detect current page and update context
  useEffect(() => {
    const pageInfo = analyzeCurrentPage(pathname);
    dispatch({ type: 'SET_PAGE', payload: pageInfo });
    
    // loadPageData(pageInfo.path);
  }, [pathname]);

  // Initialize WRDO system
  const initializeWRDO = (initialData?: Partial<WRDOState>) => {
    dispatch({ type: 'INITIALIZE', payload: initialData || {} });
    
    // Load user data, preferences, and system status
    loadSystemData();
  };

  const setCurrentUser = (user: WRDOUser) => {
    dispatch({ type: 'SET_USER', payload: user });
    
    // Initialize user-specific memory
    initializeUserMemory(user.id);
  };

  const updatePageContext = (page: WRDOPage) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  const selectModel = (modelId: string) => {
    dispatch({ type: 'SET_MODEL', payload: modelId });
    
    // Log model selection
    logAction('model_selected', { modelId, page: state.currentPage?.path });
  };

  const addNotification = (notification: Omit<WRDOState['notifications'][0], 'id' | 'timestamp'>) => {
    const fullNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: fullNotification });
  };

  const updateMemory = (memory: Partial<WRDOMemory>) => {
    dispatch({ type: 'UPDATE_MEMORY', payload: memory });
    
    // Persist memory to localStorage for session continuity
    persistMemory(memory);
  };

  const suggestActions = (context?: any) => {
    const suggestions = generateAISuggestions(state.currentPage, state.pageAwareness.entitiesOnPage, context);
    dispatch({ type: 'SET_AI_SUGGESTIONS', payload: suggestions });
  };

  const logAction = (action: string, details?: any) => {
    // Log action for audit trail
    console.log('WRDO Action:', { action, details, user: state.currentUser?.id, page: state.currentPage?.path });
    
    // In production, this would send to audit log API
  };

  // Load system data on initialization
  const loadSystemData = async () => {
    try {
      // Load system health status
      const health = await checkSystemHealth();
      dispatch({ type: 'UPDATE_SYSTEM_HEALTH', payload: health });
      
      // Load available AI models
      const models = await loadAIModels();
      dispatch({ type: 'INITIALIZE', payload: { activeModels: models } });
      
    } catch (error) {
      console.error('System initialization error:', error);
      // addNotification({
      //   type: 'error',
      //   title: 'System Initialization Error',
      //   message: 'Failed to load system data',
      //   read: false,
      // });
    }
  };

  // Load page-specific data
  const loadPageData = async (path: string) => {
    try {
      // Load entities and context for current page
      const pageData = await fetchPageData(path);
      dispatch({ type: 'UPDATE_PAGE_ENTITIES', payload: pageData.entities || [] });
      dispatch({ type: 'UPDATE_DASHBOARD_DATA', payload: { key: path, data: pageData } });
      
    } catch (error) {
      console.error('Failed to load page data:', error);
    }
  };

  const actions = {
    initializeWRDO,
    setCurrentUser,
    updatePageContext,
    selectModel,
    addNotification,
    updateMemory,
    suggestActions,
    logAction,
  };

  return (
    <WRDOContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </WRDOContext.Provider>
  );
}

export function useWRDO() {
  const context = useContext(WRDOContext);
  if (!context) {
    throw new Error('useWRDO must be used within a WRDOProvider');
  }
  return context;
}

// Helper functions
function analyzeCurrentPage(pathname: string): WRDOPage {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  let pageType: WRDOPage['type'] = 'dashboard';
  let title = 'Dashboard';
  let entities: string[] = [];
  let permissions: string[] = [];

  if (pathname === '/') {
    title = 'Home';
    pageType = 'dashboard';
  } else if (pathname.startsWith('/chat')) {
    title = 'AI Chat';
    pageType = 'chat';
    entities = ['messages', 'conversations', 'models'];
    permissions = ['chat.send', 'chat.upload'];
  } else if (pathname.startsWith('/dashboard')) {
    pageType = 'dashboard';
    if (pathname.includes('/admin')) {
      title = 'Admin Dashboard';
      entities = ['users', 'system', 'logs'];
      permissions = ['admin.view', 'admin.manage'];
    } else if (pathname.includes('/ai')) {
      title = 'AI Operations';
      entities = ['models', 'agents', 'costs'];
      permissions = ['ai.configure'];
    } else if (pathname.includes('/finances')) {
      title = 'Financial Management';
      entities = ['transactions', 'invoices', 'budgets'];
      permissions = ['finance.view', 'finance.edit'];
    } else if (pathname.includes('/projects')) {
      title = 'Project Management';
      entities = ['projects', 'tasks', 'timelines'];
      permissions = ['projects.view', 'projects.edit'];
    } else {
      title = 'Dashboard Overview';
      entities = ['overview', 'metrics', 'alerts'];
    }
  } else if (pathname.startsWith('/settings')) {
    title = 'Settings';
    pageType = 'settings';
    entities = ['preferences', 'api_keys', 'integrations'];
    permissions = ['settings.view', 'settings.edit'];
  }

  return {
    path: pathname,
    title,
    type: pageType,
    entities,
    permissions,
    lastVisited: new Date(),
  };
}

async function checkSystemHealth(): Promise<Partial<WRDOState['systemHealth']>> {
  // Simulate system health check
  return {
    aiStatus: 'healthy',
    dbStatus: 'connected',
    apiStatus: {
      openai: 'connected',
      gmail: 'connected',
      paystack: 'connected',
    },
  };
}

async function loadAIModels(): Promise<WRDOAIModel[]> {
  // Simulate loading AI models
  return [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', isActive: true, isPrimary: true, costPerToken: 0.00003, fallbackOrder: 1 },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'gemini', isActive: true, isPrimary: false, costPerToken: 0.000001, fallbackOrder: 2 },
    { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek', isActive: true, isPrimary: false, costPerToken: 0.0000005, fallbackOrder: 3 },
  ];
}

async function fetchPageData(path: string): Promise<{ entities: any[] }> {
  // Simulate fetching page-specific data
  return { entities: [] };
}

function initializeUserMemory(userId: string) {
  const storedMemory = localStorage.getItem(`wrdo_memory_${userId}`);
  if (storedMemory) {
    try {
      const memory = JSON.parse(storedMemory);
      // Dispatch to context
    } catch (error) {
      console.error('Failed to load stored memory:', error);
    }
  }
}

function persistMemory(memory: Partial<WRDOMemory>) {
  if (memory.userId) {
    localStorage.setItem(`wrdo_memory_${memory.userId}`, JSON.stringify(memory));
  }
}

function generateAISuggestions(page: WRDOPage | null, entities: any[], context?: any): string[] {
  if (!page) return [];
  
  const suggestions: string[] = [];
  
  // Page-specific suggestions
  switch (page.type) {
    case 'dashboard':
      suggestions.push('Analyze recent trends', 'Generate report', 'Set up alerts');
      break;
    case 'chat':
      suggestions.push('Upload document for analysis', 'Switch to specialized model', 'Save conversation');
      break;
    case 'settings':
      suggestions.push('Test API connections', 'Backup configurations', 'Review security settings');
      break;
  }
  
  // Entity-based suggestions
  if (entities.length > 0) {
    suggestions.push(`Process ${entities.length} items`);
  }
  
  return suggestions;
}
