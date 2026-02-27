const express = require("express");
const connectDB = require("./config/db");
const SOSAlert = require("./models/SOSAlert");
const adminRoutes = require("./routes/adminRoutes");
const cors = require("cors");
const app = express();
const Student = require("./models/Student");
const getDistance = require("./utils/distance");
const auth = require("./middleware/auth");

// connect database
connectDB();

// middleware
app.use(express.json());

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// ADMIN ROUTES
app.use("/api/admin", adminRoutes);

// GET all SOS
app.get("/api/sos", auth, async (req, res) => {
  const CAMPUS_LAT = 31.2536;
  const CAMPUS_LNG = 75.7036;

  const alerts = await SOSAlert.find()
    .populate("student")
    .sort({ createdAt: -1 });

  const alertsWithDistance = alerts.map((alert) => {
    let distance = null;

    if (alert.latitude && alert.longitude) {
      distance = getDistance(
        CAMPUS_LAT,
        CAMPUS_LNG,
        alert.latitude,
        alert.longitude,
      );
    }

    return {
      ...alert.toObject(),
      distance: distance ? distance.toFixed(2) : null,
    };
  });

  res.json(alertsWithDistance);
});

// CREATE STUDENT

app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.json(student);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// CREATE SOS
app.post("/api/sos", async (req, res) => {
  try {
    const student = await Student.findOne({
      studentId: req.body.studentId,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const alert = await SOSAlert.create({
      student: student._id,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    });

    const populatedAlert = await alert.populate("student");

    global.io.emit("newSOS", populatedAlert);

    res.json({
      success: true,
      data: populatedAlert,
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

// UPDATE student location (live tracking)
app.put("/api/sos/:id/location", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const alert = await SOSAlert.findByIdAndUpdate(
      req.params.id,
      {
        latitude,
        longitude,
      },
      { new: true },
    ).populate("student");

    // emit live update to admin
    global.io.emit("locationUpdated", alert);

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE SOS STATUS (RESPONDING / RESOLVED)
app.put("/api/sos/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;

    const alert = await SOSAlert.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).populate("student");

    if (!alert) {
      return res.status(404).json({
        message: "Alert not found",
      });
    }

    // Emit real-time status update
    global.io.emit("statusUpdated", alert);

    res.json(alert);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
module.exports = app;
