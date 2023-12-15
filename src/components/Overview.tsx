"use client";
import { useEffect, useState } from "react";
import Map from "./Map";

const Overview = () => {
  //   const position: [number, number] = [8.2165, 126.0458];
  const [position, setPosition] = useState<[number, number] | null>(null);

  //butuan
  // const defaultPosition: [number, number] = [8.951549, 125.527725];

  //bayugan
  const defaultPosition: [number, number] = [8.720861, 125.754318];

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("position latitude", position.coords.latitude);
        console.log("position longitude", position.coords.longitude);

        setPosition([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  return (
    <div className="w-screen h-[100svh] flex flex-col">
      <div>
        {position ? (
          <Map position={position} />
        ) : (
          <Map position={defaultPosition} />
        )}
      </div>
    </div>
  );
};

export default Overview;
