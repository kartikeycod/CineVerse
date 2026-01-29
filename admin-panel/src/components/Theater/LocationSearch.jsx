import { useState } from "react";

function LocationSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const search = async (q) => {
    setQuery(q);
    if (q.length < 3) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5`
    );
    const data = await res.json();
    setResults(data);
  };

  return (
    <div>
      <input
        placeholder="Search city / area"
        value={query}
        onChange={(e) => search(e.target.value)}
      />

      <ul>
        {results.map((r) => (
          <li
            key={r.place_id}
            onClick={() =>
              onSelect({
                city: r.display_name.split(",")[0],
                area: r.display_name,
                lat: r.lat,
                lng: r.lon
              })
            }
          >
            {r.display_name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LocationSearch;
