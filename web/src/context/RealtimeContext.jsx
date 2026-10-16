import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_ORIGIN, tokenStore } from "../lib/api";
import { useAuth } from "./AuthContext";

const RealtimeContext = createContext({ socket: null, online: new Set(), unread: 0, clearUnread: () => {} });

// Keeps one authenticated socket per session. New messages update the
// React Query cache for the relevant conversation and the chat list.
export function RealtimeProvider({ children }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState(null);
  const [online, setOnline] = useState(new Set());
  const [unread, setUnread] = useState(0);
  const activeChatRef = useRef(null);

  useEffect(() => {
    if (!user) return undefined;
    const s = io(API_ORIGIN || undefined, { auth: { token: tokenStore.get() } });
    setSocket(s);

    s.on("presence", (ids) => setOnline(new Set(ids)));
    s.on("message:new", (message) => {
      queryClient.setQueryData(["messages", message.chatId], (old) =>
        old && !old.some((m) => m._id === message._id) ? [...old, message] : old
      );
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      const mine = message.senderId === user._id;
      if (!mine && activeChatRef.current !== message.chatId) {
        setUnread((n) => n + 1);
        toast.message("New message", { description: message.text.slice(0, 80) });
      }
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user, queryClient]);

  const clearUnread = useCallback(() => setUnread(0), []);
  const setActiveChat = useCallback((id) => {
    activeChatRef.current = id;
  }, []);
  const value = useMemo(
    () => ({ socket, online, unread, clearUnread, setActiveChat }),
    [socket, online, unread, clearUnread, setActiveChat]
  );
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export const useRealtime = () => useContext(RealtimeContext);
