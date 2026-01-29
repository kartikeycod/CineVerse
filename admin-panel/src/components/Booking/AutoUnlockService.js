import { doc, runTransaction } from "firebase/firestore";
import { db } from "../../firebase/firestore";

const LOCK_LIMIT = 5 * 60 * 1000;

export const autoUnlockSeats = async (showId) => {
  const showRef = doc(db, "shows", showId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(showRef);
    if (!snap.exists()) return;

    const seats = snap.data().seats || {};
    const now = Date.now();
    const updates = {};

    Object.entries(seats).forEach(([id, seat]) => {
      if (
        seat.status === "locked" &&
        seat.lockedAt &&
        now - seat.lockedAt.toMillis() > LOCK_LIMIT
      ) {
        updates[`seats.${id}`] = {
          ...seat,
          status: "available",
          lockedBy: null,
          lockedAt: null
        };
      }
    });

    if (Object.keys(updates).length > 0) {
      tx.update(showRef, updates);
    }
  });
};
