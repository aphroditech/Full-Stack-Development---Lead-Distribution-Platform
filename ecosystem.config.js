// PM2 process configuration for the Lead Distribution Platform.
// Secrets (DATABASE_URL, JWT_SECRET, admin credentials) live in backend/.env
// and are NOT defined here. Only non-secret runtime config is set below.
module.exports = {
  apps: [
    {
      name: "ld-backend",
      cwd: "./backend",
      script: "dist/server.js",
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: "production",
        // PORT/HOST/DATABASE_URL/JWT_SECRET are read from backend/.env
      },
    },
    {
      name: "ld-frontend",
      cwd: "./frontend",
      script: "server.js",
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: "production",
        PORT: "8169",
        BACKEND_URL: "http://127.0.0.1:8170",
      },
    },
  ],
};
