import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AVATARS } from '../components/Avatar';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'join'
  const { login, register, joinHousehold } = useAuth();
  const navigate = useNavigate();

  // Login state
  const [loginName, setLoginName] = useState('');
  const [loginPin, setLoginPin] = useState('');

  // Register state
  const [householdName, setHouseholdName] = useState('');
  const [parentName, setParentName] = useState('');
  const [registerPin, setRegisterPin] = useState('');

  // Join state
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinPin, setJoinPin] = useState('');
  const [joinAvatar, setJoinAvatar] = useState('bear');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginName, loginPin);
      navigate('/lessons');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your name and PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(householdName, parentName, registerPin);
      navigate('/lessons');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await joinHousehold(joinCode, joinName, joinPin, joinAvatar);
      navigate('/lessons');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join household. Check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Logo / Title */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-kid-purple bg-clip-text text-transparent">
          Learning App
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Pick a lesson. Learn something new!</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 shadow-md">
        {[
          { key: 'login', label: '🔑 Log In' },
          { key: 'register', label: '🏠 New Family' },
          { key: 'join', label: '🎟️ Join' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setMode(key); setError(''); }}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200
              ${mode === key
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-100'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="w-full max-w-sm bg-red-50 text-red-600 rounded-2xl px-4 py-3 mb-4 text-center font-medium animate-slide-up">
          {error}
        </div>
      )}

      {/* Login Form */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="card w-full max-w-sm space-y-4 animate-slide-up">
          <h2 className="text-xl font-bold text-center text-gray-700">Welcome Back!</h2>
          <input
            type="text"
            placeholder="Your name"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            className="input-field"
            required
            autoFocus
          />
          <input
            type="password"
            placeholder="PIN"
            value={loginPin}
            onChange={(e) => setLoginPin(e.target.value)}
            className="input-field"
            inputMode="numeric"
            maxLength={6}
            required
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in...' : 'Let\'s Go! 🚀'}
          </button>
        </form>
      )}

      {/* Register Form */}
      {mode === 'register' && (
        <form onSubmit={handleRegister} className="card w-full max-w-sm space-y-4 animate-slide-up">
          <h2 className="text-xl font-bold text-center text-gray-700">Create Your Family</h2>
          <input
            type="text"
            placeholder="Family name (e.g. The Smiths)"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            className="input-field"
            required
            autoFocus
          />
          <input
            type="text"
            placeholder="Your name (parent)"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder="Choose a PIN"
            value={registerPin}
            onChange={(e) => setRegisterPin(e.target.value)}
            className="input-field"
            inputMode="numeric"
            maxLength={6}
            required
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating...' : 'Create Family 🏠'}
          </button>
        </form>
      )}

      {/* Join Form */}
      {mode === 'join' && (
        <form onSubmit={handleJoin} className="card w-full max-w-sm space-y-4 animate-slide-up">
          <h2 className="text-xl font-bold text-center text-gray-700">Join a Family</h2>
          <input
            type="text"
            placeholder="Family join code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="input-field text-center tracking-widest text-xl"
            maxLength={10}
            required
            autoFocus
          />
          <input
            type="text"
            placeholder="Your name"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder="Choose a PIN"
            value={joinPin}
            onChange={(e) => setJoinPin(e.target.value)}
            className="input-field"
            inputMode="numeric"
            maxLength={6}
            required
          />

          {/* Avatar Picker */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2 text-center">Pick your avatar:</p>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setJoinAvatar(a.id)}
                  className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all
                    ${joinAvatar === a.id
                      ? 'bg-primary-100 ring-2 ring-primary-500 scale-110'
                      : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                >
                  {a.emoji}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Joining...' : 'Join Family 🎟️'}
          </button>
        </form>
      )}
    </div>
  );
}
