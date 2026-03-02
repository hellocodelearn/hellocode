import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zigzag.learn.hellocode',
  appName: 'hellocode',
  // Next.js 静态导出（output: 'export'）的输出目录是 out，不是 public
  webDir: 'out',
};

export default config;
