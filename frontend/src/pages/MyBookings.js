// MyBookings.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/bookings`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setBookings(response.data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            }
        };

        fetchBookings();
    }, []);

    const getStatusColor = (status) => {
        if (status === 'approved') return 'green';
        if (status === 'rejected') return 'red';
        return 'orange'; // pending
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>📅 My Charging Bookings</h2>
            {bookings.length === 0 ? (
                <p>You don't have any bookings yet.</p>
            ) : (
                bookings.map((booking, index) => (
                    <div
                        key={index}
                        style={{
                            border: `2px solid ${getStatusColor(booking.status)}`,
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 10,
                            backgroundColor: '#f9f9f9',
                        }}
                    >
                        <p><strong>Station:</strong> {booking.station}</p>
                        <p><strong>Date:</strong> {booking.date}</p>
                        <p><strong>Time:</strong> {booking.time}</p>
                        <p><strong>Status:</strong> <span style={{ color: getStatusColor(booking.status), fontWeight: 'bold' }}>{booking.status}</span></p>
                    </div>

                ))
            )}
        </div>
    );
};

export default MyBookings;