// ChargingQueue.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const ChargingQueue = () => {
    const { stationName, selectedDate } = useParams();
    const [queue, setQueue] = useState([]);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/bookings/queue/${stationName}/${selectedDate}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setQueue(response.data);
            } catch (err) {
                console.error("Failed to fetch queue:", err);
            }
        };
        console.log('Fetching queue for:', stationName, selectedDate);


        fetchQueue();
    }, [stationName, selectedDate]);

    return (
        <div style={{ padding: 20 }}>
            <h2>📋 Charging Queue for {stationName} - {selectedDate}</h2>
            {queue.length === 0 ? (
                <p>No bookings yet for this date.</p>
            ) : (
                queue.map((booking, index) => (
                    <div
                        key={index}
                        style={{
                            border: "1px solid gray",
                            padding: 10,
                            marginBottom: 10,
                            borderRadius: 5,
                        }}
                    >
                        <p><strong>⏰ Time:</strong> {booking.time}</p>
                        <p><strong>📧 User:</strong> {booking.user}</p>
                        <p><strong>🔺 Urgency:</strong> {booking.urgencyLevel}</p>
                        <p><strong>⏱️ Charge Time:</strong> {booking.estimatedChargeTime} minutes</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default ChargingQueue;