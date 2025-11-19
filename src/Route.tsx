import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const Route = ({ source, destination }) => {
  const map = useMap();

  useEffect(() => {
    const fetchRoute = async () => {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${source[1]},${source[0]};${destination[1]},${destination[0]}?overview=full`
      );
      const data = await response.json();
      const coordinates = data.waypoints.map((waypoint) => [
        waypoint.location[1],
        waypoint.location[0],
      ]);
      console.log("coordinates", coordinates);
      L.polyline(coordinates, { color: "red" }).addTo(map);
    };

    fetchRoute();
  }, [source, destination, map]);

  return null;
};

export default Route;