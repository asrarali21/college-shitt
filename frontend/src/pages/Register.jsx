import { useState } from 'react';
import { register } from '../utils/api';
import { Link } from 'react-router-dom';

function Register({ onLogin }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        vehicleNumber: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await register(form);
            onLogin(res.data.user, res.data.token);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-logo">🅿️</div>
                    <h1>Smart Parking</h1>
                    <p>AI-Powered Urban Parking Management</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <h2>Create Account</h2>
                    {error && <div className="error-msg">{error}</div>}
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="Min 6 characters"
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="Phone number"
                            />
                        </div>
                        <div className="form-group">
                            <label>Vehicle Number</label>
                            <input
                                type="text"
                                value={form.vehicleNumber}
                                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                                placeholder="e.g., KA-01-AB-1234"
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                    <p className="auth-switch">
                        Already have an account? <Link to="/login">Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;
