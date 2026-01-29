import "./HomePage.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";

const API_KEY = "99dd49a654929d497b2f1e1773534ee8";
const IMG = "https://image.tmdb.org/t/p/w500";

const HomePage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);

  /* ================= AUTH ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
    });
    return () => unsub();
  }, []);

  /* ================= TRENDING MOVIES (UI ONLY) ================= */
  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.results || []);
        setLoadingMovies(false);
      })
      .catch(() => setLoadingMovies(false));
  }, []);

  /* ================= RECENT BOOKINGS ================= */
  useEffect(() => {
    const fetchRecentBookings = async () => {
      if (!user) {
        setRecentBookings([]);
        return;
      }

      const q = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(5)
      );

      const snap = await getDocs(q);

      const enriched = await Promise.all(
        snap.docs.map(async (d) => {
          const booking = { id: d.id, ...d.data() };
          const showSnap = await getDoc(doc(db, "shows", booking.showId));
          const theaterSnap = await getDoc(
            doc(db, "theaters", booking.theaterId)
          );

          return {
            ...booking,
            show: showSnap.data(),
            theater: theaterSnap.data()
          };
        })
      );

      setRecentBookings(enriched);
    };

    fetchRecentBookings();
  }, [user]);

  /* ================= BOOK TICKETS (FIXED ENTRY POINT) ================= */
  const handleBookTickets = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const userSnap = await getDoc(doc(db, "users", user.uid));
    const profile = userSnap.data()?.profile;

    if (!profile?.city) {
      alert("Please add your city to continue booking.");
      navigate("/profile");
      return;
    }

    // ✅ ENTER EXISTING BOOKING FLOW
    navigate(`/theaters?city=${profile.city}`);
  };

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/");
  };

  return (
    <div className="home">
      {/* ================= NAVBAR ================= */}
      <header className="navbar">
        <h2>🎬 MovieBook</h2>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-email">{user.email}</span>

              <button
                className="ghost"
                onClick={() => navigate("/profile")}
              >
                Add / Edit Details
              </button>

              <button
                className="primary"
                onClick={handleBookTickets}
              >
                Book Tickets
              </button>

              <button
                className="ghost"
                onClick={() => navigate("/my-bookings")}
              >
                My Bookings
              </button>

              <button
                className="ghost"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="ghost"
                onClick={() => navigate("/login")}
              >
                Login
              </button>

              <button
                className="primary"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="hero">
        <h1>Trending Movies</h1>
        <p>Book tickets with real-time seat updates</p>
      </section>

      {/* ================= MOVIES GRID ================= */}
      <section className="grid">
        {loadingMovies ? (
          <p>Loading movies...</p>
        ) : (
          movies.map((movie) => (
            <div
              className="card"
              key={movie.id}
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              {movie.poster_path ? (
                <img
                  src={`${IMG}${movie.poster_path}`}
                  alt={movie.title}
                />
              ) : (
                <div className="no-image">No Image</div>
              )}

              <div className="info">
                <h4>{movie.title}</h4>
                <span>
                  ⭐ {movie.vote_average?.toFixed(1) || "N/A"}
                </span>
              </div>
            </div>
          ))
        )}
      </section>

      {/* ================= RECENT BOOKINGS ================= */}
      {user && recentBookings.length > 0 && (
        <section className="recent-bookings">
          <h2>Recent Bookings</h2>

          {recentBookings.map((b) => {
            const showDateTime = new Date(
              `${b.show.date}T${b.show.startTime}`
            );

            const canCancel =
              b.status === "confirmed" &&
              new Date() < showDateTime;

            return (
              <div key={b.id} className="booking-card">
                <div>
                  <h4>{b.theater.name}</h4>
                  <p>Date: {b.show.date}</p>
                  <p>Time: {b.show.startTime}</p>
                  <p>Seats: {b.seats.join(", ")}</p>
                  <p>₹{b.totalAmount}</p>
                </div>

                <div>
                  {b.status === "cancelled" ? (
                    <span className="cancelled">CANCELLED ❌</span>
                  ) : (
                    <span className="confirmed">CONFIRMED ✅</span>
                  )}

                  <div className="booking-actions">
                    <button
                      onClick={() =>
                        navigate(`/ticket/${b.id}`)
                      }
                    >
                      View Ticket
                    </button>

                    {canCancel && (
                      <button
                        className="danger"
                        onClick={() =>
                          navigate(`/ticket/${b.id}`)
                        }
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default HomePage;
