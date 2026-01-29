import { useEffect, useState } from "react";
import {
  addCity,
  getCities,
  addArea,
  getAreasByCity
} from "../../firebase/firestore";
import "./Location.css";

function Location() {
  const [cityName, setCityName] = useState("");
  const [areaName, setAreaName] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    const data = await getCities();
    setCities(data);
  };

  const handleAddCity = async () => {
    if (!cityName) return;
    await addCity(cityName);
    setCityName("");
    loadCities();
  };

  const handleAddArea = async () => {
    if (!areaName || !selectedCity) return;
    await addArea(areaName, selectedCity);
    setAreaName("");
  };

  return (
    <div className="location-wrapper">
      <h2>Location Management</h2>

      <div className="box">
        <h3>Add City</h3>
        <input
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          placeholder="City name"
        />
        <button onClick={handleAddCity}>Add City</button>
      </div>

      <div className="box">
        <h3>Add Area</h3>
        <select onChange={(e) => setSelectedCity(e.target.value)}>
          <option value="">Select city</option>
          {cities.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input
          value={areaName}
          onChange={(e) => setAreaName(e.target.value)}
          placeholder="Area name"
        />
        <button onClick={handleAddArea}>Add Area</button>
      </div>
    </div>
  );
}

export default Location;
