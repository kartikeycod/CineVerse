import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firestore";

function ScreenList({ theaterId }) {
  const [screens, setScreens] = useState([]);

  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, "screens"),
        where("theaterId", "==", theaterId)
      );
      const snap = await getDocs(q);
      setScreens(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    load();
  }, [theaterId]);

  return (
    <div>
      <h4>Existing Screens</h4>
      {screens.map(s => (
        <div key={s.id}>🎬 {s.name}</div>
      ))}
    </div>
  );
}

export default ScreenList;
