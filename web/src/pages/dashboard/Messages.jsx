import { Fragment, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { format, isSameDay, isToday, isYesterday, parseISO } from "date-fns";
import { ArrowLeft, MessageSquare, Search, SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { chatTime } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import { useRealtime } from "../../context/RealtimeContext";
import { Avatar, ButtonLink, EmptyState, ErrorState, IconButton, Skeleton, Spinner } from "../../components/ui";

const TYPING_THROTTLE = 2000;
const TYPING_TIMEOUT = 3000;

const dayLabel = (d) => {
  const date = parseISO(d);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, d MMM yyyy");
};

function ConversationList({ chats, activeId, online, isLoading, error, refetch }) {
  const [q, setQ] = useState("");
  const filtered = (chats || []).filter((c) => c.otherUser.username.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-line p-3">
        <label className="relative block">
          <span className="sr-only">Search conversations</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="field py-2 pl-9" />
        </label>
      </div>
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-1">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} className="m-2" />
        ) : !filtered.length ? (
          <p className="px-3 py-8 text-center text-sm text-ink-faint">{q ? "No matches" : "No conversations yet"}</p>
        ) : (
          <ul className="space-y-0.5">
            {filtered.map((c) => (
              <li key={c._id}>
                <Link
                  to={`/dashboard/messages/${c._id}`}
                  aria-current={c._id === activeId ? "page" : undefined}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
                    c._id === activeId ? "bg-brand-soft" : "hover:bg-muted"
                  )}
                >
                  <Avatar user={c.otherUser} size="sm" online={online.has(c.otherUser._id)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={clsx("truncate text-sm font-bold", c._id === activeId && "text-brand")}>{c.otherUser.username}</p>
                      <span className="shrink-0 text-[11px] text-ink-faint">{chatTime(c.lastMessageAt)}</span>
                    </div>
                    <p className="truncate text-xs text-ink-faint">{c.lastMessage || "No messages yet"}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Thread({ chat }) {
  const { user } = useAuth();
  const { socket, online } = useRealtime();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const lastTypingSent = useRef(0);
  const navigate = useNavigate();
  const other = chat.otherUser;

  const { data: messages, isLoading, error, refetch } = useQuery({
    queryKey: ["messages", chat._id],
    queryFn: () => api(`/chats/${chat._id}/messages`),
  });

  const send = useMutation({
    mutationFn: (body) => api(`/chats/${chat._id}/messages`, { method: "POST", body: { text: body } }),
    onSuccess: (message) => {
      queryClient.setQueryData(["messages", chat._id], (old = []) =>
        old.some((m) => m._id === message._id) ? old : [...old, message]
      );
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      setText("");
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length, typing]);

  useEffect(() => {
    if (!socket) return undefined;
    let timer;
    const onTyping = ({ chatId, from }) => {
      if (chatId !== chat._id || from !== other._id) return;
      setTyping(true);
      clearTimeout(timer);
      timer = setTimeout(() => setTyping(false), TYPING_TIMEOUT);
    };
    const onMessage = (m) => {
      if (m.chatId === chat._id && m.senderId === other._id) setTyping(false);
    };
    socket.on("typing", onTyping);
    socket.on("message:new", onMessage);
    return () => {
      clearTimeout(timer);
      socket.off("typing", onTyping);
      socket.off("message:new", onMessage);
    };
  }, [socket, chat._id, other._id]);

  const onChange = (e) => {
    setText(e.target.value);
    const now = Date.now();
    if (socket && now - lastTypingSent.current > TYPING_THROTTLE) {
      lastTypingSent.current = now;
      socket.emit("typing", { chatId: chat._id, to: other._id });
    }
  };

  const submit = (e) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value || send.isPending) return;
    send.mutate(value);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const isOnline = online.has(other._id);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-line px-3 py-3 sm:px-4">
        <IconButton label="Back to conversations" className="md:hidden" onClick={() => navigate("/dashboard/messages")}>
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
        <Avatar user={other} size="sm" online={isOnline} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{other.username}</p>
          <p className="text-xs text-ink-faint">
            {typing ? <span className="text-brand">typing…</span> : isOnline ? "Online" : <span className="capitalize">{other.role}</span>}
          </p>
        </div>
        {other.role === "professional" && (
          <ButtonLink to={`/professionals/${other._id}`} variant="ghost" size="sm">
            View profile
          </ButtonLink>
        )}
      </header>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto bg-canvas/60 px-3 py-4 sm:px-5" aria-live="polite">
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !messages.length ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Avatar user={other} size="lg" />
            <p className="mt-3 font-semibold">Start your conversation with {other.username}</p>
            <p className="mt-1 max-w-xs text-sm text-ink-faint">Introduce your project, plot size and budget to get a helpful reply.</p>
          </div>
        ) : (
          <ol className="space-y-1.5">
            {messages.map((m, i) => {
              const mine = m.senderId === user._id;
              const prev = messages[i - 1];
              const newDay = !prev || !isSameDay(parseISO(prev.createdAt), parseISO(m.createdAt));
              const grouped = prev && !newDay && prev.senderId === m.senderId;
              return (
                <Fragment key={m._id}>
                  {newDay && (
                    <li className="flex justify-center py-3">
                      <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-ink-faint">{dayLabel(m.createdAt)}</span>
                    </li>
                  )}
                  <li className={clsx("flex", mine ? "justify-end" : "justify-start", !grouped && "pt-1.5")}>
                    <div
                      className={clsx(
                        "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm sm:max-w-[70%]",
                        mine ? "rounded-br-md bg-brand text-brand-ink" : "rounded-bl-md border border-line bg-surface text-ink"
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      <p className={clsx("mt-0.5 text-right text-[10px]", mine ? "text-brand-ink/70" : "text-ink-faint")}>
                        {format(parseISO(m.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </li>
                </Fragment>
              );
            })}
          </ol>
        )}
        {typing && (
          <div className="mt-2 flex">
            <span className="rounded-2xl rounded-bl-md border border-line bg-surface px-3.5 py-2 text-sm text-ink-faint">typing…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-line p-3">
        <label className="sr-only" htmlFor="message-input">
          Message {other.username}
        </label>
        <textarea
          id="message-input"
          ref={inputRef}
          value={text}
          onChange={onChange}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={4000}
          placeholder="Write a message…"
          className="field max-h-32 min-h-[42px] resize-none py-2.5"
          disabled={send.isPending}
        />
        <IconButton type="submit" label="Send message" variant="primary" size="icon" className="h-[42px] w-[42px]" disabled={!text.trim()} loading={send.isPending}>
          {!send.isPending && <SendHorizontal className="h-4 w-4" />}
        </IconButton>
      </form>
    </div>
  );
}

export default function Messages() {
  const { chatId } = useParams();
  const { online, clearUnread, setActiveChat } = useRealtime();
  const { data: chats, isLoading, error, refetch } = useQuery({ queryKey: ["chats"], queryFn: () => api("/chats") });

  // The realtime helpers aren't memoized, so keep the latest in a ref instead
  // of listing them as effect dependencies.
  const realtimeRef = useRef({ clearUnread, setActiveChat });
  realtimeRef.current = { clearUnread, setActiveChat };

  useEffect(() => {
    realtimeRef.current.clearUnread();
  }, [chatId]);

  useEffect(() => {
    realtimeRef.current.setActiveChat(chatId || null);
    return () => realtimeRef.current.setActiveChat(null);
  }, [chatId]);

  const active = chats?.find((c) => c._id === chatId);
  const noChats = !isLoading && !error && !chats?.length;

  if (noChats && !chatId) {
    return (
      <>
        <h1 className="mb-6 text-2xl font-semibold sm:text-3xl">Messages</h1>
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Message a professional from their profile to discuss your project."
          action={<ButtonLink to="/professionals">Find professionals</ButtonLink>}
        />
      </>
    );
  }

  return (
    <>
      <h1 className={clsx("mb-4 text-2xl font-semibold sm:text-3xl", chatId && "hidden md:block")}>Messages</h1>
      <div className="card grid h-[calc(100dvh-10.5rem)] min-h-[420px] overflow-hidden md:grid-cols-[300px_1fr]">
        <aside className={clsx("min-h-0 border-line md:block md:border-r", chatId ? "hidden" : "block")}>
          <ConversationList chats={chats} activeId={chatId} online={online} isLoading={isLoading} error={error} refetch={refetch} />
        </aside>
        <section className={clsx("min-h-0", chatId ? "block" : "hidden md:block")}>
          {!chatId ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
                <MessageSquare className="h-6 w-6" aria-hidden />
              </div>
              <p className="mt-3 font-semibold">Select a conversation</p>
              <p className="mt-1 text-sm text-ink-faint">Choose someone from the list to read and reply.</p>
            </div>
          ) : isLoading ? (
            <Spinner className="h-full" />
          ) : active ? (
            <Thread key={active._id} chat={active} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <p className="font-semibold">Conversation not found</p>
              <ButtonLink to="/dashboard/messages" variant="secondary" size="sm" className="mt-3">
                Back to messages
              </ButtonLink>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
