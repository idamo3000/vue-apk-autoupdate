module.exports = {
  // publicPath:'/m/',
  assetsDir: "static",
  publicPath: "./",
  outputDir: "../vue-apk-autoupdate-h5plus/dist",

  // ylcf-vue-h5plus
  // 配置 axios 代理请求
  devServer: {
    proxy: {
      "/api": {
        // target: 'http://www.tp5token.com/index.php',
        // target:"http://api.guojintz.show.demopai.com/index.php",
        // target:"http://m.guojintz.com/index.php",
        // target:"http://tp51.show.demopai.com/index.php", // remote dev
        // target:"http://d51.guojintz.com/index.php", // local dev
        target: "http://ipbgoe1.prod.demopai.com/index.php", // Online // 在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题

        changeOrigin: true,
        ws: true,
        pathRewrite: {
          // 替换target中的请求地址，也就是说以后你在请求http://api.jisuapi.com/XXXXX这个地址的时候直接写成/api即可
          "^/api": "/api"
        }
      }
    }
  }
};
