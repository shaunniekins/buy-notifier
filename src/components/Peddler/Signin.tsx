"use client";

import { supabase, supabaseAdmin } from "@/utils/supabase";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  createPeddlerUser,
  insertPeddlerRecord,
} from "@/data/peddler_profiles_data";
import { insertConsumerRecord } from "@/data/consumer_profiles_data";
import { ToastContainer, toast } from "react-toastify";
import { MutatingDots } from "react-loader-spinner";

const PeddlerSigninComponent = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [emailVal, setEmailVal] = useState("");
  //   const [usernameVal, setUsernameVal] = useState("");
  const [passVal, setPassVal] = useState("");
  const [confirmPassVal, setConfirmPassVal] = useState("");

  // exclusive for consumer
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // exclusive for peddler
  const [name, setName] = useState("");

  const [indicatorMsg, setIndicatorMsg] = useState("");
  const [indicatorStatus, setIndicatorStatus] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleTimeout = () => {
    setTimeout(() => {
      setIndicatorMsg("");
      setIndicatorStatus(true);
    }, 5000);
  };

  const router = useRouter();
  const pathname = usePathname();

  const userType = pathname.includes("/peddler/")
    ? "peddler"
    : pathname.includes("/consumer/")
    ? "consumer"
    : null;

  const handleSignInChange = () => {
    setIsSignIn(!isSignIn);
    setEmailVal("");
    setPassVal("");
    setConfirmPassVal("");
    setFirstName("");
    setLastName("");
    setName("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSignIn) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailVal,
          password: passVal,
        });

        if (error) {
          setIndicatorMsg(`Login failed: ${error.message}`);
          setIndicatorStatus(false);
          handleTimeout();
        } else {
          // console.log("id", data?.user.id);
          // setEmailVal("");
          // setPassVal("");
          // router.push("/home");

          if (userType === "peddler") {
            const user = data?.user;
            const { data: userData, error: fetchError } = await supabase
              .from("peddler_profiles")
              .select("id")
              .eq("id", user?.id);

            if (fetchError || userData.length === 0) {
              // console.error("Failed to fetch user data:", fetchError);
              setIndicatorMsg("You are not a peddler!");
              setIndicatorStatus(false);
              handleTimeout();
              await supabase.auth.signOut();
              return;
            }
            setLoading(true);
            router.push("/peddler/view");
          } else if (userType === "consumer") {
            const user = data?.user;
            const { data: userData, error: fetchError } = await supabase
              .from("consumer_profiles")
              .select("id")
              .eq("id", user?.id);

            if (fetchError || userData.length === 0) {
              // console.error("Failed to fetch user data:", fetchError);
              setIndicatorMsg("You are not a consumer!");
              setIndicatorStatus(false);
              handleTimeout();
              await supabase.auth.signOut();
              return;
            }
            // console.log("userData: ", userData);
            setLoading(true);
            router.push("/consumer/view/");
          }
        }
      } catch (error) {
        setIndicatorMsg("An unexpected error occurred.");
        setIndicatorStatus(false);
      }
    } else {
      if (passVal === confirmPassVal) {
        try {
          //change supabaseAdmin to supabase in prod (supabase.auth.signUp)
          let { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: emailVal,
            password: passVal,
            email_confirm: true,
          });

          if (error) {
            setIndicatorMsg("An error occurred while creating the account.");
            setIndicatorStatus(false);
            handleTimeout();
          } else {
            setIndicatorMsg(
              "Account created successfully. Check email for confirmation."
            );
            if (userType === "peddler") {
              if (data.user?.id) {
                const newPeddlerData = {
                  id: data.user.id,
                  last_name: lastName,
                  first_name: firstName,
                  email: emailVal,
                  password: passVal,
                };

                await insertPeddlerRecord(newPeddlerData);
              }

              setIndicatorStatus(true);
              handleTimeout();
              setEmailVal("");
              setName("");
              setPassVal("");
              setConfirmPassVal("");
              setIsSignIn(true);
            } else if (userType === "consumer") {
              if (data.user?.id) {
                const newConsumerData = {
                  id: data.user.id,
                  last_name: lastName,
                  first_name: firstName,
                  email: emailVal,
                  password: passVal,
                };

                await insertConsumerRecord(newConsumerData);
              }

              setIndicatorStatus(true);
              handleTimeout();
              setEmailVal("");
              setFirstName("");
              setLastName("");
              setPassVal("");
              setConfirmPassVal("");
              setIsSignIn(true);
            }
          }
        } catch (error) {
          setIndicatorMsg("An error occurred while creating the account.");
          setIndicatorStatus(false);
          handleTimeout();
        }
      } else {
        setIndicatorMsg("Passwords do not match.");
        setIndicatorStatus(false);
        handleTimeout();
      }
    }
  };

  const notify = () => toast("Wow so easy!");

  return (
    <>
      {loading && (
        <div
          className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black overflow-y-auto`}>
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
      )}
      <div className="container mx-auto sm:w-[30rem] w-screen h-[100svh] flex flex-col items-center font-Roboto justify-around font-Montserrat cursive relative">
        <p
          className={`h-[1px] absolute top-5 right-5 text-center text-xs font-semibold ${
            indicatorStatus ? "text-green-600" : "text-red-600"
          }`}>
          {indicatorMsg ? indicatorMsg : ""}
        </p>
        <div className="mx-2 px-2">
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
        </div>
        <div className="flex flex-col items-center absolute top-[30%]">
          {/* <Image src="/huna1.png" alt="Usap Logo" width={200} height={200} /> */}
          <button onClick={() => router.push("/")}>
            <h3 className="text-3xl font-semibold text-purple-500">NotifBuy</h3>
            <h4 className="text-sm font-normal text-black">
              {userType === "peddler" ? "Peddler" : "Consumer"}
            </h4>
          </button>
        </div>

        <div className="w-full flex flex-col space-y-8 absolute bottom-10 px-5">
          <form
            className="w-full flex flex-col space-y-5 items-center"
            onSubmit={handleSubmit}>
            <div className="w-full flex flex-col space-y-3 items-center">
              <input
                type="email"
                name="email"
                id="email"
                value={emailVal}
                onChange={(e) => setEmailVal(e.target.value)}
                required
                placeholder="Email Address"
                className="w-full flex py-3 px-[25px] border border-purple-300 rounded-lg space-x-[30px]"
              />
              {/* {!isSignIn && (
                <input
                  type="username"
                  name="username"
                  id="username"
                  value={usernameVal}
                  onChange={() => setUsernameVal(usernameVal)}
                  required
                  placeholder="Username"
                  className="w-full flex py-3 px-[25px] border border-purple-300 rounded-lg space-x-[30px]"
                />
              )} */}
              {
                !isSignIn && (
                  // (userType === "peddler" ? (
                  //   <input
                  //     type="text"
                  //     name="name"
                  //     id="name"
                  //     value={name}
                  //     onChange={(e) => setName(e.target.value)}
                  //     required
                  //     placeholder="Name"
                  //     className="w-full flex py-3 px-[25px] border border-purple-300 rounded-lg space-x-[30px]"
                  //   />
                  // ) : (
                  <>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="First Name"
                      className="w-full flex py-3 px-[25px] border border-purple-300 rounded-lg space-x-[30px]"
                    />
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="Last Name"
                      className="w-full flex py-3 px-[25px] border border-purple-300 rounded-lg space-x-[30px]"
                    />
                  </>
                )
                // )
                // )
              }
              <input
                type="password"
                name="password"
                id="password"
                value={passVal}
                onChange={(e) => setPassVal(e.target.value)}
                required
                placeholder="Password"
                className="w-full flex py-3 px-[25px] border border-purple-300 rounded-lg space-x-[30px]"
              />
              {!isSignIn && (
                <input
                  type="password"
                  name="confirm_password"
                  id="confirm_password"
                  value={confirmPassVal}
                  onChange={(e) => setConfirmPassVal(e.target.value)}
                  required
                  placeholder="Confirm Password"
                  className="w-full flex py-3 px-[25px] border border-purple-300 rounded-lg space-x-[30px]"
                />
              )}
            </div>

            <div className="w-full flex flex-col items-center space-y-2">
              {isSignIn ? (
                <button className="w-full flex py-3 px-[25px] rounded-lg shadow-md space-x-[30px] text-white bg-purple-400 justify-center">
                  <p>Sign in</p>
                </button>
              ) : (
                <button className="w-full flex py-3 px-[25px] rounded-lg shadow-md space-x-[30px] text-white bg-purple-400 justify-center">
                  <p>Sign up</p>
                </button>
              )}
            </div>
          </form>
          <div className=" self-center">
            {isSignIn ? (
              <p className="text-black text-xs">
                Don&rsquo;t have an account?{" "}
                <button
                  className="text-purple-400 font-semibold"
                  onClick={handleSignInChange}>
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-black text-xs">
                Already have an account?{" "}
                <button
                  className="text-purple-400 font-semibold"
                  onClick={handleSignInChange}>
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PeddlerSigninComponent;
