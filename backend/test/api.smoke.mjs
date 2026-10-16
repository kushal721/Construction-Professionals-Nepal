// End-to-end API checks against a running server with freshly seeded data:
//   npm run seed -- --reset && npm start   (in another terminal)
//   npm test
// Set API_URL to target a different server (default http://localhost:4000).
const B = `${process.env.API_URL || "http://localhost:4000"}/api`;
let fails = 0;
const call = async (method, path, { token, body } = {}) => {
  const r = await fetch(B + path, { method, headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) }, body: body && JSON.stringify(body) });
  return { status: r.status, data: await r.json().catch(() => null) };
};
const check = (name, cond, extra = "") => { console.log(`${cond ? "PASS" : "FAIL"}  ${name} ${cond ? "" : extra}`); if (!cond) fails++; };
const login = async (email) => (await call("POST", "/auth/login", { body: { email, password: "Password123" } })).data.token;

const [client, pro, pro2, admin] = await Promise.all(["client@cpn.test", "sita@cpn.test", "ramesh@cpn.test", "admin@cpn.test"].map(login));
check("logins", client && pro && admin);
let r = await call("POST", "/auth/login", { body: { email: "client@cpn.test", password: "wrong" } });
check("bad password 401", r.status === 401);
r = await call("GET", "/users");
check("user list requires auth", r.status === 401);
r = await call("GET", "/users", { token: client });
check("user list forbidden to client", r.status === 403);
r = await call("GET", "/users", { token: admin });
check("admin lists users w/o password", r.status === 200 && r.data.length === 8 && !("password" in r.data[0]));
r = await call("GET", "/auth/me", { token: client });
check("me has no password", r.data.user.email === "client@cpn.test" && !r.data.user.password);

r = await call("GET", "/designs?q=villa&sort=price-desc");
check("design search", r.status === 200 && r.data.items.length >= 1 && r.data.items.every(d => /villa/i.test(d.designName + d.designDescription + d.designCategory)), JSON.stringify(r.data).slice(0,200));
r = await call("GET", "/designs?category=Interior&maxCost=3000000");
check("design filter", r.data.items.length === 1 && r.data.items[0].designName === "Lakeside Retreat Interior");
r = await call("GET", "/designs?limit=5&page=3");
check("pagination", r.data.items.length === 2 && r.data.pages === 3 && r.data.total === 12);
const all = (await call("GET", "/designs?limit=48&sort=oldest")).data.items;
const sitaDesign = all.find(d => d.designer_name === "Sita Shrestha");
r = await call("GET", `/designs/${sitaDesign._id}`, { token: client });
check("design detail w/ designer + myRating", r.data.designer?.username === "Sita Shrestha" && typeof r.data.myRating === "number" && Array.isArray(r.data.related));

r = await call("DELETE", `/designs/${sitaDesign._id}`, { token: pro2 });
check("other pro can't delete design", r.status === 403);
r = await call("PATCH", `/designs/${sitaDesign._id}`, { token: client, body: { designName: "hacked" } });
check("client can't edit design", r.status === 403);
r = await call("PUT", `/designs/${sitaDesign._id}/rating`, { token: client, body: { value: 2 } });
check("rate (upsert)", r.status === 200 && r.data.myRating === 2);
r = await call("PUT", `/designs/${sitaDesign._id}/rating`, { token: pro, body: { value: 5 } });
check("can't rate own design", r.status === 400);
r = await call("POST", `/designs/${sitaDesign._id}/comments`, { token: client, body: { content: "Nice!" } });
const cid = r.data?.comment?._id;
check("comment", r.status === 201 && r.data.comment.commenterName === "Kushal Bhatta");
r = await call("PATCH", `/designs/${sitaDesign._id}/comments/${cid}`, { token: pro2, body: { content: "x" } });
check("can't edit other's comment", r.status === 403);
r = await call("DELETE", `/designs/${sitaDesign._id}/comments/${cid}`, { token: pro });
check("design owner can delete comment", r.status === 200);

