import AddShow from "./AddShow";
import "./Show.css";

function ShowManager() {
  return (
    <div className="show-wrapper">
      <div className="show-header">
        <h2>Show Scheduling</h2>
        <p>Create shows by assigning movies to screens with time slots</p>
      </div>

      <AddShow />
    </div>
  );
}

export default ShowManager;
