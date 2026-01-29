import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  onSnapshot,
  runTransaction,
  collection,
  increment
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import "./SeatSelection.css";

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [seats, setSeats] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔴 REALTIME SEATS (READ ONLY)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "shows", showId), (snap) => {
      if (snap.exists()) {
        setSeats(snap.data().seats || {});
        setLoading(false);
      }
    });

    return () => unsub();
  }, [showId]);

  // 🪑 TOGGLE SEAT (UI ONLY)
  const toggleSeat = (seatId) => {
    const seat = seats[seatId];
    if (!seat || seat.status !== "available") return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  // 💳 DUMMY PAY → DIRECT BOOK
 const confirmPayment = async () => {
  if (!user || selectedSeats.length === 0) return;

  const ref = doc(db, "shows", showId);
  let bookingId = null;

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const show = snap.data();
    const updatedSeats = { ...show.seats };

    // ❌ Prevent double booking
    selectedSeats.forEach(seatId => {
      if (updatedSeats[seatId].status === "booked") {
        throw new Error("Seat already booked");
      }
    });

    // ✅ Mark booked
    selectedSeats.forEach(seatId => {
      updatedSeats[seatId] = {
        ...updatedSeats[seatId],
        status: "booked"
      };
    });

    // 💰 PRICE FROM DB (SOURCE OF TRUTH)
    const pricing = show.pricing;
    if (!pricing) throw new Error("Pricing not configured");

    let totalAmount = 0;
    selectedSeats.forEach(seatId => {
      const type = show.seats[seatId].type;
      if (type === "R") totalAmount += pricing.regular;
      else if (type === "P") totalAmount += pricing.premium;
      else if (type === "W") totalAmount += pricing.wheelchair;
    });

    // Update show
    tx.update(ref, {
      seats: updatedSeats,
      bookedSeatsCount: increment(selectedSeats.length),
      revenue: increment(totalAmount)
    });

    // Update theater
    tx.update(doc(db, "theaters", show.theaterId), {
      revenue: increment(totalAmount)
    });

    // Update owner
    tx.update(doc(db, "owners", show.ownerId), {
      revenue: increment(totalAmount)
    });

    // Create booking
    const bookingRef = doc(collection(db, "bookings"));
    tx.set(bookingRef, {
      showId,
      theaterId: show.theaterId,
      screenId: show.screenId,
      ownerId: show.ownerId,
      movieId: show.movieId,
      userId: user.uid,
      seats: selectedSeats,
      totalAmount,
      status: "confirmed",
      createdAt: new Date()
    });

    bookingId = bookingRef.id;
  });

  navigate(`/payment-success/${bookingId}`);
};
 if (loading) return <p style={{ padding: "30px" }}>Loading seats...</p>;

  return (
    <div className="seat-page">
      <h2>Select Seats</h2>

      <div className="seat-grid">
        {Object.entries(seats).map(([seatId, seat]) => {
          let cls = "seat";
          if (seat.status === "booked") cls += " booked";
          else if (selectedSeats.includes(seatId)) cls += " selected";

          return (
            <div
              key={seatId}
              className={cls}
              onClick={() => toggleSeat(seatId)}
            >
              {seatId}
            </div>
          );
        })}
      </div>

      <div className="actions">
        <button
          onClick={confirmPayment}
          disabled={selectedSeats.length === 0}
        >
          Dummy Pay
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;
