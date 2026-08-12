import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { RequireAuth } from "./components/RequireAuth";
import { useAuthStore } from "./stores/authStore";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Studio from "./pages/Studio";
import Leaderboard from "./pages/Leaderboard";
import TrackDetail from "./pages/TrackDetail";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);

  // Runs once on app boot, sets isLoading -> false only after checking
  // localStorage, so RequireAuth never redirects prematurely.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        {/* flex-1 so pages that center content (Login/Register) fill exactly
            the remaining viewport height instead of adding their own
            min-h-screen on top of the navbar's height, which pushed
            content below the fold on short viewports. */}
        <main className="flex flex-1 flex-col">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/tracks/:id" element={<TrackDetail />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route
              path="/studio"
              element={
                <RequireAuth>
                  <Studio />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
