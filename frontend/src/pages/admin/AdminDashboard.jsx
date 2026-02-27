import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import SOSMap from "../../components/map/SOSMap";
import api from "../../services/api";

const socket = io("http://localhost:5001");

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [emergency, setEmergency] = useState(false);

  const audioRef = useRef(null);

  // get JWT token
  const token = localStorage.getItem("token");

  // axios config with auth
  const axiosConfig = {
    headers: {
      Authorization: token,
    },
  };

  useEffect(() => {
    audioRef.current = new Audio("/sounds/siren.ogg");
  }, []);

  const playAlarm = () => {
    audioRef.current?.play().catch(() => {});
  };

  const stopAlarm = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  useEffect(() => {
    loadAlerts();

    socket.on("newSOS", (alert) => {
      playAlarm();

      setAlerts((prev) => [alert, ...prev]);

      setEmergency(true);

      setTimeout(() => setEmergency(false), 5000);
    });

    socket.on("alertsCleared", () => {
      setAlerts([]);

      stopAlarm();
    });

    return () => {
      socket.off("newSOS");
      socket.off("alertsCleared");
    };
  }, []);

  // LOAD ALERTS (WITH TOKEN)
  const loadAlerts = async () => {
    try {
      const res = await api.get("/sos");

      setAlerts(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/admin-login";
      }
    }
  };
  // CLEAR ALERTS (WITH TOKEN)
  const clearAlerts = async () => {
    if (!window.confirm("Clear alerts?")) return;

    try {
      await api.delete("/sos");

      setAlerts([]);
      stopAlarm();
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/admin-login";
      }
    }
  };
  // LOGOUT FIXED
  const logout = () => {
    localStorage.removeItem("token");

    window.location.href = "/admin-login";
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2>Admin Emergency Dashboard</h2>
          <div>{alerts.length} Active Alerts</div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={stopAlarm}>Stop Alarm</button>

          <button onClick={clearAlerts}>Clear Alerts</button>

          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {emergency && <div style={styles.emergency}>NEW EMERGENCY ALERT</div>}

      <div style={styles.map}>
        <SOSMap alerts={alerts} />
      </div>

      <div style={styles.grid}>
        {alerts.map((alert) => (
          <div key={alert._id} style={styles.card}>
            <div>
              <b>Student:</b> {alert.studentId}
            </div>

            <div>
              <b>Location:</b> {alert.latitude.toFixed(5)},{" "}
              {alert.longitude.toFixed(5)}
            </div>

            <div>
              <b>Time:</b> {new Date(alert.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    margin: 0,
    fontFamily: "system-ui",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 20px",
    borderBottom: "1px solid #ddd",
  },

  emergency: {
    background: "#dc2626",
    color: "white",
    padding: "10px 20px",
    fontWeight: "bold",
  },

  map: {
    width: "100%",
    height: "400px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
    gap: "10px",
    padding: "10px",
  },

  card: {
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "12px",
    background: "#000000",
    color: "red",
    fontSize: "1.4rem",
  },
};
