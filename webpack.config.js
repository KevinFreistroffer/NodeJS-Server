const path = require("path");
const webpack = require("webpack");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  entry: "./src/server.ts", // The entry point of your application
  target: "node", // Target Node.js environment
  mode: "production", // Production mode for optimization
  module: {
    rules: [
      {
        test: /\.ts$/, // Apply ts-loader to TypeScript files
        use: "ts-loader",
        exclude: /node_modules/, // Exclude node_modules from being transpiled
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"], // Resolve these extensions
    alias: {
      '@': path.resolve(__dirname, 'src'), // Add alias for '@' to point to 'src' directory
    },
  },
  output: {
    filename: "bundle.js", // The output bundled file
    path: path.resolve(__dirname, "dist"), // Output directory
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.API_URL": JSON.stringify(process.env.API_URL),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.SERVER_PORT": JSON.stringify(process.env.SERVER_PORT),
    }),
  ],
};
