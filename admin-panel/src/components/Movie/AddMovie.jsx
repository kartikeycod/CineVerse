import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth } from "../../firebase/auth";
import { db } from "../../firebase/firestore";
import "./Movie.css";

function AddMovie() {
  const user = auth.currentUser;

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [duration, setDuration] = useState("");
  const [genre, setGenre] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const saveMovie = async () => {
    if (!user) {
      alert("Not authenticated");
      return;
    }

    if (!title || !language || !duration || !posterUrl) {
      alert("Fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "movies"), {
        title,
        language,
        duration: Number(duration),
        genre,
        posterUrl,
        status: "active",
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });

      alert("Movie added successfully");

      setTitle("");
      setLanguage("");
      setDuration("");
      setGenre("");
      setPosterUrl("");
    } catch (err) {
      console.error(err);
      alert("Error saving movie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="movie-card">
      <h3>Add Movie</h3>

      <input
        placeholder="Movie Title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="Language *"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      />

      <input
        type="number"
        placeholder="Duration (minutes) *"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      <input
        placeholder="Genre"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
      />

      <input
        placeholder="Poster Image URL *"
        value={posterUrl}
        onChange={(e) => setPosterUrl(e.target.value)}
      />

      {posterUrl && (
        <img
          src={posterUrl}
          alt="Poster preview"
          style={{ width: "120px", marginTop: "10px" }}
        />
      )}

      <button onClick={saveMovie} disabled={loading}>
        {loading ? "Saving..." : "Save Movie"}
      </button>
    </div>
  );
}

export default AddMovie;
