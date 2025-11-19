// Map.tsx
import React, { useState } from "react";
import { MapContainer, Popup, TileLayer, useMapEvents, useMap, Marker } from "react-leaflet";
import CustomMarker from "./custom-marker"; 
import axios from "axios";
import { CONFIG } from './constants';
import L from 'leaflet';
import type { IPOI } from "./api";
import { fetchAnyPOI } from "./api";
import { RedCustomMarker } from "./custom-marker";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function Map() {
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState<{lat: number, lng: number} | null>(null);
  const [pois, setPois] = useState<IPOI[]>([]);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'error' | 'info'} | null>(null);

  const getPoiType = (tags: any) => {
    if (tags.amenity) return `Tiện ích: ${tags.amenity}`;
    if (tags.shop) return `Cửa hàng: ${tags.shop}`;
    if (tags.tourism) return `Du lịch: ${tags.tourism}`;
    if (tags.leisure) return `Giải trí: ${tags.leisure}`;
    if (tags.historic) return `Lịch sử: ${tags.historic}`;
    return "Địa điểm khác";
  };

  const handleSearch = async () => {
    if (!searchText) return;
    setLoading(true);
    setMessage(null);
    setPois([]);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
        setLoading(false);
        setMessage({ text: "Quá thời gian chờ (15s). Các APIs tìm POI hoặc tìm địa điểm chính chưa phản hồi!", type: 'error' });
    }, 15000);
    try {
      const { data } = await axios.get(`${CONFIG.NOMINATIM_BASE_URL}/search`, {
        params: {
          q: searchText,
          format: "jsonv2",
          limit: 1, 
          addressdetails: 1,
          email: CONFIG.CONTACT_EMAIL 
        },
        signal: controller.signal
      });
      
      if (data && data.length > 0) {
        const result = data[0];
        setSearchResult({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
        setName(result.display_name);
        const POI_results = await fetchAnyPOI(parseFloat(result.lat), parseFloat(result.lon), 1000, 5, controller.signal);
        setPois(POI_results); 
        clearTimeout(timeoutId);
        setLoading(false);
        if(POI_results.length === 0) {
             setMessage({ text: "Đã tìm thấy địa điểm nhưng không có POI nào quanh đây.", type: 'info' });
        } else {
          clearTimeout(timeoutId);
          setLoading(false);
          setMessage({ text: "Đã tìm thấy các POI.", type: 'info' });
        }
      }
      setSearchText("");
    } catch (error: any) {
      if (error.message === "TIMEOUT" || axios.isCancel(error)) {
          // Đã xử lý hiển thị message trong setTimeout
      } else {
          console.error("Error:", error);
          setLoading(false);
          setMessage({ text: "Có lỗi xảy ra khi kết nối.", type: 'error' });
      }
    }
  }

  function LocationMarker() {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMapEvents({
      click(e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      },
    })
    return position === null ? null : (
      <Marker position={position}>
        <Popup>You clicked here</Popup>
      </Marker>
    );
  }

  function FlyToSearch({ coords }: { coords: { lat: number, lng: number } | null }) {
    const map = useMap();
    if (coords) {
      map.setView(coords, 16); 
      return (
        <CustomMarker position={coords}>
           <Popup>Kết quả tìm kiếm: {name}</Popup>
        </CustomMarker>
      );
    }
    return null;
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      
      {/* Ô SEARCH */}
      <div 
        className="map-search-box"
        style={{
          position: "absolute", 
          top: "20px", 
          left: "50px", 
          zIndex: 1000, 
          background: "white",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column", 
          gap: "5px"
        }}
      >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input 
                  type="text" 
                  placeholder="Tìm kiếm địa điểm..." 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                  disabled={loading} 
                  style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", width: "200px" }}
              />
              <button 
                onClick={handleSearch}
                disabled={loading}
                style={{ 
                    padding: "8px 16px", 
                    background: loading ? "#ccc" : "#007bff", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "4px", 
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                }}
              >
                {loading && <div className="spinner"></div>}
                {loading ? "..." : "Tìm"}
              </button>
          </div>

          {/* Khu vực hiển thị thông báo lỗi/thành công */}
          {message && (
              <div style={{ 
                  fontSize: "12px", 
                  color: message.type === 'error' ? "red" : "blue", 
                  maxWidth: "260px" 
              }}>
                  {message.text}
              </div>
          )}
      </div>

      {/* Style cho vòng quay Loading (Spinner) */}
      <style>{`
        .spinner {
            width: 12px;
            height: 12px;
            border: 2px solid #fff;
            border-bottom-color: transparent;
            border-radius: 50%;
            display: inline-block;
            box-sizing: border-box;
            animation: rotation 1s linear infinite;
        }
        @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
      `}</style>

      <MapContainer 
        center={[51.505, -0.09]} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ width: "100%", height: "100%" }} 
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
        
        <FlyToSearch coords={searchResult} />

        {pois.map((poi) => {
          const lat = poi.center ? poi.center.lat : poi.lat;
          const lon = poi.center ? poi.center.lon : poi.lon;

          return (
            <RedCustomMarker key={poi.id} position={[lat, lon]}>
              <Popup>
                <strong>{poi.tags.name || "Không có tên"}</strong> <br />
                <small>{getPoiType(poi.tags)}</small>
              </Popup>
            </RedCustomMarker>
          );
        })}
        
      </MapContainer>
    </div>
  );
}