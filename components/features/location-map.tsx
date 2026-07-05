"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Coordinates } from "@/hooks/useGeolocation";
import type { HospitalResult } from "@/lib/overpass";

interface LocationMapProps {
  origin: Coordinates;
  hospitals: HospitalResult[];
}

/**
 * Custom div-icon markers instead of Leaflet's default marker images —
 * the default icon paths break under most bundlers (including Next.js)
 * because Leaflet references them relative to a CSS file, not the JS
 * module graph. Div icons sidestep that entirely.
 */
function createDivIcon(color: string, label: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:16px;height:16px;border-radius:9999px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)" title="${label}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

const userIcon = createDivIcon("#4F86C6", "Your location");
const hospitalIcon = createDivIcon("#E76F51", "Hospital");
const clinicIcon = createDivIcon("#F4A261", "Clinic");

/** Renders the user's location plus nearby hospital/clinic markers. */
export function LocationMap({ origin, hospitals }: LocationMapProps): JSX.Element {
  return (
    <div className="h-64 w-full overflow-hidden rounded-lg border border-border">
      <MapContainer
        center={[origin.latitude, origin.longitude]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[origin.latitude, origin.longitude]} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={[hospital.latitude, hospital.longitude]}
            icon={hospital.type === "hospital" ? hospitalIcon : clinicIcon}
          >
            <Popup>
              <strong>{hospital.name}</strong>
              <br />
              {hospital.distanceKm.toFixed(1)} km away
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
