import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  runTransaction
} from "firebase/firestore";
import jsPDF from "jspdf";
import { db } from "../../firebase/firebase";

const TicketView = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [show, setShow] = useState(null);
  const [theater, setTheater] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Load booking + show + theater
  useEffect(() => {
    const loadData = async () => {
      try {
        const bookingSnap = await getDoc(doc(db, "bookings", bookingId));
        if (!bookingSnap.exists()) return;

        const bookingData = bookingSnap.data();
        setBooking(bookingData);

        const showSnap = await getDoc(doc(db, "shows", bookingData.showId));
        const showData = showSnap.data();
        setShow(showData);

        const theaterSnap = await getDoc(
          doc(db, "theaters", bookingData.theaterId)
        );
        setTheater(theaterSnap.data());

        setLoading(false);
      } catch (err) {
        console.error("Ticket load error:", err);
      }
    };

    loadData();
  }, [bookingId]);

  // ⏱ Can cancel only before show time
  const canCancel =
    show &&
    booking &&
    booking.status === "confirmed" &&
    new Date() < new Date(`${show.date}T${show.startTime}`);

  // ❌ CANCEL TICKET
  const cancelTicket = async () => {
    if (!canCancel) return;

    try {
      await runTransaction(db, async (tx) => {
        const bookingRef = doc(db, "bookings", bookingId);
        const showRef = doc(db, "shows", booking.showId);
        const theaterRef = doc(db, "theaters", booking.theaterId);
        const ownerRef = doc(db, "owners", booking.ownerId);

        const showSnap = await tx.get(showRef);
        const showData = showSnap.data();

        const updatedSeats = { ...showData.seats };

        booking.seats.forEach((seatId) => {
          updatedSeats[seatId].status = "available";
        });

        // Update show
        tx.update(showRef, {
          seats: updatedSeats,
          bookedSeatsCount:
            showData.bookedSeatsCount - booking.seats.length,
          revenue: showData.revenue - booking.totalAmount
        });

        // Update theater + owner revenue
        tx.update(theaterRef, {
          revenue: showData.revenue - booking.totalAmount
        });

        tx.update(ownerRef, {
          revenue: showData.revenue - booking.totalAmount
        });

        // Update booking
        tx.update(bookingRef, {
          status: "cancelled",
          cancelledAt: new Date()
        });
      });

      alert("Ticket cancelled. Dummy refund processed.");
      navigate("/my-bookings");
    } catch (err) {
      console.error("Cancel failed:", err);
      alert("Unable to cancel ticket");
    }
  };

  // 📄 DOWNLOAD PDF
  const downloadPDF = () => {
    const pdf = new jsPDF();

    pdf.text("🎬 MovieBook Ticket", 20, 20);
    pdf.text(`Booking ID: ${bookingId}`, 20, 35);
    pdf.text(`Theater: ${theater.name}`, 20, 45);
    pdf.text(`City: ${theater.city}`, 20, 55);
    pdf.text(`Date: ${show.date}`, 20, 65);
    pdf.text(`Time: ${show.startTime}`, 20, 75);
    pdf.text(`Seats: ${booking.seats.join(", ")}`, 20, 85);
    pdf.text(`Amount Paid: ₹${booking.totalAmount}`, 20, 95);
    pdf.text(`Status: ${booking.status.toUpperCase()}`, 20, 105);

    pdf.save(`ticket_${bookingId}.pdf`);
  };

  if (loading) return <p style={{ padding: "30px" }}>Loading ticket...</p>;
  if (!booking || !show || !theater)
    return <p>Ticket not found</p>;

  return (
    <div style={styles.container}>
      <div style={styles.ticket}>
        <h2>🎟 Movie Ticket</h2>

        <p><b>Theater:</b> {theater.name}</p>
        <p><b>City:</b> {theater.city}</p>
        <p><b>Date:</b> {show.date}</p>
        <p><b>Time:</b> {show.startTime}</p>
        <p><b>Seats:</b> {booking.seats.join(", ")}</p>
        <p><b>Amount:</b> ₹{booking.totalAmount}</p>
        <p>
          <b>Status:</b>{" "}
          {booking.status === "confirmed" ? "CONFIRMED ✅" : "CANCELLED ❌"}
        </p>

        <div style={styles.actions}>
          <button onClick={downloadPDF}>Download PDF</button>

          {canCancel && (
            <button
              onClick={cancelTicket}
              style={{ background: "#e53935", color: "white" }}
            >
              Cancel Ticket
            </button>
          )}

          <button onClick={() => navigate("/")}>Go Home</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    display: "flex",
    justifyContent: "center"
  },
  ticket: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "360px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.15)"
  },
  actions: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  }
};

export default TicketView;
