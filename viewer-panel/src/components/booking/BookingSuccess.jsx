import { useParams, useNavigate } from "react-router-dom";

const BookingSuccess = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>🎉 Booking Confirmed!</h1>
      <p>Your booking ID:</p>
      <h3>{bookingId}</h3>

      <button
        style={{ marginTop: "20px" }}
        onClick={() => navigate("/")}
      >
        Back to Home
      </button>
    </div>
  );
};

export default BookingSuccess;
