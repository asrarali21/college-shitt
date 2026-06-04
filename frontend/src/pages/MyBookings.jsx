import { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../utils/api';

function MyBookings({ user }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQR, setSelectedQR] = useState(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const res = await getMyBookings();
            setBookings(res.data);
        } catch (err) {
            console.error('Error loading bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await cancelBooking(id);
            loadBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Cancel failed');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'booked': return 'status-booked';
            case 'active': return 'status-active';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner"></div><p>Loading Bookings...</p></div>;
    }

    return (
        <div className="my-bookings-page">
            <div className="page-header">
                <h1>📋 My Bookings</h1>
                <p>{bookings.length} total bookings</p>
            </div>

            {bookings.length === 0 ? (
                <div className="empty-state glass-card">
                    <span className="empty-icon">🅿️</span>
                    <h3>No bookings yet</h3>
                    <p>Book your first parking slot to see it here!</p>
                </div>
            ) : (

            )}
        </div>
    );
}

export default MyBookings;
