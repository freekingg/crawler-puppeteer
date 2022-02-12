module.exports = {
  apps: [
    {
      name: 'spiderServer',
      script: './index.js',
      env: {
        NODE_ENV: 'production'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
