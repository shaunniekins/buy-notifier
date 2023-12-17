"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const LandingComponent = () => {
  const router = useRouter();

  return (
    <div className="container mx-auto sm:w-[30rem] w-screen h-[100svh] flex flex-col items-center font-Roboto justify-around font-Montserrat cursive relative bg-purple-50">
      {/* <Image
          src="/bg.jpg"
          objectFit="cover"
          alt="Dog and Cat"
          layout="fill"
          priority
        /> */}
      <div className="flex flex-col items-center absolute top-[30%]">
        {/* <Image src="/huna1.png" alt="Usap Logo" width={200} height={200} /> */}
        <button onClick={() => router.push("/")}>
          <h3 className="text-5xl font-semibold text-purple-500">NotifBuy</h3>
        </button>
      </div>

      <div className="w-full flex absolute bottom-14 px-5 items-center justify-between">
        <button
          className="flex text-lg rounded-xl px-3 py-1 bg-purple-600 text-white "
          onClick={() => router.push("/peddler/signin")}>
          Login as Peddler
        </button>
        <button
          className="flex text-lg rounded-xl px-3 py-1 bg-purple-600 text-white "
          onClick={() => router.push("/consumer/signin")}>
          Login as Customer
        </button>
      </div>
    </div>
  );
};

export default LandingComponent;
