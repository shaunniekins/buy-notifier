"use client";

import { divIcon, icon } from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

interface CenterProps {
  center: [number, number];
}

const ChangeView: React.FC<CenterProps> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center);
  }, [center, map]);

  return null;
};

interface MapComponentProps {
  //[latitude, longitude]
  position: [number, number];
}

const Map: React.FC<MapComponentProps> = ({ position }) => {
  const iconSize: [number, number] = [100, 100];

  const ICON = divIcon({
    // iconUrl: "/vercel.svg",
    // className: "morph-active",
    //<div class="pulseCircle2 w-[600px] h-[600px] z-0 absolute bg-purple-400 rounded-full"></div>
    className: "custom-icon", // this class will be added to the div
    html: `
    <div style='width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative;'>
      <div style='width: ${iconSize[0] / 2}px; height: ${
      iconSize[1] / 2
    }px; position: absolute; background-color: red; border-radius: 50%;'></div>
      <div class='pulseCircle2' style='width: ${iconSize[0]}px; height: ${
      iconSize[1]
    }px; position: absolute; background-color: purple; border-radius: 50%;'></div>
    </div>
  `,
    iconSize: iconSize,
  });

  return (
    <div className="w-full bg-white shadow-lg flex justify-between rounded-xl h-full">
      <MapContainer
        center={position}
        zoom={18}
        maxZoom={25}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100svh" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={ICON}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
        <ChangeView center={position} />
      </MapContainer>
    </div>
  );
};

export default Map;
