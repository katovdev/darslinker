/**
 * PM2 Ecosystem Configuration for Darslinker Blog Backend
 *
 * This configuration file defines how PM2 should manage the backend application.
 * It includes settings for clustering, auto-restart, logging, and monitoring.
 *
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 start ecosystem.config.js --env development
 */

module.exports = {
  apps: [
    {
      // Application Name
      name: 'darslinker-backend',

      // Entry point
      script: './dist/main.js',

      // Instances
      instances: 2, // Use 2 instances for load balancing
      exec_mode: 'cluster', // Cluster mode for multi-core utilization

      // Watch & Restart
      watch: false, // Disable watch in production
      ignore_watch: ['node_modules', 'logs', 'dist'], // Folders to ignore if watch is enabled

      // Auto-restart configuration
      autorestart: true,
      max_restarts: 10, // Maximum restarts in min_uptime period
      min_uptime: '10s', // Minimum uptime before considering app as stable
      max_memory_restart: '500M', // Restart if memory exceeds 500MB

      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true, // Merge logs from all instances

      // Environment Variables - Production
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
        // Add other production variables here or use .env file
      },

      // Environment Variables - Development
      env_development: {
        NODE_ENV: 'development',
        PORT: 5001,
        // Add other development variables here
      },

      // Advanced Options
      listen_timeout: 10000, // Time to wait for app to listen (ms)
      kill_timeout: 5000, // Time to wait before force killing (ms)
      wait_ready: false, // Wait for process.send('ready')

      // Exponential backoff restart delay
      exp_backoff_restart_delay: 100,

      // Source map support
      source_map_support: true,

      // Monitoring
      instance_var: 'INSTANCE_ID',

      // Graceful shutdown
      shutdown_with_message: true,
    },
  ],

  /**
   * Deployment Configuration for PM2 Deploy
   * This allows automated deployment using pm2 deploy commands
   */
  deploy: {
    // Production environment
    production: {
      user: 'ubuntu', // Change to your EC2 username
      host: ['your-ec2-instance-ip'], // Your EC2 instance IP
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/blog.git', // Your git repository
      path: '/home/ubuntu/apps/darslinker-backend',
      'post-deploy':
        'cd backend && npm ci && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      ssh_options: 'StrictHostKeyChecking=no',
    },

    // Staging environment
    staging: {
      user: 'ubuntu',
      host: ['your-staging-server-ip'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-repo/blog.git',
      path: '/home/ubuntu/apps/darslinker-backend-staging',
      'post-deploy':
        'cd backend && npm ci && npm run build && pm2 reload ecosystem.config.js --env development',
      ssh_options: 'StrictHostKeyChecking=no',
    },
  },
};
