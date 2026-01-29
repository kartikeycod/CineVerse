import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import "./ScreenList.css";

const ScreenList = () => {
  const { theaterId } = useParams();
  const navigate = useNavigate();

  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScreens = async () => {
      const snap = await getDocs(
        query(
          collection(db, "screens"),
          where("theaterId", "==", theaterId)
        )
      );

      setScreens(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    fetchScreens();
  }, [theaterId]);

  if (loading) return <p style={{ padding: "30px" }}>Loading screens...</p>;

  return (
    <div className="screen-page">
      <h2 className="heading">Select Screen</h2>

      <div className="screen-grid">
        {screens.map(screen => (
          <div
            key={screen.id}
            className="screen-card"
            onClick={() =>
              navigate(`/shows/${theaterId}/${screen.id}`)
            }
          >
            <h3>{screen.name}</h3>
            <p>{screen.rows} Rows × {screen.cols} Columns</p>
            <span className="seat-count">
              {Object.keys(screen.seatTemplate || {}).length} Seats
            </span>
          </div>
        ))}
      </div>

      {screens.length === 0 && (
        <p>No screens found for this theater.</p>
      )}
    </div>
  );
};

export default ScreenList;
