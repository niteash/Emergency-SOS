import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5001/api/admin/login", {
        username,
        password,
      });

      const token = res.data.token;

      if (!token) {
        alert("Login failed");
        return;
      }

      // Save token
      localStorage.setItem("token", token);

      console.log("Token saved:", token);

      // Delay navigation slightly to ensure storage updates
      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 100);
    } catch (err) {
      console.log(err);

      alert("Invalid username or password");
    }
  };

  return (
    <div
      style={{
        width: "300px",
        margin: "120px auto",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h2>Admin Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login}>Login</button>
    </div>
  );
}
