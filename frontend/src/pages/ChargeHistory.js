import React, { useEffect, useState } from "react";

function ChargeHistory() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [stationFilter, setStationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/charge-history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch charging history.");
        }

        const data = await response.json();
        setHistory(data);
        setFilteredHistory(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Unable to display the charging history at the moment. Please try again later.");
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    let filtered = history;

    if (stationFilter.trim()) {
      filtered = filtered.filter((charge) =>
        charge.station.toLowerCase().includes(stationFilter.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter((charge) => charge.date === dateFilter);
    }

    setFilteredHistory(filtered);
  }, [stationFilter, dateFilter, history]);

  if (loading) {
    return <p>Loading charge history...</p>;
  }

  if (error) {
    return <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>;
  }

  return (
    <div>
      <h2>Charge History</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Filter by Station:
          <input
            type="text"
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            style={{ marginLeft: "8px", marginRight: "20px" }}
          />
        </label>

        <label>
          Filter by Date:
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ marginLeft: "8px" }}
          />
        </label>
      </div>

      {filteredHistory.length === 0 ? (
        <p>No charging history found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Station</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Date</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((charge, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{charge.station}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{charge.date}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{charge.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ChargeHistory;
