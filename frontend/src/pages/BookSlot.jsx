import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSlots, bookSlot, getAvailability } from '../utils/api';

function BookSlot({ user }) {
    const [slots, setSlots] = useState([]);
    const [availability, setAvailability] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [vehicleNumber, setVehicleNumber] = useState(user.vehicleNumber || '');
    const [bookingResult, setBookingResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState('');
    const [floorFilter, setFloorFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        loadSlots();
    }, []);

    const loadSlots = async () => {
        try {
            const [slotsRes, availRes] = await Promise.all([getSlots(), getAvailability()]);
            setSlots(slotsRes.data);
            setAvailability(availRes.data);
        } catch (err) {
            console.error('Error loading slots:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        if (!selectedSlot) return;
        setError('');
        setBooking(true);
        try {
            const res = await bookSlot({ slotId: selectedSlot._id, vehicleNumber });
            setBookingResult(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setBooking(false);
        }
    };

    const filteredSlots = floorFilter === 'all' ? slots : slots.filter(s => s.floor === floorFilter);

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner"></div><p>Loading Slots...</p></div>;
    }

    if (bookingResult) {
        return (
            <div className="booking-success-page">
                <div className="glass-card success-card">
                    <div className="success-icon">✅</div>
                    <h2>Booking Confirmed!</h2>
                    <div className="booking-details">
                        <div className="detail-row">
                            <span>Booking Code</span>
                            <strong className="booking-code">{bookingResult.booking.bookingCode}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Slot</span>
                            <strong>{bookingResult.booking.slot} (Floor {bookingResult.booking.floor})</strong>
                        </div>
                        <div className="detail-row">
                            <span>Pricing</span>
                            <strong>{bookingResult.booking.pricingMultiplier}x ({bookingResult.booking.pricingReason})</strong>
                        </div>
                    </div>
                    <div className="qr-section">
                        <h3>Your QR Code</h3>
                        <p>Show this at entry gate</p>
                        <img src={bookingResult.booking.qrCode} alt="QR Code" className="qr-image" />
                    </div>
                    <div className="success-actions">
                        <button onClick={() => navigate('/my-bookings')} className="btn btn-primary">View My Bookings</button>
                        <button onClick={() => { setBookingResult(null); setSelectedSlot(null); loadSlots(); }} className="btn btn-secondary">Book Another</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="book-slot-page">
            <div className="page-header">
                <h1>🅿️ Book a Parking Slot</h1>
                {availability && (
                    <div className="availability-info">
                        <span className="badge badge-green">{availability.available} Available</span>
                        <span className="badge badge-yellow">Online: {availability.onlineSlotsRemaining} remaining</span>
                    </div>
                )}
            </div>

            {error && <div className="error-msg">{error}</div>}

            {/* Floor Filter */}
            <div className="floor-filter">
                <button className={`filter-btn ${floorFilter === 'all' ? 'active' : ''}`} onClick={() => setFloorFilter('all')}>All Floors</button>
                <button className={`filter-btn ${floorFilter === 'A' ? 'active' : ''}`} onClick={() => setFloorFilter('A')}>Floor A</button>
                <button className={`filter-btn ${floorFilter === 'B' ? 'active' : ''}`} onClick={() => setFloorFilter('B')}>Floor B</button>
            </div>

            {/* Legend */}
            <div className="slot-legend">
                <span className="legend-item"><span className="legend-dot available"></span> Available</span>
                <span className="legend-item"><span className="legend-dot occupied"></span> Occupied</span>
                <span className="legend-item"><span className="legend-dot reserved"></span> Reserved</span>
                <span className="legend-item"><span className="legend-dot selected"></span> Selected</span>
            </div>

            {/* Slot Grid */}
            <div className="slot-grid">
                {filteredSlots.map((slot) => (
                    <button
                        key={slot._id}
                        className={`slot-btn 
              ${slot.isOccupied ? 'occupied' : ''} 
              ${slot.isReservedOnline ? 'reserved' : ''} 
              ${!slot.isOccupied && !slot.isReservedOnline ? 'available' : ''}
              ${selectedSlot?._id === slot._id ? 'selected' : ''}
              ${slot.type}`}
                        onClick={() => {
                            if (!slot.isOccupied && !slot.isReservedOnline) {
                                setSelectedSlot(slot);
                            }
                        }}
                        disabled={slot.isOccupied || slot.isReservedOnline}
                    >
                        <span className="slot-number">{slot.slotNumber}</span>
                        <span className="slot-type">{slot.type}</span>
                    </button>
                ))}
            </div>

            {/* Booking Form */}
            {selectedSlot && (
                <div className="booking-form glass-card">
                    <h3>Confirm Booking</h3>
                    <div className="detail-row">
                        <span>Slot:</span>
                        <strong>{selectedSlot.slotNumber} (Floor {selectedSlot.floor})</strong>
                    </div>
                    <div className="detail-row">
                        <span>Type:</span>
                        <strong>{selectedSlot.type}</strong>
                    </div>
                    <div className="form-group">
                        <label>Vehicle Number</label>
                        <input
                            type="text"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                            placeholder="e.g., KA-01-AB-1234"
                        />
                    </div>
                    <button onClick={handleBook} className="btn btn-primary" disabled={booking}>
                        {booking ? 'Booking...' : 'Confirm Booking'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default BookSlot;
