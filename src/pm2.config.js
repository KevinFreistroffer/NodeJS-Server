module.exports = {
  apps: [
    {
      name: "server",
      script: "./src/server.ts",
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
