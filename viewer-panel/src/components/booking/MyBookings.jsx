import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", auth.currentUser.uid)
      );
      const snap = await getDocs(q);
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    fetchBookings();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h2>My Bookings</h2>

      {bookings.length === 0 && <p>No bookings found.</p>}

      {bookings.map(b => (
        <div key={b.id} style={styles.card}>
          <p><b>Seats:</b> {b.seats.join(", ")}</p>
          <p><b>Amount:</b> ₹{b.totalAmount}</p>
          <p><b>Status:</b> {b.status}</p>

          <button onClick={() => navigate(`/ticket/${b.id}`)}>
            View Ticket
          </button>
        </div>
      ))}
    </div>
  );
};

const styles = {
  card: {
    background: "#fff",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  }
};

export default MyBookings;
