"use client";
import { useCallback, useEffect, useState } from "react";
import MapComponent from "./Map";
import dynamic from "next/dynamic";
import { isPointWithinRadius } from "geolib";
import { TfiTarget } from "react-icons/tfi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlineLogout } from "react-icons/md";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

import { fetchConsumerRecord } from "@/data/consumer_active_locations_data";
import { Consumer } from "@/types/interfaces";

const DynamicComponent = dynamic(() => import("./Map"), { ssr: false });

const Overview = () => {
  //   const position: [number, number] = [8.2165, 126.0458];
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [consumerData, setConsumerData] = useState<Consumer[]>([]);

  const router = useRouter();

  //butuan
  // const defaultPosition: [number, number] = [8.951549, 125.527725];

  //bayugan
  const defaultPosition: [number, number] = [8.720861, 125.754318];

  const points = [
    { latitude: 8.721, longitude: 125.754 },
    { latitude: 8.850861, longitude: 125.754318 },
    { latitude: 8.620861, longitude: 125.754318 },
    { latitude: 8.720861, longitude: 125.554318 },
    { latitude: 8.720861, longitude: 125.954318 },
    { latitude: 8.800861, longitude: 125.800318 },
    { latitude: 8.711849785042917, longitude: 125.76167557550343 },
    { latitude: 8.71240068513227, longitude: 125.7523563190912 },
  ];

  const memoizedFetchConsumerData = useCallback(async () => {
    try {
      const response = await fetchConsumerRecord();
      if (response?.error) {
        console.error(response.error);
      } else {
        setConsumerData(response?.data || []);
        console.log(response?.data || []);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, []);

  useEffect(() => {
    memoizedFetchConsumerData();
    const interval = setInterval(memoizedFetchConsumerData, 4000);

    return () => clearInterval(interval);
  }, [memoizedFetchConsumerData]);

  const radius = 400; // in meters

  // this one should be pass to the component as props instead of points directly

  useEffect(() => {
    const pointsWithinRadius = points.filter((point) =>
      isPointWithinRadius(point, position ? position : defaultPosition, radius)
    );

    // console.log(pointsWithinRadius);
  }, [position]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setPosition([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.log(error);
      }
    );

    // Clean up function to stop watching the position when the component unmounts
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const handleRefresh = () => {
    // New handler function
    setRefreshKey((oldKey) => oldKey + 1);
  };

  const notify = () => toast("Wow so easy!");

  const notifyPrompt = () => {
    // Check if the browser supports the Notifications API
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      // If permission is already granted, show the notification
      new Notification("Wow so easy!");
      new Audio("/ayaw-kol.mp3").play();
    } else if (Notification.permission !== "denied") {
      // Otherwise, ask the user for permission
      Notification.requestPermission().then(function (permission) {
        // If the user accepts, show the notification
        if (permission === "granted") {
          new Notification("Wow so easy!");
          new Audio("/notifbuy-sound.mp3").play();
        }
      });
    }
  };

  return (
    <div className="w-screen h-[100svh] flex flex-col relative">
      {/* <div className="mx-2 px-2">
        <ToastContainer
          position="top-center"
          autoClose={7000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div> */}
      <div className=" z-0">
        {position ? (
          <DynamicComponent
            key={refreshKey}
            position={position}
            points={points}
          />
        ) : (
          <DynamicComponent
            key={refreshKey}
            position={defaultPosition}
            points={points}
          />
        )}
      </div>
      <button
        onClick={() => {
          handleRefresh();
          notify();
          notifyPrompt();
        }}
        className="absolute bottom-0 right-0 m-4 bg-purple-500 text-white z-50 rounded-full p-2 text-lg">
        <TfiTarget />
      </button>

      <button
        onClick={() => {
          supabase.auth.signOut();
          localStorage.removeItem("name");
          localStorage.removeItem("userId");
          router.push("/");
        }}
        className="absolute top-0 right-0 m-4 bg-purple-500 text-white z-50 rounded-full p-2 text-lg">
        <MdOutlineLogout />
      </button>
    </div>
  );
};

export default Overview;

// onClick={() => {
//   supabase.auth.signOut();
//   localStorage.removeItem("name");
//   localStorage.removeItem("userId");
//   router.push("/");
// }}
