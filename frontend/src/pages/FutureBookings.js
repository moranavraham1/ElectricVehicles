import React, { useEffect, useState } from "react";

function FutureBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/bookings`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookings(bookings.filter((booking) => booking._id !== id));
    } catch (error) {
      console.error("Error canceling booking:", error);
    }
  };

  return (
    <div>
      <h2>Future Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        bookings.map((booking, index) => (
          <div key={index}>
            <p>
              {booking.station} - {booking.date} at {booking.time}
            </p>
            <button onClick={() => handleCancelBooking(booking._id)}>Cancel</button>
          </div>
        ))
      )}
    </div>
  );
}

export default FutureBookings;
