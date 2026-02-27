const express = require("express");
const connectDB = require("./config/db");
const SOSAlert = require("./models/SOSAlert");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// connect database
connectDB();

// middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ADMIN ROUTES
app.use("/api/admin", adminRoutes);

// GET all SOS
app.get("/api/sos", async (req, res) => {
  const alerts = await SOSAlert.find().sort({ createdAt: -1 });
  res.json(alerts);
});

// CREATE SOS
app.post("/api/sos", async (req, res) => {
  try {
    const alert = await SOSAlert.create({
      studentId: req.body.studentId,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    });

    global.io.emit("newSOS", alert);

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE SOS
app.delete("/api/sos", async (req, res) => {
  try {
    await SOSAlert.deleteMany({});

    global.io.emit("alertsCleared");

    res.json({
      success: true,
      message: "All alerts deleted",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
