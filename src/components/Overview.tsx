"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import MapComponent from "./Map";
import dynamic from "next/dynamic";
import { isPointWithinRadius } from "geolib";
import { TfiTarget } from "react-icons/tfi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlineLogout } from "react-icons/md";
import { supabase } from "@/utils/supabase";
import { usePathname, useRouter } from "next/navigation";

import {
  fetchConsumerLocationRecord,
  updateConsumerLocationRecord,
} from "@/data/consumer_active_locations_data";
import {
  fetchPeddlerLocationRecord,
  updatePeddlerLocationRecord,
} from "@/data/peddler_active_locations_data";
import { ParticipantLocation } from "@/types/interfaces";
import { useContext } from "react";
import { UserContext } from "@/utils/UserContext";

const DynamicComponent = dynamic(() => import("./Map"), { ssr: false });

const Overview = () => {
  const [position, setPosition] = useState<[number, number]>([122.563, 11.803]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [participantData, setParticipantData] = useState<ParticipantLocation[]>(
    []
  );

  const router = useRouter();
  const pathname = usePathname();

  const userType = pathname.includes("/peddler/")
    ? "peddler"
    : pathname.includes("/consumer/")
    ? "consumer"
    : null;

  const { userName, userId } = useContext(UserContext);
  // console.log("userId", userId);

  //philippines
  // const defaultPosition: [number, number] = [122.563, 11.803];

  // //bayugan
  // const defaultPosition: [number, number] = [8.720861, 125.754318];

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (userType === "peddler") {
  //       updatePeddlerLocationRecord(userId, position[0], position[1]);
  //     } else if (userType === "consumer") {
  //       updateConsumerLocationRecord(userId, position[0], position[1]);
  //     }
  //   }, 4000);

  //   return () => clearInterval(interval);
  // }, [userId, position, userType]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (userType === "peddler") {
        updatePeddlerLocationRecord(userId, position[0], position[1]);
      } else if (userType === "consumer") {
        updateConsumerLocationRecord(userId, position[0], position[1]);
      }
    }, 4000);

    return () => clearTimeout(timeout);
  }, [position]);

  const radius = 1; // in kilometers

  // get the positions of peddlers (currentUser: consumer) /consumers (currentUser: peddler) within the radius
  const memoizedFetchLocationData = useCallback(async () => {
    try {
      let data;
      if (userType === "peddler") {
        data = await fetchConsumerLocationRecord(
          radius,
          position[0],
          position[1]
        );
      } else if (userType === "consumer") {
        data = await fetchPeddlerLocationRecord(
          radius,
          position[0],
          position[1]
        );
      }
      setParticipantData(data || []);
      // console.log(data || []);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [radius, position, userType]);

  useEffect(() => {
    memoizedFetchLocationData();
    const interval = setInterval(memoizedFetchLocationData, 4000);

    return () => clearInterval(interval);
  }, [position, memoizedFetchLocationData]);

  const points = useMemo(
    () =>
      participantData.map((item) => ({
        ...item,
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
      })),
    [participantData]
  );

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setPosition([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const handleRefresh = () => {
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
        <DynamicComponent
          key={refreshKey}
          position={position}
          points={points}
        />
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
