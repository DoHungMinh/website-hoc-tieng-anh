module.exports = {
    apps: [
        {
            name: 'engpro-server',
            script: 'dist/server.js',
            cwd: '/home/nguyenlehuy/Development/EngPro/backend',
            env: {
                PORT: 5003,
                NODE_ENV: 'production'
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M'
        }
    ]
};
