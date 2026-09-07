import { useState, useEffect, useCallback } from "react";

export type DeviceType = "mobile" | "tablet" | "laptop" | "desktop" | "ultrawide";
export type OrientationType = "portrait" | "landscape";

export interface DeviceInfo {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isDesktop: boolean;
  isSmallScreen: boolean; // mobile or tablet (< 1024px)
  isTouch: boolean;
  orientation: OrientationType;
  width: number;
  height: number;
  pixelRatio: number;
  sidebarWidth: number; // 0 for mobile overlay, 80 for collapsed, 280 for expanded
}

export function getDeviceInfo(overrideWidth?: number): DeviceInfo {
  if (typeof window === "undefined") {
    return {
      deviceType: "desktop",
      isMobile: false,
      isTablet: false,
      isLaptop: false,
      isDesktop: true,
      isSmallScreen: false,
      isTouch: false,
      orientation: "landscape",
      width: 1440,
      height: 900,
      pixelRatio: 1,
      sidebarWidth: 280
    };
  }

  const width = overrideWidth ?? window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = window.devicePixelRatio || 1;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const orientation: OrientationType = width < height ? "portrait" : "landscape";

  let deviceType: DeviceType = "desktop";
  if (width < 640) {
    deviceType = "mobile";
  } else if (width < 1024) {
    deviceType = "tablet";
  } else if (width < 1440) {
    deviceType = "laptop";
  } else if (width < 1920) {
    deviceType = "desktop";
  } else {
    deviceType = "ultrawide";
  }

  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const isLaptop = deviceType === "laptop";
  const isDesktop = deviceType === "desktop" || deviceType === "ultrawide";
  const isSmallScreen = width < 1024;

  let sidebarWidth = 280;
  if (isMobile || isTablet) {
    sidebarWidth = 0; // Drawer on small screens
  } else if (isLaptop) {
    sidebarWidth = 240;
  } else {
    sidebarWidth = 280;
  }

  return {
    deviceType,
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    isSmallScreen,
    isTouch,
    orientation,
    width,
    height,
    pixelRatio,
    sidebarWidth
  };
}

export function useDevice() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => getDeviceInfo());

  const handleResize = useCallback(() => {
    setDeviceInfo(getDeviceInfo());
  }, []);

  useEffect(() => {
    // Initial sync
    handleResize();

    // Listen to resize and orientation changes
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [handleResize]);

  return deviceInfo;
}
