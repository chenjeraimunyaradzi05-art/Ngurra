/**
 * Socket Service Tests
 * 
 * Tests for the real-time socket communication service
 */

import { io } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

// Import after mocks are set up
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  connected: false,
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket),
}));

jest.mock('expo-secure-store');

describe('SocketService', () => {
  let socketService: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Mock token
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-token');
    
    // Reset socket mock
    mockSocket.connected = false;
    mockSocket.on.mockClear();
    mockSocket.emit.mockClear();
    mockSocket.disconnect.mockClear();
  });
  
  afterEach(() => {
    if (socketService) {
      socketService.disconnect();
    }
  });
  
  describe('Connection Management', () => {
    it('should not connect without auth token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      
      // Re-import to get fresh instance
      const { socketService: service } = await import('../services/socket');
      socketService = service;
      
      await service.connect().catch(() => {});
      
      expect(service.getConnectionState()).toBe('error');
    });
    
    it('should initialize with disconnected state', async () => {
      const { socketService: service } = await import('../services/socket');
      socketService = service;
      
      expect(service.getConnectionState()).toBe('disconnected');
      expect(service.isConnected()).toBe(false);
    });
  });
  
  describe('Message Queue', () => {
    it('should queue messages when disconnected', async () => {
      const { socketService: service } = await import('../services/socket');
      socketService = service;
      
      // Emit without connecting
      service.emit('test_event', { data: 'test' });
      
      // Message should be queued, not sent
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });
  
  describe('Typing Indicators', () => {
    it('should send typing start event', async () => {
      const { socketService: service, MESSAGE_TYPES } = await import('../services/socket');
      socketService = service;
      
      const conversationId = 'conv-123';
      service.startTyping(conversationId);
      
      // Should queue the typing event
      // In real scenario would emit when connected
    });
    
    it('should send typing stop event', async () => {
      const { socketService: service } = await import('../services/socket');
      socketService = service;
      
      const conversationId = 'conv-123';
      service.stopTyping(conversationId);
      
      // Should handle typing stop
    });
  });
  
  describe('Conversation Management', () => {
    it('should join conversation', async () => {
      const { socketService: service } = await import('../services/socket');
      socketService = service;
      
      service.joinConversation('conv-123');
      
      // Should queue join event
    });
    
    it('should leave conversation', async () => {
      const { socketService: service } = await import('../services/socket');
      socketService = service;
      
      service.joinConversation('conv-123');
      service.leaveConversation();
      
      // Should clear current conversation
    });
  });
  
  describe('Presence Cache', () => {
    it('should return null for unknown users', async () => {
      const { socketService: service } = await import('../services/socket');
      socketService = service;
      
      const presence = service.getPresence('unknown-user');
      expect(presence).toBeNull();
    });
  });
});
