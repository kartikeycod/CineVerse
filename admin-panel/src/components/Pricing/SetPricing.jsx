import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc
} from "firebase/firestore";
import { auth } from "../../firebase/auth";
import { db } from "../../firebase/firestore";
import "./Pricing.css";

function SetPricing() {
  const uid = auth.currentUser?.uid;

  // ─────────────────────────────
  // STATE
  // ─────────────────────────────
  const [theaters, setTheaters] = useState([]);
  const [shows, setShows] = useState([]);

  const [theaterId, setTheaterId] = useState("");
  const [showId, setShowId] = useState("");

  const [regular, setRegular] = useState("");
  const [premium, setPremium] = useState("");
  const [wheelchair, setWheelchair] = useState("");

  const [loading, setLoading] = useState(false);

  // ─────────────────────────────
  // LOAD THEATERS
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

    loadTheaters();
  }, [uid]);

  // ─────────────────────────────
  // LOAD SHOWS WHEN THEATER CHANGES
  // ─────────────────────────────
  useEffect(() => {
    if (!theaterId) {
      setShows([]);
      return;
    }

    const loadShows = async () => {
      const q = query(
        collection(db, "shows"),
        where("ownerId", "==", uid),
        where("theaterId", "==", theaterId),
        where("status", "==", "active")
      );
      const snap = await getDocs(q);
      setShows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    loadShows();
  }, [uid, theaterId]);

  // ─────────────────────────────
  // RESET DEPENDENT STATE
  // ─────────────────────────────
  useEffect(() => {
    setShowId("");
    setRegular("");
    setPremium("");
    setWheelchair("");
  }, [theaterId]);

  // ─────────────────────────────
  // SAVE PRICING
  // ─────────────────────────────
  const savePricing = async () => {
    if (!theaterId) {
      alert("Please select a theater");
      return;
    }
    if (!showId) {
      alert("Please select a show");
      return;
    }
    if (!regular || !premium || !wheelchair) {
      alert("Fill all pricing fields");
      return;
    }

    try {
      setLoading(true);

      await updateDoc(doc(db, "shows", showId), {
        pricing: {
          regular: Number(regular),
          premium: Number(premium),
          wheelchair: Number(wheelchair)
        }
      });

      alert("Pricing saved successfully");

      setShowId("");
      setRegular("");
      setPremium("");
      setWheelchair("");

    } catch (err) {
      console.error("Pricing error:", err);
      alert("Error saving pricing");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="pricing-card">
      <h3>Set Show Pricing</h3>

      {/* THEATER */}
      <select value={theaterId} onChange={e => setTheaterId(e.target.value)}>
        <option value="" disabled>Select Theater</option>
        {theaters.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      {/* SHOW */}
      <select
        value={showId}
        onChange={e => setShowId(e.target.value)}
        disabled={!theaterId}
      >
        <option value="" disabled>
          {theaterId ? "Select Show" : "Select Theater First"}
        </option>
        {shows.map(s => (
          <option key={s.id} value={s.id}>
            {s.date} • {s.startTime}
          </option>
        ))}
      </select>

      {/* PRICING */}
      <div className="price-grid">
        <input
          type="number"
          placeholder="Regular Seat Price"
          value={regular}
          onChange={e => setRegular(e.target.value)}
        />

        <input
          type="number"
          placeholder="Premium Seat Price"
          value={premium}
          onChange={e => setPremium(e.target.value)}
        />

        <input
          type="number"
          placeholder="Wheelchair Seat Price"
          value={wheelchair}
          onChange={e => setWheelchair(e.target.value)}
        />
      </div>

      <button
        className="primary-btn"
        onClick={savePricing}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Pricing"}
      </button>
    </div>
  );
}

export default SetPricing;
