import { useEffect, useState } from "react";
import { auth } from "../../firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import ScreenList from "./ScreenList";
import AddScreen from "./AddScreen";

function ScreenManager() {
  const [theaters, setTheaters] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, "theaters"),
        where("ownerId", "==", auth.currentUser.uid)
      );
      const snap = await getDocs(q);
      setTheaters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  return (
    <div>
      <h2>Screen & Seat Layout</h2>

      <select onChange={e => setSelected(e.target.value)}>
        <option value="">Select Theater</option>
        {theaters.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      {selected && (
        <>
          <ScreenList theaterId={selected} />
          <AddScreen theaterId={selected} />
        </>
      )}
    </div>
  );
}

export default ScreenManager;
