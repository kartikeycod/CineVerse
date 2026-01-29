import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import SeatDesigner from "./SeatDesigner";
import "./Screen.css";

function AddScreen({ theaterId }) {
  const [screenName, setScreenName] = useState("");
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(12);
  const [layout, setLayout] = useState([]);

  // 🔹 Generate theater-like layout
  const generateLayout = () => {
    const grid = [];

    for (let r = 0; r < rows; r++) {
      const row = [];

      for (let c = 0; c < cols; c++) {
        // Middle aisle
        if (c === Math.floor(cols / 2)) {
          row.push("X");
        }
        // Wheelchair seats (edges)
        else if (c === 0 || c === cols - 1) {
          row.push("W");
        }
        // Premium rows (last 30%)
        else if (r >= Math.floor(rows * 0.7)) {
          row.push("P");
        }
        // Regular
        else {
          row.push("R");
        }
      }

      grid.push(row);
    }

    setLayout(grid);
  };

  // 🔹 IMPORTANT: Convert 2D layout → Firestore-safe object
  const convertLayoutToSeatMap = (layout) => {
    const seatMap = {};
    let rowCharCode = 65; // 'A'

    layout.forEach((row) => {
      const rowLabel = String.fromCharCode(rowCharCode);
      let seatNumber = 1;

      row.forEach((seatType) => {
        if (seatType !== "X") {
          const seatId = `${rowLabel}${seatNumber}`;
          seatMap[seatId] = {
            type: seatType
          };
          seatNumber++;
        }
      });

      rowCharCode++;
    });

    return seatMap;
  };

  const saveScreen = async () => {
    if (!screenName || layout.length === 0) {
      alert("Screen name and layout are required");
      return;
    }

    try {
      const seatTemplate = convertLayoutToSeatMap(layout);

      await addDoc(collection(db, "screens"), {
        theaterId,
        name: screenName,
        seatTemplate, // ✅ Firestore-safe object
        rows,
        cols,
        createdAt: serverTimestamp()
      });

      alert("Screen saved successfully");
      setScreenName("");
      setLayout([]);
    } catch (err) {
      console.error(err);
      alert("Error saving screen");
    }
  };

  return (
    <div className="screen-wrapper">
      <h3>Add Screen</h3>

      <input
        placeholder="Screen Name"
        value={screenName}
        onChange={(e) => setScreenName(e.target.value)}
      />

      <div className="row">
        <input
          type="number"
          min={1}
          value={rows}
          onChange={(e) => setRows(+e.target.value)}
          placeholder="Rows"
        />
        <input
          type="number"
          min={1}
          value={cols}
          onChange={(e) => setCols(+e.target.value)}
          placeholder="Columns"
        />
        <button onClick={generateLayout}>Generate Layout</button>
      </div>

      {layout.length > 0 && (
        <>
          <SeatDesigner layout={layout} setLayout={setLayout} />

          <div className="legend">
            <span className="R">R = Regular</span>
            <span className="P">P = Premium</span>
            <span className="W">W = Wheelchair</span>
            <span className="X">X = Aisle</span>
          </div>

          <button onClick={saveScreen}>Save Screen</button>
        </>
      )}
    </div>
  );
}

export default AddScreen;
    