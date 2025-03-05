import React, { useEffect, useState } from "react";

function ChargeHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/charge-history`)
      .then((res) => res.json())
      .then(setHistory)
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Charge History</h2>
      <table>
        <thead>
          <tr>
            <th>Station</th>
            <th>Date</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {history.map((charge, index) => (
            <tr key={index}>
              <td>{charge.station}</td>
              <td>{charge.date}</td>
              <td>{charge.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ChargeHistory;
