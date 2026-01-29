import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where
} from "firebase/firestore";

import { auth } from "../../firebase/auth";
import { db } from "../../firebase/firestore";

import AddTheater from "../Theater/AddTheater";
import ScreenManager from "../Screen/ScreenManager";
import AddMovie from "../Movie/AddMovie";
import MovieList from "../Movie/MovieList";
import ShowManager from "../Show/ShowManager";
import PricingManager from "../Pricing/PricingManager";
import SeatGrid from "../Booking/SeatGrid";
import AnalyticsDashboard from "../Revenue/AnalyticsDashboard";

import "./Dashboard.css";

function Dashboard() {
  const uid = auth.currentUser.uid;

  const [activeTab, setActiveTab] = useState("analytics");

  // ───────────────── STEP 12 STATE ─────────────────
  const [theaters, setTheaters] = useState([]);
  const [screens, setScreens] = useState([]);
  const [shows, setShows] = useState([]);

  const [selectedTheater, setSelectedTheater] = useState("");
  const [selectedScreen, setSelectedScreen] = useState("");
  const [selectedShowId, setSelectedShowId] = useState("");
  const [selectedShowSeats, setSelectedShowSeats] = useState(null);

  // ───────────── LOAD THEATERS (OWNER ONLY) ─────────────
  useEffect(() => {
    if (activeTab !== "seats") return;

    const loadTheaters = async () => {
      const q = query(
        collection(db, "theaters"),
        where("ownerId", "==", uid)
      );
      const snap = await getDocs(q);
      setTheaters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    loadTheaters();
  }, [activeTab, uid]);

  // ───────────── LOAD SCREENS FOR THEATER ─────────────
  useEffect(() => {
    if (!selectedTheater) return;

    const loadScreens = async () => {
      const q = query(
        collection(db, "screens"),
        where("theaterId", "==", selectedTheater)
      );
      const snap = await getDocs(q);
      setScreens(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    loadScreens();
  }, [selectedTheater]);

  // ───────────── LOAD SHOWS FOR SCREEN ─────────────
  useEffect(() => {
    if (!selectedScreen) return;

    const loadShows = async () => {
      const q = query(
        collection(db, "shows"),
        where("screenId", "==", selectedScreen)
      );
      const snap = await getDocs(q);
      setShows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    loadShows();
  }, [selectedScreen]);

  // ───────────── LOAD SEATS FOR SHOW ─────────────
  const handleShowSelect = async (showId) => {
    setSelectedShowId(showId);
    setSelectedShowSeats(null);

    if (!showId) return;

    const snap = await getDoc(doc(db, "shows", showId));
    if (snap.exists()) {
      setSelectedShowSeats(snap.data().seats);
    }
  };

  // ───────────────── RENDER ─────────────────
  return (
    <div className="dash-wrapper">
      <header className="dash-header">
        <h2>🎬 Movie Admin Panel</h2>
        <button onClick={() => signOut(auth)}>Logout</button>
      </header>

      <div className="dash-body">
        <aside className="dash-sidebar">
          <p className="sidebar-title">MANAGEMENT</p>

          <button onClick={() => setActiveTab("analytics")} className={activeTab === "analytics" ? "active" : ""}>
            📊 Analytics
          </button>
          <button onClick={() => setActiveTab("theater")} className={activeTab === "theater" ? "active" : ""}>
            🏢 Theaters
          </button>
          <button onClick={() => setActiveTab("screen")} className={activeTab === "screen" ? "active" : ""}>
            🎥 Screens
          </button>
          <button onClick={() => setActiveTab("movie")} className={activeTab === "movie" ? "active" : ""}>
            🎞 Movies
          </button>
          <button onClick={() => setActiveTab("show")} className={activeTab === "show" ? "active" : ""}>
            🕒 Shows
          </button>
          <button onClick={() => setActiveTab("pricing")} className={activeTab === "pricing" ? "active" : ""}>
            💰 Pricing
          </button>

          <p className="sidebar-title">OPERATIONS</p>
          <button onClick={() => setActiveTab("seats")} className={activeTab === "seats" ? "active" : ""}>
            🪑 Seat Status (Live)
          </button>
        </aside>

        <main className="dash-content">
          {activeTab === "analytics" && <AnalyticsDashboard />}
          {activeTab === "theater" && <AddTheater />}
          {activeTab === "screen" && <ScreenManager />}
          {activeTab === "movie" && (
            <>
              <AddMovie />
              <MovieList />
            </>
          )}
          {activeTab === "show" && <ShowManager />}
          {activeTab === "pricing" && <PricingManager />}

          {/* ───────────── SEAT STATUS (CORRECT STRUCTURE) ───────────── */}
          {activeTab === "seats" && (
            <div className="seat-preview-note">
              <h3>Live Seat Status</h3>

              <select
                value={selectedTheater}
                onChange={(e) => {
                  setSelectedTheater(e.target.value);
                  setSelectedScreen("");
                  setSelectedShowId("");
                  setSelectedShowSeats(null);
                }}
              >
                <option value="">Select Theater</option>
                {theaters.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              {selectedTheater && (
                <select
                  value={selectedScreen}
                  onChange={(e) => {
                    setSelectedScreen(e.target.value);
                    setSelectedShowId("");
                    setSelectedShowSeats(null);
                  }}
                >
                  <option value="">Select Screen</option>
                  {screens.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}

              {selectedScreen && (
                <select
                  value={selectedShowId}
                  onChange={(e) => handleShowSelect(e.target.value)}
                >
                  <option value="">Select Show</option>
                  {shows.map(show => (
                    <option key={show.id} value={show.id}>
                      {show.date} • {show.startTime}
                    </option>
                  ))}
                </select>
              )}

              {selectedShowSeats && (
                <>
                  <SeatGrid
                    showId={selectedShowId}
                    seats={selectedShowSeats}
                  />

                  <p style={{ marginTop: 12, color: "#aaa" }}>
                    Occupancy:{" "}
                    {Math.round(
                      (Object.values(selectedShowSeats)
                        .filter(s => s.status === "booked").length /
                        Object.keys(selectedShowSeats).length) * 100
                    )}%
                  </p>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
