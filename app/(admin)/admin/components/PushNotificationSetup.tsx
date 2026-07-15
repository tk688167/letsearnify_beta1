"use client";

import { useState, useEffect } from "react";
import { BellIcon, BellSlashIcon } from "@heroicons/react/24/outline";

export function PushNotificationSetup() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const registerServiceWorker = async () => {
    try {
      await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("✅ Service Worker registered");
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
      throw error;
    }
  };

  const subscribeToPush = async () => {
    try {
      setIsLoading(true);

      if (Notification.permission === "default") {
        const permissionResult = await Notification.requestPermission();
        if (permissionResult !== "granted") {
          alert("You need to allow notifications to receive alerts.");
          setIsLoading(false);
          return;
        }
      }

      if (Notification.permission !== "granted") {
        alert("You need to allow notifications to receive alerts.");
        setIsLoading(false);
        return;
      }

      await registerServiceWorker();
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: PUBLIC_VAPID_KEY,
      });

      const response = await fetch("/api/push/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscription }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        console.log("✅ Push notification enabled");
      } else {
        const error = await response.json();
        alert("Failed to enable notifications: " + (error.error || "Unknown error"));
      }
    } catch (error: any) {
      console.error("❌ Subscription error:", error);
      alert("Failed to enable notifications: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      setIsLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await fetch("/api/push/register", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        setIsSubscribed(false);
        console.log("✅ Push notification disabled");
      }
    } catch (error) {
      console.error("❌ Unsubscription error:", error);
      alert("Failed to disable notifications: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-xs text-slate-400 dark:text-slate-500">
        🔔 Push notifications not supported
      </div>
    );
  }

  return (
    <button
      onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
      disabled={isLoading}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
        ${isSubscribed 
          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20' 
          : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {isSubscribed ? (
        <>
          <BellIcon className="w-4 h-4" />
          <span>Notifications On</span>
        </>
      ) : (
        <>
          <BellSlashIcon className="w-4 h-4" />
          <span>Enable Notifications</span>
        </>
      )}
    </button>
  );
}