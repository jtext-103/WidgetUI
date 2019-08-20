module.exports = {
    devServer: {
      proxy: {
        "/basepath": {
          target: "http://localhost:8002/dataserver",
          secure: false,
          changeOrigin: true
        }
      }
    }
  };