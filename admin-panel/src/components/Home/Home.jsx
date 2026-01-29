import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-wrapper">
      <div className="home-card">
        <h1 className="home-title">🎬 Movie Booking Platform</h1>
        <p className="home-subtitle">
          Admin Control Panel
        </p>

        <Link to="/login">
          <button className="home-btn">Go to Admin Login</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
