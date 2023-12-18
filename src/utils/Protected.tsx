"use client";

import React, { useState, useEffect } from "react";
import { supabase, supabaseAdmin } from "../utils/supabase";
import { useRouter } from "next/navigation";
import { MutatingDots } from "react-loader-spinner";

import { UserContext } from "./UserContext";

type User = any;

const Protected = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error && error.status === 401) {
          router.push("/");
        } else if (error) {
          console.error("Error fetching user:", error.message);
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    if (user) {
      const checkUser = async () => {
        const { data: peddlerData } = await supabaseAdmin
          .from("peddler_profiles")
          .select("id, first_name, last_name")
          .eq("id", user.id);

        if (peddlerData && peddlerData.length > 0) {
          const name = `${peddlerData[0].first_name} ${peddlerData[0].last_name}`;
          setUserName(name);
          setUserId(user.id);
          router.push("/peddler/view");
          return;
        }

        const { data: consumerData } = await supabase
          .from("consumer_profiles")
          .select("id, first_name, last_name")
          .eq("id", user.id);

        if (consumerData && consumerData.length > 0) {
          const name = `${consumerData[0].first_name} ${consumerData[0].last_name}`;
          setUserName(name);
          setUserId(user.id);
          router.push("/consumer/view");
          return;
        }
      };

      checkUser();
    }
  }, [user, router]);

  if (isLoading) {
    // You can show a loading spinner or message while checking authentication.
    return (
      <div className="z-50 flex w-screen h-[100svh] justify-center items-center bg-opacity-50 bg-black inset-0 fixed overflow-hidden">
        <MutatingDots
          height="100"
          width="100"
          color="#8667F2"
          secondaryColor="#E0E7FF"
          radius="12.5"
          ariaLabel="mutating-dots-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <UserContext.Provider
      value={{
        userName,
        userId,
        setUserName,
        setUserId,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export default Protected;
