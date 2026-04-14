import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/token/', { username, password });

            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            // Сохраняем ID пользователя
            const decoded = JSON.parse(atob(data.access.split('.')[1]));
            localStorage.setItem('user_id', decoded.user_id);

            window.location.href = '/';
        } catch (err: any) {
            setError('Неверный логин или пароль');
        }
    };
    
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-white text-center mb-8">ZdrasteChat</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Ник"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-800 text-white px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 text-white px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {error && <p className="text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold transition"
          >
            Войти
          </button>
        </form>
        <p className="text-center text-gray-400 mt-6">
          Нет аккаунта?{' '}
          <span onClick={() => navigate('/register')} className="text-blue-400 cursor-pointer hover:underline">
            Зарегистрироваться
          </span>
        </p>
      </div>
    </div>
  );
}