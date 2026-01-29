import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { auth } from "../../firebase/auth";
import { db } from "../../firebase/firestore";
import "./Show.css";

function AddShow() {
  const uid = auth.currentUser?.uid;

  // ─────────────────────────────
  // STATE
  // ─────────────────────────────
  const [theaters, setTheaters] = useState([]);
  const [screens, setScreens] = useState([]);
  const [movies, setMovies] = useState([]);

  const [theaterId, setTheaterId] = useState("");
  const [screenId, setScreenId] = useState("");
  const [movieId, setMovieId] = useState("");

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const [loading, setLoading] = useState(false);

  // ─────────────────────────────
  // LOAD DATA
  // ─────────────────────────────
  useEffect(() => {
    if (!uid) return;

    const loadTheaters = async () => {
      const q = query(
        collection(db, "theaters"),
        where("ownerId", "==", uid),
        where("status", "==", "active")
      );
      const snap = await getDocs(q);
      setTheaters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const loadMovies = async () => {
      const q = query(
        collection(db, "movies"),
        where("ownerId", "==", uid),
        where("status", "==", "active")
      );
      const snap = await getDocs(q);
      setMovies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    loadTheaters();
    loadMovies();
  }, [uid]);

  useEffect(() => {
    if (!theaterId) {
      setScreens([]);
      return;
    }

    const loadScreens = async () => {
      const q = query(
        collection(db, "screens"),
        where("theaterId", "==", theaterId)
      );
      const snap = await getDocs(q);
      setScreens(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    loadScreens();
  }, [theaterId]);

  // ─────────────────────────────
  // HELPER — TIME OVERLAP CHECK
  // ─────────────────────────────
  const isOverlapping = (newStart, newEnd, existingShows) => {
    return existingShows.some(show => {
      const existingStart = new Date(`${show.date}T${show.startTime}`);
      const existingEnd = new Date(existingStart);
      existingEnd.setMinutes(
        existingEnd.getMinutes() + Number(show.movieDuration)
      );

      return newStart < existingEnd && newEnd > existingStart;
    });
  };

  // ─────────────────────────────
  // CREATE SHOW
  // ─────────────────────────────
  const createShow = async () => {
    if (!theaterId || !screenId || !movieId || !date || !startTime) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const selectedMovie = movies.find(m => m.id === movieId);
      const selectedScreen = screens.find(s => s.id === screenId);

      if (!selectedMovie || !selectedScreen) {
        alert("Invalid selection");
        return;
      }

      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(
        endDateTime.getMinutes() + selectedMovie.duration
      );

      // FETCH EXISTING SHOWS (SAME SCREEN + SAME DATE)
      const q = query(
        collection(db, "shows"),
        where("screenId", "==", screenId),
        where("date", "==", date),
        where("status", "in", ["active", "paused"])
      );

      const snap = await getDocs(q);
      const existingShows = snap.docs.map(d => d.data());

      if (isOverlapping(startDateTime, endDateTime, existingShows)) {
        alert("Show timing overlaps with an existing show on this screen.");
        return;
      }

      // CLONE SEAT TEMPLATE
      const seats = {};
      Object.keys(selectedScreen.seatTemplate).forEach(seatId => {
        seats[seatId] = {
          type: selectedScreen.seatTemplate[seatId].type,
          status: "available"
        };
      });

      await addDoc(collection(db, "shows"), {
        ownerId: uid,
        theaterId,
        screenId,
        movieId,

        movieDuration: selectedMovie.duration,

        date,
        startTime,

        seats,
        status: "active",

        createdAt: serverTimestamp()
      });

      alert("Show created successfully");

      // RESET
      setTheaterId("");
      setScreenId("");
      setMovieId("");
      setDate("");
      setStartTime("");

    } catch (error) {
      console.error("Create show error:", error);
      alert("Error creating show");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="show-card">
      <h3>Create New Show</h3>

      <div className="form-grid">
        <select value={theaterId} onChange={e => setTheaterId(e.target.value)}>
          <option value="">Select Theater</option>
          {theaters.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <select
          value={screenId}
          onChange={e => setScreenId(e.target.value)}
          disabled={!theaterId}
        >
          <option value="">Select Screen</option>
          {screens.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select value={movieId} onChange={e => setMovieId(e.target.value)}>
          <option value="">Select Movie</option>
          {movies.map(m => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <input
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
        />
      </div>

      <button
        className="primary-btn"
        onClick={createShow}
        disabled={loading}
      >
        {loading ? "Creating Show..." : "Create Show"}
      </button>
    </div>
  );
}

export default AddShow;
