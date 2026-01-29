import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/ticket/${bookingId}`);
    }, 1800);

    return () => clearTimeout(timer);
  }, [bookingId, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={{ color: "green" }}>✔ Payment Successful</h1>
        <p>Your payment was processed successfully.</p>
        <p>Redirecting to your ticket...</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f6fa"
  },
  card: {
    padding: "40px",
    background: "white",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 6px 16px rgba(0,0,0,0.15)"
  }
};

export default PaymentSuccess;
