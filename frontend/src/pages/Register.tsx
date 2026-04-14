import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/register/', { username, password });
      alert('Регистрация успешна! Теперь войдите.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.username?.[0] || 'Ошибка регистрации');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Регистрация</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* те же поля username и password */}
          <input type="text" placeholder="Ник" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-800 text-white px-5 py-4 rounded-2xl" required />
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-800 text-white px-5 py-4 rounded-2xl" required />
          {error && <p className="text-red-500 text-center">{error}</p>}
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-2xl font-semibold">Зарегистрироваться</button>
        </form>
        <p className="text-center text-gray-400 mt-6">
          Уже есть аккаунт? <span onClick={() => navigate('/login')} className="text-blue-400 cursor-pointer">Войти</span>
        </p>
      </div>
    </div>
  );
}