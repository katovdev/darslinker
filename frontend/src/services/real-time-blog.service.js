import blogService from './blog.service.js';

/**
 * Real-time Blog Service
 * Handles real-time updates for blog content without requiring code deployment
 */
class RealTimeBlogService {
  constructor() {
    this.subscribers = new Map();
    this.updateInterval = 5 * 60 * 1000; // 5 minutes
    this.intervalId = null;
    this.isPolling = false;
    this.lastUpdateTime = null;
    this.contentHash = null;
  }

  /**
   * Subscribe to real-time blog updates
   * @param {string} id - Subscriber ID
   * @param {Function} callback - Callback function to call on updates
   * @param {Object} options - Subscription options
   */
  subscribe(id, callback, options = {}) {
    this.subscribers.set(id, {
      callback,
      options: {
        immediate: true,
        ...options
      }
    });

    // Start polling if this is the first subscriber
    if (this.subscribers.size === 1) {
      this.startPolling();
    }

    // Call immediately if requested
    if (options.immediate) {
      this.checkForUpdates(id);
    }

    console.log(`Real-time blog subscriber added: ${id}`);
  }

  /**
   * Unsubscribe from real-time updates
   * @param {string} id - Subscriber ID
   */
  unsubscribe(id) {
    this.subscribers.delete(id);

    // Stop polling if no more subscribers
    if (this.subscribers.size === 0) {
      this.stopPolling();
    }

    console.log(`Real-time blog subscriber removed: ${id}`);
  }

  /**
   * Start polling for updates
   */
  startPolling() {
    if (this.isPolling) return;

    this.isPolling = true;
    this.intervalId = setInterval(() => {
      this.checkForUpdates();
    }, this.updateInterval);

    console.log('Real-time blog polling started');
  }

  /**
   * Stop polling for updates
   */
  stopPolling() {
    if (!this.isPolling) return;

    this.isPolling = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('Real-time blog polling stopped');
  }

  /**
   * Check for content updates
   * @param {string} specificSubscriber - Check for specific subscriber only
   */
  async checkForUpdates(specificSubscriber = null) {
    try {
      // Clear cache to get fresh data
      blogService.clearCachePattern('featuredBlogs');
      
      // Fetch latest content
      const latestContent = await blogService.getFeaturedBlogsForLanding(6);
      
      // Generate content hash
      const newContentHash = this.generateContentHash(latestContent);
      
      // Check if content has changed
      const hasChanged = this.contentHash !== null && this.contentHash !== newContentHash;
      
      if (hasChanged || specificSubscriber) {
        this.contentHash = newContentHash;
        this.lastUpdateTime = new Date();
        
        // Notify subscribers
        const subscribersToNotify = specificSubscriber 
          ? [specificSubscriber]
          : Array.from(this.subscribers.keys());

        for (const subscriberId of subscribersToNotify) {
          const subscriber = this.subscribers.get(subscriberId);
          if (subscriber) {
            try {
              await subscriber.callback({
                type: hasChanged ? 'content-updated' : 'content-loaded',
                data: latestContent,
                timestamp: this.lastUpdateTime,
                hash: this.contentHash
              });
            } catch (error) {
              console.error(`Error notifying subscriber ${subscriberId}:`, error);
            }
          }
        }

        if (hasChanged) {
          console.log('Real-time blog content updated:', {
            subscribersNotified: subscribersToNotify.length,
            timestamp: this.lastUpdateTime,
            hash: this.contentHash
          });
        }
      } else if (this.contentHash === null) {
        // First time loading
        this.contentHash = newContentHash;
        this.lastUpdateTime = new Date();
      }

    } catch (error) {
      console.error('Error checking for blog updates:', error);
      
      // Notify subscribers of error
      for (const [subscriberId, subscriber] of this.subscribers) {
        try {
          await subscriber.callback({
            type: 'error',
            error: error.message,
            timestamp: new Date()
          });
        } catch (callbackError) {
          console.error(`Error notifying subscriber ${subscriberId} of error:`, callbackError);
        }
      }
    }
  }

  /**
   * Generate hash for content to detect changes
   * @param {Array} content - Content array
   * @returns {string} Content hash
   */
  generateContentHash(content) {
    if (!content || !Array.isArray(content)) return '';
    
    const hashData = content.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      views: item.views,
      date: item.date
    }));
    
    return btoa(JSON.stringify(hashData)).substring(0, 16);
  }

  /**
   * Force update check
   */
  async forceUpdate() {
    console.log('Forcing real-time blog update check');
    await this.checkForUpdates();
  }

  /**
   * Update polling interval
   * @param {number} interval - New interval in milliseconds
   */
  setUpdateInterval(interval) {
    this.updateInterval = interval;
    
    if (this.isPolling) {
      this.stopPolling();
      this.startPolling();
    }
    
    console.log(`Real-time blog update interval set to ${interval}ms`);
  }

  /**
   * Get current status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      isPolling: this.isPolling,
      subscriberCount: this.subscribers.size,
      updateInterval: this.updateInterval,
      lastUpdateTime: this.lastUpdateTime,
      contentHash: this.contentHash
    };
  }

  /**
   * Manual content update (for admin use)
   * @param {Array} newContent - New content to push
   */
  async pushContentUpdate(newContent) {
    console.log('Pushing manual content update');
    
    const newContentHash = this.generateContentHash(newContent);
    this.contentHash = newContentHash;
    this.lastUpdateTime = new Date();
    
    // Notify all subscribers
    for (const [subscriberId, subscriber] of this.subscribers) {
      try {
        await subscriber.callback({
          type: 'manual-update',
          data: newContent,
          timestamp: this.lastUpdateTime,
          hash: this.contentHash
        });
      } catch (error) {
        console.error(`Error notifying subscriber ${subscriberId} of manual update:`, error);
      }
    }
  }

  /**
   * Cleanup service
   */
  destroy() {
    this.stopPolling();
    this.subscribers.clear();
    this.contentHash = null;
    this.lastUpdateTime = null;
    console.log('Real-time blog service destroyed');
  }
}

// Export singleton instance
export const realTimeBlogService = new RealTimeBlogService();
export default realTimeBlogService;