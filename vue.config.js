module.exports = {
    devServer: {
      proxy: {
        "/": {
          target: "http://localhost:8001",
          secure: false,
          changeOrigin: true
        }
      }
    }
  };