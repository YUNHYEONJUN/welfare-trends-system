/**
 * PM2 Ecosystem 설정 파일
 * 
 * 사용법:
 * pm2 start ecosystem.config.js
 * pm2 stop ecosystem.config.js
 * pm2 restart ecosystem.config.js
 * pm2 logs
 */

module.exports = {
  apps: [
    {
      // Next.js 애플리케이션
      name: 'welfare-trends',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1, // 또는 'max'로 설정하여 모든 CPU 코어 사용
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false
    },
    
    {
      // 크롤링 스케줄러
      name: 'crawler',
      script: 'lib/scripts/crawl-scheduler.ts',
      interpreter: 'node',
      interpreter_args: '--loader tsx',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 3 * * *', // 매일 오전 3시에 재시작
      autorestart: false,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/crawler-error.log',
      out_file: './logs/crawler-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    
    {
      // AI 큐레이션
      name: 'curator',
      script: 'lib/scripts/run-curation.ts',
      interpreter: 'node',
      interpreter_args: '--loader tsx',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 4 * * *', // 매일 오전 4시에 재시작
      autorestart: false,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/curator-error.log',
      out_file: './logs/curator-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
