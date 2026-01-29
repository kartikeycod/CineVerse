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
  const uid = auth.currentUser.uid;

  const [shows, setShows] = useState([]);
  const [showId, setShowId] = useState("");

  const [regular, setRegular] = useState("");
  const [premium, setPremium] = useState("");
  const [wheelchair, setWheelchair] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadShows = async () => {
      const q = query(
        collection(db, "shows"),
        where("ownerId", "==", uid),
        where("status", "==", "active")
      );
      const snap = await getDocs(q);
      setShows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    loadShows();
  }, [uid]);

  const savePricing = async () => {
    if (!showId || !regular || !premium || !wheelchair) {
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
      console.error(err);
      alert("Error saving pricing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pricing-card">
      <select value={showId} onChange={e => setShowId(e.target.value)}>
        <option value="">Select Show</option>
        {shows.map(s => (
          <option key={s.id} value={s.id}>
            {s.date} • {s.startTime}
          </option>
        ))}
      </select>

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

      <button className="primary-btn" onClick={savePricing} disabled={loading}>
        {loading ? "Saving..." : "Save Pricing"}
      </button>
    </div>
  );
}

export default SetPricing;
