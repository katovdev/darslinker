/**
 * Property Tests for Real-time Blog Service
 * 
 * **Feature: blog-integration, Property 6: Real-time Content Updates**
 * **Validates: Requirements 4.3, 4.4**
 * 
 * These tests validate that real-time content updates work correctly
 * and maintain system integrity across various scenarios.
 */

import RealTimeBlogService from '../real-time-blog.service.js';
import blogService from '../blog.service.js';

// Mock the blog service
jest.mock('../blog.service.js');

describe('Real-time Blog Service Property Tests', () => {
  let realTimeService;

  beforeEach(() => {
    realTimeService = new RealTimeBlogService();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    realTimeService.destroy();
    jest.useRealTimers();
  });

  describe('Property 6: Real-time Content Updates', () => {
    /**
     * Property: Real-time updates must maintain system integrity
     * - Subscribers must be notified of content changes
     * - Polling must start/stop correctly based on subscriber count
     * - Content changes must be detected accurately
     * - Error handling must not disrupt the service
     */

    test('Property: Subscribers are notified of content changes', async () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();

      // Mock initial content
      const initialContent = [
        { id: '1', title: 'Blog 1', views: 100 }
      ];
      
      // Mock updated content
      const updatedContent = [
        { id: '1', title: 'Blog 1 Updated', views: 150 }
      ];

      blogService.getFeaturedBlogsForLanding
        .mockResolvedValueOnce(initialContent)
        .mockResolvedValueOnce(updatedContent);

      // Subscribe two callbacks
      realTimeService.subscribe('sub1', mockCallback1);
      realTimeService.subscribe('sub2', mockCallback2);

      // Property: Initial load calls both subscribers
      expect(mockCallback1).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'content-loaded',
          data: initialContent
        })
      );
      expect(mockCallback2).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'content-loaded',
          data: initialContent
        })
      );

      // Clear previous calls
      mockCallback1.mockClear();
      mockCallback2.mockClear();

      // Trigger update check
      await realTimeService.checkForUpdates();

      // Property: Content change notifies all subscribers
      expect(mockCallback1).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'content-updated',
          data: updatedContent
        })
      );
      expect(mockCallback2).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'content-updated',
          data: updatedContent
        })
      );
    });

    test('Property: Polling starts and stops based on subscriber count', () => {
      const mockCallback = jest.fn();

      // Property: No polling initially
      expect(realTimeService.isPolling).toBe(false);

      // Subscribe first subscriber
      realTimeService.subscribe('sub1', mockCallback);

      // Property: Polling starts with first subscriber
      expect(realTimeService.isPolling).toBe(true);
      expect(realTimeService.intervalId).toBeTruthy();

      // Subscribe second subscriber
      realTimeService.subscribe('sub2', mockCallback);

      // Property: Polling continues with multiple subscribers
      expect(realTimeService.isPolling).toBe(true);

      // Unsubscribe first subscriber
      realTimeService.unsubscribe('sub1');

      // Property: Polling continues with remaining subscribers
      expect(realTimeService.isPolling).toBe(true);

      // Unsubscribe last subscriber
      realTimeService.unsubscribe('sub2');

      // Property: Polling stops when no subscribers remain
      expect(realTimeService.isPolling).toBe(false);
      expect(realTimeService.intervalId).toBeFalsy();
    });

    test('Property: Content changes are detected accurately', async () => {
      const mockCallback = jest.fn();

      const content1 = [
        { id: '1', title: 'Blog 1', views: 100 }
      ];
      
      const content2 = [
        { id: '1', title: 'Blog 1', views: 100 }
      ]; // Same content
      
      const content3 = [
        { id: '1', title: 'Blog 1', views: 150 }
      ]; // Different views

      blogService.getFeaturedBlogsForLanding
        .mockResolvedValueOnce(content1)
        .mockResolvedValueOnce(content2)
        .mockResolvedValueOnce(content3);

      realTimeService.subscribe('sub1', mockCallback);

      // Initial load
      const hash1 = realTimeService.generateContentHash(content1);
      expect(hash1).toBeTruthy();

      mockCallback.mockClear();

      // Check with same content
      await realTimeService.checkForUpdates();
      const hash2 = realTimeService.generateContentHash(content2);

      // Property: Same content generates same hash
      expect(hash1).toBe(hash2);
      // Property: No update notification for same content
      expect(mockCallback).not.toHaveBeenCalled();

      // Check with different content
      await realTimeService.checkForUpdates();
      const hash3 = realTimeService.generateContentHash(content3);

      // Property: Different content generates different hash
      expect(hash1).not.toBe(hash3);
      // Property: Update notification for different content
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'content-updated',
          data: content3
        })
      );
    });

    test('Property: Error handling does not disrupt service', async () => {
      const mockCallback = jest.fn();

      // Mock API error
      blogService.getFeaturedBlogsForLanding.mockRejectedValue(
        new Error('Network Error')
      );

      realTimeService.subscribe('sub1', mockCallback);

      // Property: Error is handled gracefully
      await realTimeService.checkForUpdates();

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          error: 'Network Error'
        })
      );

      // Property: Service continues to function after error
      expect(realTimeService.isPolling).toBe(true);
      expect(realTimeService.subscribers.size).toBe(1);
    });

    test('Property: Manual content updates work correctly', async () => {
      const mockCallback = jest.fn();

      realTimeService.subscribe('sub1', mockCallback);
      mockCallback.mockClear();

      const manualContent = [
        { id: '2', title: 'Manual Blog', views: 200 }
      ];

      // Property: Manual update notifies subscribers
      await realTimeService.pushContentUpdate(manualContent);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'manual-update',
          data: manualContent
        })
      );

      // Property: Content hash is updated
      const expectedHash = realTimeService.generateContentHash(manualContent);
      expect(realTimeService.contentHash).toBe(expectedHash);
    });

    test('Property: Update interval can be changed dynamically', () => {
      const mockCallback = jest.fn();
      const originalInterval = realTimeService.updateInterval;

      realTimeService.subscribe('sub1', mockCallback);

      // Property: Initial interval is set
      expect(realTimeService.updateInterval).toBe(originalInterval);

      // Change interval
      const newInterval = 10000; // 10 seconds
      realTimeService.setUpdateInterval(newInterval);

      // Property: Interval is updated
      expect(realTimeService.updateInterval).toBe(newInterval);

      // Property: Polling is restarted with new interval
      expect(realTimeService.isPolling).toBe(true);
    });

    test('Property: Service status provides accurate information', () => {
      const mockCallback = jest.fn();

      // Property: Initial status
      let status = realTimeService.getStatus();
      expect(status.isPolling).toBe(false);
      expect(status.subscriberCount).toBe(0);
      expect(status.lastUpdateTime).toBeFalsy();

      // Subscribe and check status
      realTimeService.subscribe('sub1', mockCallback);
      status = realTimeService.getStatus();

      // Property: Status reflects current state
      expect(status.isPolling).toBe(true);
      expect(status.subscriberCount).toBe(1);
      expect(status.updateInterval).toBeTruthy();
    });

    test('Property: Content hash generation is consistent', () => {
      const content1 = [
        { id: '1', title: 'Blog 1', views: 100, extra: 'ignored' }
      ];
      
      const content2 = [
        { id: '1', title: 'Blog 1', views: 100, different: 'field' }
      ];
      
      const content3 = [
        { id: '1', title: 'Blog 1', views: 101 }
      ];

      // Property: Same relevant data generates same hash
      const hash1 = realTimeService.generateContentHash(content1);
      const hash2 = realTimeService.generateContentHash(content2);
      expect(hash1).toBe(hash2);

      // Property: Different relevant data generates different hash
      const hash3 = realTimeService.generateContentHash(content3);
      expect(hash1).not.toBe(hash3);

      // Property: Empty/invalid content generates empty hash
      expect(realTimeService.generateContentHash(null)).toBe('');
      expect(realTimeService.generateContentHash([])).toBeTruthy();
    });

    test('Property: Subscriber callback errors do not affect other subscribers', async () => {
      const mockCallback1 = jest.fn().mockRejectedValue(new Error('Callback Error'));
      const mockCallback2 = jest.fn();

      const content = [
        { id: '1', title: 'Blog 1', views: 100 }
      ];

      blogService.getFeaturedBlogsForLanding.mockResolvedValue(content);

      realTimeService.subscribe('sub1', mockCallback1);
      realTimeService.subscribe('sub2', mockCallback2);

      // Property: Error in one callback doesn't prevent others
      await realTimeService.checkForUpdates();

      expect(mockCallback1).toHaveBeenCalled();
      expect(mockCallback2).toHaveBeenCalled();
    });

    test('Property: Force update bypasses normal timing', async () => {
      const mockCallback = jest.fn();

      const content = [
        { id: '1', title: 'Blog 1', views: 100 }
      ];

      blogService.getFeaturedBlogsForLanding.mockResolvedValue(content);

      realTimeService.subscribe('sub1', mockCallback);
      mockCallback.mockClear();

      // Property: Force update triggers immediate check
      await realTimeService.forceUpdate();

      expect(blogService.getFeaturedBlogsForLanding).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalled();
    });

    test('Property: Service cleanup works correctly', () => {
      const mockCallback = jest.fn();

      realTimeService.subscribe('sub1', mockCallback);
      realTimeService.subscribe('sub2', mockCallback);

      // Property: Service is active
      expect(realTimeService.isPolling).toBe(true);
      expect(realTimeService.subscribers.size).toBe(2);

      // Destroy service
      realTimeService.destroy();

      // Property: Service is completely cleaned up
      expect(realTimeService.isPolling).toBe(false);
      expect(realTimeService.subscribers.size).toBe(0);
      expect(realTimeService.intervalId).toBeFalsy();
      expect(realTimeService.contentHash).toBeFalsy();
      expect(realTimeService.lastUpdateTime).toBeFalsy();
    });

    test('Property: Periodic updates work correctly', async () => {
      const mockCallback = jest.fn();

      const content1 = [{ id: '1', title: 'Blog 1', views: 100 }];
      const content2 = [{ id: '1', title: 'Blog 1', views: 200 }];

      blogService.getFeaturedBlogsForLanding
        .mockResolvedValueOnce(content1)
        .mockResolvedValueOnce(content2);

      realTimeService.subscribe('sub1', mockCallback);
      mockCallback.mockClear();

      // Property: Periodic update is triggered by timer
      jest.advanceTimersByTime(realTimeService.updateInterval);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(blogService.getFeaturedBlogsForLanding).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'content-updated'
        })
      );
    });
  });
});