import { useState } from 'react';
import { login } from '../utils/api';
import { Link } from 'react-router-dom';

function Login({ onLogin }) {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(form);
            onLogin(res.data.user, res.data.token);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
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
                    <h2>Welcome Back</h2>
                    {error && <div className="error-msg">{error}</div>}
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
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                    <p className="auth-switch">
                        Don't have an account? <Link to="/register">Register</Link>
                    </p>
                    <div className="demo-credentials">
                        <p><strong>Demo Accounts:</strong></p>
                        <p>User: user@parking.com / user123</p>
                        <p>Admin: admin@parking.com / admin123</p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
