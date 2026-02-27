const app = require("./src/app");
const http = require("http");
const { Server } = require("socket.io");

const PORT = 5001;

// routes
const sosRoutes = require("./src/routes/sosRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

// create server
const server = http.createServer(app);

// socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

// make io global
global.io = io;

io.on("connection", (socket) => {
  console.log("Admin connected:", socket.id);
});

// register routes (ONLY ONCE)
app.use("/api/sos", sosRoutes);
app.use("/api/admin", adminRoutes);

// start server
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
