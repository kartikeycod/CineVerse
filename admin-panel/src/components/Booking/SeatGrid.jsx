import "./Booking.css";
import { lockSeat, unlockSeat } from "./BookingService";
import { auth } from "../../firebase/auth";

function SeatGrid({ showId, seats }) {
  const uid = auth.currentUser.uid;

  const handleClick = async (seatId, seat) => {
    try {
      if (seat.status === "available") {
        await lockSeat(showId, seatId, uid);
      } else if (seat.status === "locked" && seat.lockedBy === uid) {
        await unlockSeat(showId, seatId, uid);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="seat-grid">
      {Object.entries(seats).map(([seatId, seat]) => (
        <div
          key={seatId}
          className={`seat ${seat.status} ${seat.type}`}
          onClick={() => handleClick(seatId, seat)}
        >
          {seatId}
        </div>
      ))}
    </div>
  );
}

export default SeatGrid;
