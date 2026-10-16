import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { PublicLayout } from "./components/layout/PublicLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { GuestOnly, RequireAuth } from "./components/layout/Guards";
import { Spinner } from "./components/ui";

const page = (load) => lazy(load);

// Public
const Home = page(() => import("./pages/public/Home"));
const Designs = page(() => import("./pages/public/Designs"));
const DesignDetail = page(() => import("./pages/public/DesignDetail"));
const Professionals = page(() => import("./pages/public/Professionals"));
const ProfessionalDetail = page(() => import("./pages/public/ProfessionalDetail"));
const About = page(() => import("./pages/public/About"));
const Contact = page(() => import("./pages/public/Contact"));
const NotFound = page(() => import("./pages/public/NotFound"));

// Auth
const Login = page(() => import("./pages/auth/Login"));
const Register = page(() => import("./pages/auth/Register"));
const ForgotPassword = page(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = page(() => import("./pages/auth/ResetPassword"));

// Dashboard
const Overview = page(() => import("./pages/dashboard/Overview"));
const MyDesigns = page(() => import("./pages/dashboard/MyDesigns"));
const DesignForm = page(() => import("./pages/dashboard/DesignForm"));
const Availability = page(() => import("./pages/dashboard/Availability"));
const Bookings = page(() => import("./pages/dashboard/Bookings"));
const Favorites = page(() => import("./pages/dashboard/Favorites"));
const Messages = page(() => import("./pages/dashboard/Messages"));
const Settings = page(() => import("./pages/dashboard/Settings"));
const AdminUsers = page(() => import("./pages/dashboard/admin/Users"));
const AdminDesigns = page(() => import("./pages/dashboard/admin/Designs"));
const AdminReport = page(() => import("./pages/dashboard/admin/Report"));

export default function App() {
  return (
    <Suspense fallback={<Spinner className="min-h-[60vh]" />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="designs" element={<Designs />} />
          <Route path="designs/:id" element={<DesignDetail />} />
          <Route path="professionals" element={<Professionals />} />
          <Route path="professionals/:id" element={<ProfessionalDetail />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="reset-password/:id/:token" element={<ResetPassword />} />
          <Route element={<GuestOnly />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          path="dashboard"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Overview />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:chatId" element={<Messages />} />
          <Route path="settings" element={<Settings />} />
          <Route element={<RequireAuth roles={["client", "professional"]} />}>
            <Route path="bookings" element={<Bookings />} />
          </Route>
          <Route element={<RequireAuth roles={["client"]} />}>
            <Route path="favorites" element={<Favorites />} />
          </Route>
          <Route element={<RequireAuth roles={["professional"]} />}>
            <Route path="designs" element={<MyDesigns />} />
            <Route path="designs/new" element={<DesignForm />} />
            <Route path="designs/:id/edit" element={<DesignForm />} />
            <Route path="availability" element={<Availability />} />
          </Route>
          <Route path="admin" element={<RequireAuth roles={["admin"]} />}>
            <Route path="users" element={<AdminUsers />} />
            <Route path="designs" element={<AdminDesigns />} />
            <Route path="report" element={<AdminReport />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
