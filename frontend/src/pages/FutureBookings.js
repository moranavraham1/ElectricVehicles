import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FutureBookings() {
  const [bookings, setBookings] = useState([]);
  const [activeCharging, setActiveCharging] = useState(null);
  const [currentTime, setCurrentTime] = useState({ date: "", hour: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const hourStr = `${now.getHours()}:00`;
    setCurrentTime({ date: dateStr, hour: hourStr });
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchActiveCharging();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchActiveCharging = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setActiveCharging(data); // תחנה, שעה, תאריך
    } catch (error) {
      console.error("Error fetching active charging:", error);
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bookings.filter((booking) => booking._id !== id));
    } catch (error) {
      console.error("Error canceling booking:", error);
    }
  };

  const handleStartCharging = async (station, date, time) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/start-charging`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ station, date, time }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchActiveCharging();
        // ניווט לעמוד Charging.js עם מידע על התחנה
        navigate("/charging", { state: { station } });
      } else {
        alert(data.message || "Error starting charging");
      }
    } catch (err) {
      console.error(err);
      alert("Error starting charging");
    }
  };

  const handleStopCharging = async (station) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/stop-charging`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ station }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setActiveCharging(null);
      } else {
        alert(data.message || "Error stopping charging");
      }
    } catch (err) {
      console.error(err);
      alert("Error stopping charging");
    }
  };

  return (
    <div>
      <h2>Future Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        bookings.map((booking, index) => {
          const isNow =
            booking.date === currentTime.date && booking.time === currentTime.hour;
          const isActive =
            activeCharging &&
            activeCharging.station === booking.station &&
            activeCharging.date === booking.date &&
            activeCharging.time === booking.time;

          return (
            <div key={index} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
              <p>
                <strong>{booking.station}</strong> – {booking.date} at {booking.time}
              </p>

              {(() => {
                const now = new Date();
                const bookingTime = new Date(`${booking.date}T${booking.time}`);
                const diffMinutes = (now - bookingTime) / 60000;

                if (!isActive) {
                  if (diffMinutes >= -5 && diffMinutes <= 60) {
                    return (
                      <button onClick={() => handleStartCharging(booking.station, booking.date, booking.time)}>
                        ⚡ Start Charging
                      </button>
                    );
                  } else if (diffMinutes < -5) {
                    return (
                      <p style={{ color: "orange", fontWeight: "bold" }}>
                        ⚠️ The appointment has not started yet – charging is not allowed
                      </p>
                    );
                  } else {
                    return (
                      <p style={{ color: "red", fontWeight: "bold" }}>
                        ⚠️ The appointment has passed – charging cannot be started
                      </p>
                    );
                  }
                }

                return null;
              })()}

              {isActive && (
                <button onClick={() => handleStopCharging(booking.station)}>🛑 Stop Charging</button>
              )}

              {!isNow && !isActive && (
                <button onClick={() => handleCancelBooking(booking._id)}>❌ Cancel</button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default FutureBookings;
