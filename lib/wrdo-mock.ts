export function useMockWRDO() {
  return {
    state: {
      currentUser: {
        id: 'mock-user-1',
        name: 'Admin User',
        email: 'admin@wrdo.cave',
        role: 'admin',
      },
      currentPage: null,
      activeModels: [],
      notifications: [],
      systemHealth: {
        aiStatus: 'healthy',
        dbStatus: 'connected',
        apiStatus: {
          openai: 'connected',
          gmail: 'connected',
          paystack: 'connected',
        },
      },
      pageAwareness: {
        entitiesOnPage: [],
      },
    },
    actions: {
      updateMemory: (memory: any) => {
        console.log('Mock updateMemory called:', memory);
      },
      addNotification: (notification: any) => {
        console.log('Mock notification:', notification);
      },
      initializeWRDO: () => {},
      setCurrentUser: () => {},
      updatePageContext: () => {},
      selectModel: () => {},
      suggestActions: () => {},
      logAction: () => {},
    },
  };
}
