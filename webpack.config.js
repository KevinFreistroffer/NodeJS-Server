const path = require("path");

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
  },
  output: {
    filename: "bundle.js", // The output bundled file
    path: path.resolve(__dirname, "dist"), // Output directory
  },
};
