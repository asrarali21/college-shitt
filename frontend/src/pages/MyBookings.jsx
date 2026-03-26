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
                <div className="bookings-list">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="booking-card glass-card">
                            <div className="booking-card-header">
                                <span className="booking-code-display">{booking.bookingCode}</span>
                                <span className={`status-badge ${getStatusColor(booking.status)}`}>
                                    {booking.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="booking-card-body">
                                <div className="booking-info-grid">
                                    <div className="info-item">
                                        <span className="label">Slot</span>
                                        <span className="value">{booking.slot?.slotNumber || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Floor</span>
                                        <span className="value">{booking.slot?.floor || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Vehicle</span>
                                        <span className="value">{booking.vehicleNumber || 'N/A'}</span>
                                    </div>
                                    {booking.entryTime && (
                                        <div className="info-item">
                                            <span className="label">Entry</span>
                                            <span className="value">{new Date(booking.entryTime).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {booking.exitTime && (
                                        <div className="info-item">
                                            <span className="label">Exit</span>
                                            <span className="value">{new Date(booking.exitTime).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {booking.totalFee > 0 && (
                                        <div className="info-item">
                                            <span className="label">Fee</span>
                                            <span className="value fee">₹{booking.totalFee}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="booking-card-actions">
                                {booking.qrCode && (
                                    <button className="btn btn-sm btn-secondary" onClick={() => setSelectedQR(selectedQR === booking._id ? null : booking._id)}>
                                        {selectedQR === booking._id ? 'Hide QR' : 'Show QR'}
                                    </button>
                                )}
                                {booking.status === 'booked' && (
                                    <button className="btn btn-sm btn-danger" onClick={() => handleCancel(booking._id)}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                            {selectedQR === booking._id && booking.qrCode && (
                                <div className="qr-popup">
                                    <img src={booking.qrCode} alt="QR Code" className="qr-image" />
                                    <p className="qr-hint">Show this QR code at the entry gate</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyBookings;
