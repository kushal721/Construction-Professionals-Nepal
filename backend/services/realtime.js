import { Server } from "socket.io";
import { loadUserFromToken } from "../middlewares/requireAuth.js";

let io;
// userId -> number of open sockets, for presence.
const online = new Map();

export const initRealtime = (httpServer, corsOrigin) => {
  io = new Server(httpServer, { cors: { origin: corsOrigin } });

  io.use(async (socket, next) => {
    try {
      const user = await loadUserFromToken(socket.handshake.auth?.token);
      if (!user) return next(new Error("unauthorized"));
      socket.data.userId = user._id.toString();
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const { userId } = socket.data;
    socket.join(`user:${userId}`);
    online.set(userId, (online.get(userId) || 0) + 1);
    io.emit("presence", [...online.keys()]);

    socket.on("typing", ({ chatId, to }) => {
      if (to) io.to(`user:${to}`).emit("typing", { chatId, from: userId });
    });

    socket.on("disconnect", () => {
      const n = (online.get(userId) || 1) - 1;
      if (n <= 0) online.delete(userId);
      else online.set(userId, n);
      io.emit("presence", [...online.keys()]);
    });
  });

  return io;
};

export const emitToUser = (userId, event, payload) => {
  io?.to(`user:${userId}`).emit(event, payload);
};
