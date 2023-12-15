"use client";

import { divIcon, icon } from "leaflet";
import { useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Map } from "leaflet";
import { MdLocationPin } from "react-icons/md";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

function useClientSideMap() {
  const map = useMap();
  const mapEvents = useMapEvents({});

  return { map, mapEvents };
}

interface CenterProps {
  center: [number, number];
}

const ChangeView: React.FC<CenterProps> = ({ center }): React.ReactNode => {
  const { map } = useClientSideMap();

  useEffect(() => {
    if (map) {
      map.flyTo(center);
    }
  }, [center, map]);

  return null;
};

interface MapComponentProps {
  //[latitude, longitude]
  position: [number, number];
  points: any;
}

const MapComponent: React.FC<MapComponentProps> = ({ position, points }) => {
  const iconSize: [number, number] = [100, 100];
  const iconSizeOther: [number, number] = [60, 60];

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

  const ICON_OTHER = icon({
    iconUrl: "/location.png",
    // className: "morph-active",
    iconSize: iconSizeOther,
  });

  return (
    <div className="w-full bg-white shadow-lg flex justify-between rounded-xl h-full">
      <MapContainer
        center={position}
        zoom={18}
        maxZoom={18}
        zoomControl={false}
        attributionControl={false}
        // scrollWheelZoom={false}
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

        {points.map((point: any, index: number) => (
          <Marker
            key={index}
            position={[point.latitude, point.longitude]}
            icon={ICON_OTHER}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        ))}

        <ChangeView center={position} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
