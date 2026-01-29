import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import "./ShowList.css";

const ShowList = () => {
  const { theaterId, movieId } = useParams();
  const navigate = useNavigate();

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShows = async () => {
      const snap = await getDocs(
        query(
          collection(db, "shows"),
          where("theaterId", "==", theaterId),
          where("movieId", "==", movieId),
          where("status", "==", "active")
        )
      );

      setShows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    fetchShows();
  }, [theaterId, movieId]);

  if (loading) return <p style={{ padding: "30px" }}>Loading shows...</p>;

  return (
    <div className="show-page">
      <h2>Select Show Time</h2>

      <div className="show-grid">
        {shows.map(show => (
          <div
            key={show.id}
            className="show-card"
            onClick={() => navigate(`/seats/${show.id}`)}
          >
            <div className="show-time">{show.startTime}</div>
            <div className="show-date">{show.date}</div>
            <div className="show-meta">
              Duration: {show.movieDuration} mins
            </div>
          </div>
        ))}
      </div>

      {shows.length === 0 && (
        <p>No shows available.</p>
      )}
    </div>
  );
};

export default ShowList;
