import { useState, useRef } from "react";
import axios from "axios";

export default function SOS() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const alertIdRef = useRef(null);
  const trackingIntervalRef = useRef(null);

  const sendSOS = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // STEP 1: Create SOS alert
          const res = await axios.post("http://localhost:5001/api/sos", {
            studentId: "student123",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          const alertId = res.data.data._id;

          alertIdRef.current = alertId;

          setMessage("SOS Sent Successfully ✅");

          // STEP 2: Start live tracking
          startTracking(alertId);
        } catch (err) {
          setMessage("Error sending SOS ❌");
        }

        setLoading(false);
      },
      () => {
        setMessage("Location permission denied");
        setLoading(false);
      },
    );
  };

  // LIVE TRACKING FUNCTION
  const startTracking = (alertId) => {
    trackingIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          await axios.put(`http://localhost:5001/api/sos/${alertId}/location`, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          console.log("Location updated");
        } catch (err) {
          console.log("Tracking error");
        }
      });
    }, 5000); // every 5 seconds
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Emergency SOS</h1>

      <button
        onClick={sendSOS}
        style={{
          background: "red",
          color: "white",
          padding: "15px 30px",
          fontSize: "18px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {loading ? "Sending..." : "SEND SOS"}
      </button>

      <p>{message}</p>
    </div>
  );
}
