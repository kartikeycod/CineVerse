import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebase";
import {
  collection,
  getDoc,
  getDocs,
  doc,
  query,
  where
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./TheaterList.css";

const TheaterList = () => {
  const [city, setCity] = useState("");
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTheaters = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const userSnap = await getDoc(doc(db, "users", uid));
      const userCity = userSnap.data()?.profile?.city;

      if (!userCity) {
        alert("Please add your city in profile");
        navigate("/profile");
        return;
      }

      setCity(userCity);

      const snap = await getDocs(
        query(
          collection(db, "theaters"),
          where("city", "==", userCity),
          where("status", "==", "active")
        )
      );

      setTheaters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    loadTheaters();
  }, [navigate]);

  if (loading) return <p style={{ padding: "30px" }}>Loading theaters...</p>;

  return (
    <div className="theater-page">
      <h2>Theaters in {city}</h2>

      <div className="theater-row">
        {theaters.map(theater => (
          <div
            key={theater.id}
            className="theater-card"
            onClick={() =>
              navigate(`/theater/${theater.id}/movies`)
            }
          >
            <h3>{theater.name}</h3>
            <p>{theater.address}</p>
            <span>{theater.area}</span>
          </div>
        ))}
      </div>

      {theaters.length === 0 && (
        <p>No theaters found.</p>
      )}
    </div>
  );
};

export default TheaterList;
