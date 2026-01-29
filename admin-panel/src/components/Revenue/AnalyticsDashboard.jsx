import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth } from "../../firebase/auth";
import { db } from "../../firebase/firestore";
import "./Analytics.css";

function AnalyticsDashboard() {
  const uid = auth.currentUser.uid;

  const [shows, setShows] = useState([]);
  const [movieRevenue, setMovieRevenue] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const loadAnalytics = async () => {
      const q = query(
        collection(db, "shows"),
        where("ownerId", "==", uid)
      );
      const snap = await getDocs(q);

      let revenueSum = 0;
      const movieAgg = {};

      const showData = snap.docs.map(d => {
        const data = d.data();
        const capacity = Object.keys(data.seats || {}).length;
        const booked = data.bookedSeatsCount || 0;

        const occupancy =
          capacity > 0 ? Math.round((booked / capacity) * 100) : 0;

        revenueSum += data.revenue || 0;

        if (data.movieId) {
          movieAgg[data.movieId] =
            (movieAgg[data.movieId] || 0) + (data.revenue || 0);
        }

        return {
          id: d.id,
          ...data,
          capacity,
          occupancy
        };
      });

      setShows(showData);
      setMovieRevenue(movieAgg);
      setTotalRevenue(revenueSum);
    };

    loadAnalytics();
  }, [uid]);

  const exportCSV = (rows, filename) => {
    const csv =
      Object.keys(rows[0]).join(",") +
      "\n" +
      rows.map(r => Object.values(r).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="analytics-wrapper">
      <h2>📊 Revenue & Occupancy</h2>

      <div className="analytics-cards">
        <div className="card">
          <h4>Total Revenue</h4>
          <p>₹ {totalRevenue}</p>
        </div>

        <div className="card">
          <h4>Total Shows</h4>
          <p>{shows.length}</p>
        </div>
      </div>

      <h3>Show-wise Performance</h3>

      <button
        onClick={() => exportCSV(shows, "shows-analytics.csv")}
        className="csv-btn"
      >
        Export Shows CSV
      </button>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Revenue</th>
            <th>Seats</th>
            <th>Capacity</th>
            <th>Occupancy</th>
          </tr>
        </thead>
        <tbody>
          {shows.map(s => (
            <tr key={s.id}>
              <td>{s.date}</td>
              <td>{s.startTime}</td>
              <td>₹ {s.revenue || 0}</td>
              <td>{s.bookedSeatsCount || 0}</td>
              <td>{s.capacity}</td>
              <td>{s.occupancy}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Movie-wise Revenue</h3>

      <button
        onClick={() =>
          exportCSV(
            Object.entries(movieRevenue).map(([k, v]) => ({
              movieId: k,
              revenue: v
            })),
            "movie-revenue.csv"
          )
        }
        className="csv-btn"
      >
        Export Movie Revenue CSV
      </button>

      <table>
        <thead>
          <tr>
            <th>Movie ID</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(movieRevenue).map(([movieId, rev]) => (
            <tr key={movieId}>
              <td>{movieId}</td>
              <td>₹ {rev}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AnalyticsDashboard;
