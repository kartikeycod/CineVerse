import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const UserProfile = () => {
  const [profile, setProfile] = useState({
    state: "",
    city: "",
    address: "",
    lat: "",
    lng: ""
  });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const uid = auth.currentUser?.uid;

  // 1. Load Profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!uid) return;
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists() && snap.data().profile) {
        setProfile(snap.data().profile);
      }
      setLoading(false);
    };
    loadProfile();
  }, [uid]);

  // 2. Fetch Suggestions from Nominatim
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // 3. Select a suggestion
  const handleSelect = (item) => {
    const addr = item.address;
    setProfile({
      address: item.display_name,
      city: addr.city || addr.town || addr.village || "",
      state: addr.state || "",
      lat: item.lat,
      lng: item.lon,
    });
    setQuery(item.display_name); // Fill input with selection
    setSuggestions([]); // Hide suggestions
  };

  const saveProfile = async () => {
    if (!uid) return;
    await setDoc(doc(db, "users", uid), { profile }, { merge: true });
    alert("Profile updated!");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Location Details</h2>

        <div style={{ position: "relative", marginBottom: "20px" }}>
          <label style={styles.label}>Search Your Location</label>
          <input
            style={styles.input}
            placeholder="Start typing city or area..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          
          {/* Suggestion Dropdown */}
          {suggestions.length > 0 && (
            <ul style={styles.dropdown}>
              {suggestions.map((item, idx) => (
                <li 
                  key={idx} 
                  style={styles.suggestionItem} 
                  onClick={() => handleSelect(item)}
                >
                  {item.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>City</label>
            <input
              style={styles.input}
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>State</label>
            <input
              style={styles.input}
              value={profile.state}
              onChange={(e) => setProfile({ ...profile, state: e.target.value })}
            />
          </div>
        </div>

        <button onClick={saveProfile} style={styles.saveBtn}>Save Details</button>
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", justifyContent: "center", padding: "40px", backgroundColor: "#f0f2f5", minHeight: "100vh" },
  card: { background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "100%", maxWidth: "500px" },
  title: { textAlign: "center", marginBottom: "25px", color: "#1a73e8" },
  label: { display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold", color: "#555" },
  input: { width: "100%", padding: "12px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "6px", boxSizing: "border-box" },
  row: { display: "flex", gap: "10px" },
  dropdown: { 
    position: "absolute", top: "65px", left: 0, right: 0, 
    backgroundColor: "white", border: "1px solid #ccc", borderRadius: "6px",
    listStyle: "none", padding: 0, margin: 0, zIndex: 1000, boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
  },
  suggestionItem: { padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee", fontSize: "14px", hover: { backgroundColor: "#f0f0f0" } },
  saveBtn: { width: "100%", padding: "12px", backgroundColor: "#1a73e8", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }
};

export default UserProfile;