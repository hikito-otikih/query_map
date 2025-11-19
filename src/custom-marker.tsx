// custom-marker.tsx

import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerUrl from "../src/assets/mapMarker.svg";
import redMarkerUrl from "../src/assets/redMapMarker.svg";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

interface CustomMarkerProps {
  position: L.LatLngExpression;
  children: React.ReactNode; // Content to display inside the marker
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ position, children }) => {
  const map = useMap();

  const customIcon = L.icon({
    iconUrl: MarkerUrl,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  });

  return (
    <Marker position={position} icon={customIcon}>
      {children}
    </Marker>
  );
};

const RedCustomMarker: React.FC<CustomMarkerProps> = ({ position, children }) => {
  const map = useMap();
  const redCustomIcon = L.icon({
    iconUrl: redMarkerUrl,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
  return (
    <Marker position={position} icon={redCustomIcon}>
      {children}
    </Marker>
  );
};


export default CustomMarker;
export { RedCustomMarker };