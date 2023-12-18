"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "./supabase";
import { MutatingDots } from "react-loader-spinner";
import { Consumer, Peddler } from "@/types/interfaces";

type User = any;

const Redirect = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error && error.status === 401) {
          // console.error("User is not authenticated.");
        } else if (error) {
          // console.error("Error fetching user:", error.message);
        } else if (
          (data &&
            (pathname === "/peddler/signin" ||
              pathname === "/consumer/signin")) ||
          pathname === "/"
        ) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pathname]);

  useEffect(() => {
    if (user) {
      const checkUser = async () => {
        const { data: peddlerData } = await supabase
          .from("peddler_profiles")
          .select("id")
          .eq("id", user.id);

        if (peddlerData && peddlerData.length > 0) {
          router.push("/peddler/view");
          return;
        }

        const { data: consumerData } = await supabase
          .from("consumer_profiles")
          .select("id")
          .eq("id", user.id);

        if (consumerData && consumerData.length > 0) {
          router.push("/consumer/view");
          return;
        }
      };

      checkUser();
    }
  }, [user, pathname]);

  if (isLoading) {
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
    return <>{children}</>;
  }
};

export default Redirect;
