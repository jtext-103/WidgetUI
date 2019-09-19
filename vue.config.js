module.exports = {
    outputDir: 'E:/wfy/CFET2DaqDemo/Code/CFET2App/bin/Debug/views',
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