r = await call("POST", `/favorites/${sitaDesign._id}`, { token: client });
r = await call("GET", "/favorites/ids", { token: client });
check("favorites", r.data.includes(sitaDesign._id));

r = await call("GET", "/professionals?q=interior");
check("pro search by specialization", r.data.length === 1 && r.data[0].username === "Anjali Gurung", JSON.stringify(r.data.map(p=>p.username)));
const sitaId = (await call("GET", "/professionals?q=sita")).data[0]._id;
r = await call("GET", `/professionals/${sitaId}`);
check("pro detail", r.data.details?.specialization === "Architect" && r.data.designs.length === 3 && r.data.upcomingSlots.length === 3 && r.data.averageRating > 0);

const slots = (await call("GET", `/professionals/${sitaId}/slots`)).data;
check("public slots show booked times", slots[0].bookedTimes.includes("10:30"));
r = await call("POST", "/bookings", { token: client, body: { slotId: slots[2]._id, time: "07:00" } });
check("booking outside window rejected", r.status === 400);
r = await call("POST", "/bookings", { token: (await login("priya@cpn.test")), body: { slotId: slots[0]._id, time: "10:30" } });
check("double-booking a time rejected", r.status === 409);
r = await call("POST", "/bookings", { token: client, body: { slotId: slots[2]._id, time: "09:30", remark: "test" } });
const bid = r.data?.booking?._id;
check("booking created", r.status === 201);
r = await call("POST", "/bookings", { token: pro, body: { slotId: slots[2]._id, time: "10:00" } });
check("pro can't book", r.status === 403);
r = await call("PATCH", `/bookings/${bid}/status`, { token: client, body: { status: "confirmed" } });
check("client can't confirm", r.status === 400);
r = await call("PATCH", `/bookings/${bid}/status`, { token: pro2, body: { status: "confirmed" } });
check("other pro can't touch booking", r.status === 403);
r = await call("PATCH", `/bookings/${bid}/status`, { token: pro, body: { status: "confirmed" } });
check("pro confirms", r.status === 200 && r.data.booking.status === "confirmed");
r = await call("GET", "/bookings", { token: pro });
check("pro bookings populated", r.data.length >= 3 && r.data[0].client?.username && r.data[0].appointment?.date);

r = await call("GET", "/chats", { token: client });
const chat = r.data[0];
check("chats list", chat?.otherUser?.username === "Sita Shrestha" && chat.lastMessage);
r = await call("GET", `/chats/${chat._id}/messages`, { token: pro2 });
check("non-member can't read chat", r.status === 404);
r = await call("POST", `/chats/${chat._id}/messages`, { token: pro, body: { text: "See you Tuesday!" } });
check("send message", r.status === 201);
r = await call("POST", "/chats", { token: client, body: { userId: (await call("GET", "/professionals?q=ramesh")).data[0]._id } });
check("open new chat", r.status === 200 && r.data.otherUser.username === "Ramesh Adhikari");

r = await call("GET", "/stats/public");
check("public stats", r.data.designs === 12 && r.data.professionals === 4);
for (const [n, t] of [["admin", admin], ["pro", pro], ["client", client]]) {
  r = await call("GET", "/stats/dashboard", { token: t });
  check(`dashboard stats ${n}`, r.status === 200, JSON.stringify(r.data).slice(0, 200));
}
r = await call("GET", "/admin/report", { token: admin });
check("admin report", r.data.length === 4 && r.data[0].designs);
r = await call("POST", "/auth/forgot-password", { body: { email: "client@cpn.test" } });
check("forgot password", r.status === 200);
r = await call("POST", "/auth/register", { body: { username: "x", email: "y@z.co", password: "Password123", role: "admin" } });
check("can't self-register as admin", r.status === 400);
console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED");
process.exitCode = fails ? 1 : 0;
