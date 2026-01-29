import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import "./TheaterMovies.css";

const TheaterMovies = () => {
  const { theaterId } = useParams();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      const showSnap = await getDocs(
        query(
          collection(db, "shows"),
          where("theaterId", "==", theaterId),
          where("status", "==", "active")
        )
      );

      const movieIds = [
        ...new Set(showSnap.docs.map(d => d.data().movieId))
      ];

      if (movieIds.length === 0) {
        setMovies([]);
        setLoading(false);
        return;
      }

      const movieSnap = await getDocs(
        query(
          collection(db, "movies"),
          where("__name__", "in", movieIds),
          where("status", "==", "active")
        )
      );

      setMovies(movieSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    fetchMovies();
  }, [theaterId]);

  if (loading) return <p style={{ padding: "30px" }}>Loading movies...</p>;

  return (
    <div className="movie-page">
      <h2>Select Movie</h2>

      <div className="movie-grid">
        {movies.map(movie => (
          <div
            key={movie.id}
            className="movie-card"
            onClick={() =>
              navigate(`/theater/${theaterId}/movie/${movie.id}/shows`)
            }
          >
            <img src={movie.posterUrl} alt={movie.title} />
            <h4>{movie.title}</h4>
            <span>{movie.language} • {movie.genre}</span>
          </div>
        ))}
      </div>

      {movies.length === 0 && (
        <p>No movies running in this theater.</p>
      )}
    </div>
  );
};

export default TheaterMovies;
