    import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";
import { auth } from "../../firebase/auth";
import { db } from "../../firebase/firestore";
import "./Movie.css";

function MovieList() {
  const uid = auth.currentUser.uid;
  const [movies, setMovies] = useState([]);

  const loadMovies = async () => {
    const q = query(
      collection(db, "movies"),
      where("ownerId", "==", uid)
    );
    const snap = await getDocs(q);
    setMovies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const toggleStatus = async (id, status) => {
    await updateDoc(doc(db, "movies", id), {
      status: status === "active" ? "inactive" : "active"
    });
    loadMovies();
  };

  return (
    <div className="movie-list">
      <h3>Your Movies</h3>

      {movies.map(m => (
        <div key={m.id} className="movie-row">
          <img src={m.posterUrl} alt="" />
          <div>
            <b>{m.title}</b>
            <p>{m.language} · {m.duration} min</p>
          </div>

          <button onClick={() => toggleStatus(m.id, m.status)}>
            {m.status === "active" ? "Disable" : "Enable"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default MovieList;
