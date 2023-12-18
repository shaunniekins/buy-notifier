"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapComponent from "./Map";
import dynamic from "next/dynamic";
import { isPointWithinRadius } from "geolib";
import { TfiTarget, TfiEye } from "react-icons/tfi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlineFilter, MdOutlineLogout } from "react-icons/md";
import { supabase } from "@/utils/supabase";
import { usePathname, useRouter } from "next/navigation";

import {
  IoPersonCircleOutline,
  IoSearchOutline,
  IoListOutline,
  IoChatboxOutline,
  IoNotificationsOutline,
} from "react-icons/io5";

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
import { fetchConsumerRecords } from "@/data/consumer_profiles_data";
import { fetchPeddlerRecords } from "@/data/peddler_profiles_data";
import {
  checkPeddlerActivity,
  updatePeddlerRecord,
} from "@/data/peddlers_data";
import { IoFilterOutline } from "react-icons/io5";
import { FaRegUserCircle } from "react-icons/fa";
import Image from "next/image";

const DynamicComponent = dynamic(() => import("./Map"), { ssr: false });

const Overview = () => {
  const [position, setPosition] = useState<[number, number]>([122.563, 11.803]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [participantData, setParticipantData] = useState<ParticipantLocation[]>(
    []
  );
  const [otherParticipantDataInfo, setOtherParticipantDataInfo] = useState<
    any[]
  >([]);

  const [isEyeShow, setIsEyeShow] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [currentView, setCurrentView] = useState("search");

  const router = useRouter();
  const pathname = usePathname();

  const userType = pathname.includes("/peddler/")
    ? "peddler"
    : pathname.includes("/consumer/")
    ? "consumer"
    : null;

  // current user id
  const { userName, userId } = useContext(UserContext);

  // check for the peddler's activity and update the peddler's location
  useEffect(() => {
    const checkActivity = async () => {
      try {
        await checkPeddlerActivity();
      } catch (error) {
        console.error("Error checking peddler activity:", error);
      }
    };

    // Run the check immediately on component mount
    checkActivity();

    // Then run the check every 5 minutes
    const intervalId = setInterval(checkActivity, 5 * 60 * 1000);

    // Clean up the interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // update the current user's last active time
  useEffect(() => {
    const heartbeatMinutes = 2; // Change this value to adjust the heartbeat frequency

    if (userType === "peddler") {
      // Send a heartbeat every heartbeatMinutes minutes
      const heartbeatInterval = setInterval(() => {
        // Send a request to the server to indicate that the peddler is still active
        updatePeddlerRecord(userId, new Date());
      }, heartbeatMinutes * 60 * 1000);

      return () => {
        clearInterval(heartbeatInterval);
      };
    }
  }, [userId, userType]);

  // update the current user's position
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

  const radius = 0.4; // in kilometers

  // get the positions of the corresponding users within the defined radius:
  // if current user: peddler -> get consumer positions
  // if current user: consumer -> get peddlers positions
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

  // either peddler or consumer's position
  const points = useMemo(
    () =>
      participantData.map((item) => ({
        ...item,
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
      })),
    [participantData]
  );

  // get the name, and other info of the corresponding users:
  // if current user: peddler -> get consumer info
  // if current user: consumer -> get peddler info
  const memeoizedFetchOtherData = useCallback(async () => {
    try {
      let data;
      if (userType === "peddler") {
        data = await fetchConsumerRecords(
          participantData.map((item) => item.id)
        );
      } else if (userType === "consumer") {
        data = await fetchPeddlerRecords(
          participantData.map((item) => item.id)
        );
      }
      setOtherParticipantDataInfo(data || []);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [participantData, userType]);

  useEffect(() => {
    memeoizedFetchOtherData();
    const interval = setInterval(memeoizedFetchOtherData, 4000);

    return () => clearInterval(interval);
  }, [participantData, memeoizedFetchOtherData]);

  // // check for the change in position
  // useEffect(() => {
  //   const watchId = navigator.geolocation.watchPosition(
  //     (position) => {
  //       setPosition([position.coords.latitude, position.coords.longitude]);
  //     },
  //     (error) => {
  //       console.log(error);
  //     }
  //   );

  //   return () => {
  //     navigator.geolocation.clearWatch(watchId);
  //   };
  // }, []);

  const handleRefresh = () => {
    setRefreshKey((oldKey) => oldKey + 1);
  };

  const notify = () => toast("Wow so easy!");

  const audio = useRef<HTMLAudioElement | undefined>(
    typeof Audio !== "undefined" ? new Audio("/ayaw-kol.mp3") : undefined
  );

  // Call this function when the user interacts with the page
  const enableAudio = () => {
    audio.current?.play();
    audio.current?.pause();
    audio.current!.currentTime = 0;
  };

  // Call this function to play the audio
  const playAudio = () => {
    audio.current?.play();
  };

  // The notifyPrompt is using the Notifications API to show a notification directly from the page, rather than from a Service Worker. This will only work while the page is active.
  const notifyPrompt = async (id: string) => {
    // Check if the browser supports the Notifications API
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    // Check the notifications table to see if there's a record for this consumer and peddler in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneHourAgoISOString = oneHourAgo.toISOString();

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("consumer_id", userId)
      .eq("peddler_id", id)
      .gte("notified_at", oneHourAgoISOString);

    if (error) {
      console.error("An error occurred:", error);
      return;
    }

    if (notifications && notifications.length > 0) {
      // If there's a record in the last hour, don't send the notification
      return;
    }

    // Otherwise, send the notification
    if (Notification.permission === "granted") {
      new Notification(
        `${id} is in the area, you might be interested in their goods.`
      );
      playAudio();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          new Notification(
            `${id} is in the area, you might be interested in their goods.`
          );
          playAudio();
        }
      });
    }

    // Insert a new record into the notifications table with the current time
    const { error: insertError } = await supabase
      .from("notifications")
      .insert([{ consumer_id: userId, peddler_id: id }]);

    if (insertError) {
      console.error("An error occurred:", insertError);
    }
  };

  // notification to the user consumer if there are any peddlers in the area
  useEffect(() => {
    // Check if userType is "consumer" and if there are any values in participantData
    if (userType === "consumer" && participantData.length > 0) {
      // For each item in participantData, show a notification
      participantData.forEach((item: any) => {
        notifyPrompt(item.id);
      });
    }
  }, [userType, participantData]);

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
      {currentView === "search" && (
        <div className=" z-0">
          <DynamicComponent
            key={refreshKey}
            position={position}
            points={points}
            otherParticipantDataInfo={otherParticipantDataInfo}
            userType={userType}
            isEyeShow={isEyeShow}
          />
        </div>
      )}
      <div className="w-full absolute top-0 flex flex-col gap-1 p-2">
        <div className="bg-[#171A20] rounded-full justify-between items-center gap-2 flex p-2">
          <div className="text-white text-[35px]">
            <FaRegUserCircle />
          </div>
          <button
            className="text-white"
            onClick={() => {
              setShowFilter(!showFilter);
            }}>
            Search {userType === "peddler" ? "Customer" : "Peddler"}
          </button>
          <Image
            src={"/notifbuy-logo.png"}
            alt="Notifbuy Logo"
            width={35}
            height={35}
          />
        </div>
        {showFilter && (
          <div className="bg-neutral-900 rounded-lg justify-between items-center gap-2 flex p-2 mx-5">
            <h3 className="text-white">Search by category</h3>
          </div>
        )}
      </div>
      {/* <div className="absolute bottom-0 right-0 m-4 flex flex-col gap-3">
        {userType === "consumer" && (
          <button
            onClick={() => {
              setIsEyeShow(!isEyeShow);
            }}
            className={`text-white z-50 rounded-full p-2 text-3xl ${
              !isEyeShow ? "bg-[#E0E7FF]" : "bg-[#8667F2]"
            }`}>
            <TfiEye />
          </button>
        )}
        <button
          onClick={() => {
            handleRefresh();
            // notify();
            // notifyPrompt();
          }}
          className=" bg-purple-500 text-white z-50 rounded-full p-2 text-3xl">
          <TfiTarget />
        </button>
        <button
          onClick={() => {
            supabase.auth.signOut();
            localStorage.removeItem("name");
            localStorage.removeItem("userId");
            router.push("/");
          }}
          className="bg-purple-500 text-white z-50 rounded-full p-2 text-3xl">
          <MdOutlineLogout />
        </button>
      </div> */}
      <div className="w-full absolute bottom-0 flex flex-col">
        <div className="bg-[#171A20] justify-around items-center gap-2 flex p-2">
          <button
            className={`flex flex-col items-center justify-center text-[30px] ${
              currentView === "profile" ? "text-[#8667F2]" : "text-white"
            }`}
            onClick={() => {
              setCurrentView("profile");
            }}>
            <IoPersonCircleOutline />
            <p className="text-sm">Profile</p>
          </button>
          <button
            className={`flex flex-col items-center justify-center text-[30px] ${
              currentView === "orders" ? "text-[#8667F2]" : "text-white"
            }`}
            onClick={() => {
              setCurrentView("orders");
            }}>
            <IoListOutline />
            <p className="text-sm">Orders</p>
          </button>
          <button
            className={`flex flex-col items-center justify-center text-[30px] ${
              currentView === "search" ? "text-[#8667F2]" : "text-white"
            }`}
            onClick={() => {
              setCurrentView("search");
            }}>
            <IoSearchOutline />
            <p className="text-sm">Search</p>
          </button>
          <button
            className={`flex flex-col items-center justify-center text-[30px] ${
              currentView === "message" ? "text-[#8667F2]" : "text-white"
            }`}
            onClick={() => {
              setCurrentView("message");
            }}>
            <IoChatboxOutline />
            <p className="text-sm">Message</p>
          </button>
          <button
            className={`flex flex-col items-center justify-center text-[30px] ${
              currentView === "alerts" ? "text-[#8667F2]" : "text-white"
            }`}
            onClick={() => {
              setCurrentView("alerts");
            }}>
            <IoNotificationsOutline />
            <p className="text-sm">Alerts</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;
