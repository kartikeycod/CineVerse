import { doc, runTransaction } from "firebase/firestore";
import { db } from "../../firebase/firestore";

export const updateRevenue = async ({
  showId,
  screenId,
  theaterId,
  ownerId,
  amount,
  seatsCount
}) => {
  const showRef = doc(db, "shows", showId);
  const screenRef = doc(db, "screens", screenId);
  const theaterRef = doc(db, "theaters", theaterId);
  const ownerRef = doc(db, "owners", ownerId);

  await runTransaction(db, async (tx) => {
    const showSnap = await tx.get(showRef);

    tx.update(showRef, {
      revenue: (showSnap.data().revenue || 0) + amount,
      bookedSeatsCount:
        (showSnap.data().bookedSeatsCount || 0) + seatsCount
    });

    tx.update(screenRef, {
      revenue: (showSnap.data().screenRevenue || 0) + amount
    });

    tx.update(theaterRef, {
      revenue: (showSnap.data().theaterRevenue || 0) + amount
    });

    tx.update(ownerRef, {
      revenue: (showSnap.data().ownerRevenue || 0) + amount
    });
  });
};
