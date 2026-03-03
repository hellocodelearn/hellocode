"use client";

import { Device } from "@capacitor/device";
import {
  NativePurchases,
  PURCHASE_TYPE,
} from "@capgo/native-purchases";

export const APPLE_SUBSCRIPTION_ID = "com.zigzag.learn.hellocode.vip1";

function isIOSUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iP(hone|ad|od)/i.test(navigator.userAgent);
}

/** 触发苹果内购订阅（通过 @capgo/native-purchases） */
export async function subscribeSuper(): Promise<boolean> {
  try {
    const info = await Device.getInfo().catch(() => null);
    const isIOS =
      info?.platform === "ios" || info?.operatingSystem === "ios" || isIOSUserAgent();
    if (!isIOS) return false;

    // 可选：检查计费是否可用（如果方法在当前平台未实现，则忽略错误，直接尝试购买）
    try {
      const support = await NativePurchases.isBillingSupported();
      if (support && support.isBillingSupported === false) {
        console.warn("[subscription] billing not supported");
        return false;
      }
    } catch (e: any) {
      // 有些版本在 iOS 上可能未实现 isBillingSupported → 返回 UNIMPLEMENTED
      console.warn("[subscription] isBillingSupported failed, continue anyway", e);
    }

    const tx = await NativePurchases.purchaseProduct({
      productIdentifier: APPLE_SUBSCRIPTION_ID,
      // iOS 不需要 planIdentifier，Android 订阅才需要
      productType: PURCHASE_TYPE.SUBS,
      quantity: 1,
    });

    // 只要没有抛错，一般就是用户完成了购买或至少发起了交易
    return Boolean(tx);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[subscription] subscribeSuper failed", err);
    return false;
  }
}

/** 恢复购买：通过 @capgo/native-purchases 触发 restorePurchases */
export async function restoreSuper(): Promise<boolean> {
  try {
    const info = await Device.getInfo().catch(() => null);
    const isIOS =
      info?.platform === "ios" || info?.operatingSystem === "ios" || isIOSUserAgent();
    if (!isIOS) return false;

    await NativePurchases.restorePurchases();
    // 具体有哪些有效订阅，由原生插件 + 你的服务器或后续逻辑决定。
    // 这里前端只要能调用成功，就认为恢复流程已执行，让你自己在后端校验。
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[subscription] restoreSuper failed", err);
    return false;
  }
}

/** 是否为 iOS 设备（用于决定是否展示“恢复购买”按钮） */
export function isIOSPlatform(): boolean {
  return isIOSUserAgent();
}

