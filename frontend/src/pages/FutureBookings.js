import React, { useEffect, useState } from "react";

function FutureBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/future-bookings`)
      .then((res) => res.json())
      .then(setBookings)
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Future Bookings</h2>
      {bookings.map((booking, index) => (
        <div key={index}>
          <p>{booking.station} - {booking.date} at {booking.time}</p>
          <button>Update</button>
          <button>Cancel</button>
        </div>
      ))}
    </div>
  );
}

export default FutureBookings;
