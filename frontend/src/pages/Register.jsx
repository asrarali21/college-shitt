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

    
        </div>
    );
}

export default Register;
