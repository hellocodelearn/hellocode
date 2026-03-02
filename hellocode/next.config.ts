// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   async redirects() {
//     return [
//       {
//         source: "/favicon.ico",
//         destination: "/robot-mascot.svg",
//         permanent: true,
//       },
//     ];
//   },
// };

// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. 开启静态导出模式，这是打包成 App 的前提
  output: 'export', 
  
  // 2. 禁用图片优化，因为静态导出不支持 Next.js 的图片服务器
  images: {
    unoptimized: true,
  },

  // 3. 注意：Capacitor 不支持 redirects 属性
  // 如果你确实需要将 favicon 指向 robot-mascot.svg，
  // 建议直接在 layout.tsx 的 <link rel="icon" ...> 中修改路径，
  // 而不是在这里使用重定向。
};

export default nextConfig;