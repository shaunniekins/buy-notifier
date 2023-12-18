"use client";
// import Overview from "@/components/Overview";
// import LandingComponent from "@/components/Landing";
// import Redirect from "@/utils/Redirect";

// export default function Home() {
//   return (
//     <Redirect>
//       <LandingComponent />
//     </Redirect>
//   );
// }

import { useEffect } from "react";
import Overview from "@/components/Overview";
import LandingComponent from "@/components/Landing";
import Redirect from "@/utils/Redirect";

export default function Home() {
  useEffect(() => {
    const subscribeUser = async () => {
      // Check if the browser supports the Service Worker and Push APIs
      if ("serviceWorker" in navigator && "PushManager" in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        // Send the subscription object to your server
        const response = await fetch("/api/subscribe", {
          method: "POST",
          body: JSON.stringify(subscription),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to subscribe the user");
        }
      }
    };

    subscribeUser();
  }, []);

  return (
    <Redirect>
      <LandingComponent />
    </Redirect>
  );
}
