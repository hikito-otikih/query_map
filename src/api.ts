import axios from "axios";
import { CONFIG } from "./constants";
export interface IPOI {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    amenity?: string;
    shop?: string;
    tourism?: string;
    leisure?: string;
    [key: string]: any; 
  };
  type: "node" | "way" | "relation";
  center?: { lat: number; lon: number }; 
}

export const fetchAnyPOI = async (lat: number, lng: number, radius: number = 500, limit: number = 50, signal?: AbortSignal) => {
  const server = CONFIG.OVERPASS_SERVERS[Math.floor(Math.random() * CONFIG.OVERPASS_SERVERS.length)];

  const query = `
    [out:json][timeout:30];
    nwr(around:${radius},${lat},${lng})
       [~"^(amenity|shop|tourism|leisure|historic)$"~"."];
    out center ${limit};
  `;

  try {
    console.log("Đang gọi Overpass...");
    const response = await axios.post(server, `data=${encodeURIComponent(query)}`, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout : 30000, signal: signal
    });

    return response.data.elements as IPOI[];
  } catch (error) {
    if (axios.isCancel(error)) {
        console.log("Request đã bị hủy do quá thời gian.");
        throw new Error("TIMEOUT"); 
    }
    console.error("Lỗi lấy POI:", error);
    return [];
  }
};