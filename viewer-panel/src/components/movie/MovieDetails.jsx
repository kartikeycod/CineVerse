import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_KEY = "99dd49a654929d497b2f1e1773534ee8";
const IMG = "https://image.tmdb.org/t/p/w500";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        setMovie(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!movie) return <p>Movie not found</p>;

  return (
    <div style={{ padding: "40px" }}>
      <img
        src={`${IMG}${movie.poster_path}`}
        alt={movie.title}
        style={{ width: "250px", borderRadius: "10px" }}
      />

      <h1>{movie.title}</h1>
      <p><strong>Rating:</strong> ⭐ {movie.vote_average}</p>
      <p><strong>Duration:</strong> {movie.runtime} mins</p>
      <p><strong>Genres:</strong> {movie.genres?.map(g => g.name).join(", ")}</p>

      <h3>Overview</h3>
      <p>{movie.overview}</p>
    </div>
  );
};

export default MovieDetail;
