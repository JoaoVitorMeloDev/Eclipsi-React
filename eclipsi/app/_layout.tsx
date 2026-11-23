import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "web") {
      document.documentElement.style.height = "100%";
      document.documentElement.style.overflow = "auto";
      document.body.style.height = "100%";
      document.body.style.minHeight = "100%";
      document.body.style.overflow = "auto";
      const root = document.getElementById("root");
      if (root) {
        root.style.minHeight = "100%";
        root.style.height = "100%";
      }
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      }
      if (!document.querySelector('link[rel="manifest"]')) {
        const manifest = document.createElement("link");
        manifest.rel = "manifest";
        manifest.href = "/manifest.json";
        document.head.appendChild(manifest);
      }
      let theme = document.querySelector('meta[name="theme-color"]');
      if (!theme) {
        theme = document.createElement("meta");
        theme.setAttribute("name", "theme-color");
        document.head.appendChild(theme);
      }
      theme.setAttribute("content", "#322c8e");
    }
  }, []);
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
