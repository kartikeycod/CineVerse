//     import {
//   doc,
//   runTransaction,
//   serverTimestamp,
//   updateDoc
// } from "firebase/firestore";
// import { db } from "../../firebase/firestore";

import {
  doc,
  collection,
  runTransaction,
  serverTimestamp,updateDoc
} from "firebase/firestore";
import { db } from "../../firebase/firestore";

const LOCK_DURATION = 5 * 60 * 1000; // 5 minutes

export const lockSeat = async (showId, seatId, userId) => {
  const showRef = doc(db, "shows", showId);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(showRef);
    if (!snap.exists()) throw new Error("Show not found");

    const seat = snap.data().seats[seatId];
    if (!seat) throw new Error("Seat not found");

    // Already booked
    if (seat.status === "booked") {
      throw new Error("Seat already booked");
    }

    // Locked by someone else
    if (
      seat.status === "locked" &&
      seat.lockedBy !== userId &&
      Date.now() - seat.lockedAt.toMillis() < LOCK_DURATION
    ) {
      throw new Error("Seat locked by another user");
    }

    transaction.update(showRef, {
      [`seats.${seatId}`]: {
        ...seat,
        status: "locked",
        lockedBy: userId,
        lockedAt: serverTimestamp()
      }
    });
  });
};

export const unlockSeat = async (showId, seatId, userId) => {
  const showRef = doc(db, "shows", showId);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(showRef);
    if (!snap.exists()) return;

    const seat = snap.data().seats[seatId];
    if (!seat || seat.lockedBy !== userId) return;

    transaction.update(showRef, {
      [`seats.${seatId}`]: {
        ...seat,
        status: "available",
        lockedBy: null,
        lockedAt: null
      }
    });
  });
};

export const bookSeat = async (showId, seatId, userId) => {
  const showRef = doc(db, "shows", showId);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(showRef);
    if (!snap.exists()) throw new Error("Show not found");

    const seat = snap.data().seats[seatId];
    if (!seat || seat.lockedBy !== userId) {
      throw new Error("Seat not locked by you");
    }

    transaction.update(showRef, {
      [`seats.${seatId}`]: {
        ...seat,
        status: "booked",
        lockedBy: null,
        lockedAt: null,
        bookedAt: serverTimestamp()
      }
    });
  });
};
export const createBooking = async ({
  showId,
  theaterId,
  screenId,
  ownerId,
  movieId,
  seats,
  totalAmount
}) => {
  const bookingRef = doc(collection(db, "bookings"));

  await runTransaction(db, async (tx) => {
    tx.set(bookingRef, {
      showId,
      theaterId,
      screenId,
      ownerId,
      movieId,
      seats,
      totalAmount,
      createdAt: serverTimestamp()
    });
  });
};