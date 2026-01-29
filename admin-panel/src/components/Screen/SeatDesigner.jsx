import "./Screen.css";

const cycle = ["R", "P", "W", "X"]; 
// Regular → Premium → Wheelchair → Aisle → Regular

function SeatDesigner({ layout, setLayout }) {
  const toggleSeat = (r, c) => {
    setLayout(prev =>
      prev.map((row, ri) =>
        row.map((seat, ci) => {
          if (ri === r && ci === c) {
            const idx = cycle.indexOf(seat);
            return cycle[(idx + 1) % cycle.length];
          }
          return seat;
        })
      )
    );
  };

  return (
    <div className="seat-grid">
      {layout.map((row, r) =>
        row.map((seat, c) => (
          <div
            key={`${r}-${c}`}
            className={`seat ${seat}`}
            onClick={() => seat !== "X" && toggleSeat(r, c)}
          >
            {seat !== "X" ? seat : ""}
          </div>
        ))
      )}
    </div>
  );
}

export default SeatDesigner;
