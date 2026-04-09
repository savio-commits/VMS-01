import React, { useState } from 'react';
import { useVms } from '../context/VmsContext';
import { Building2, Lock, Mail } from 'lucide-react';

export function Login() {
  const { state, dispatch } = useVms();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="glass-card p-8 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50 mx-auto mb-4">
            <Building2 className="w-6 h-6 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 text-sm">Sign in to your account to continue</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block w-full pl-10 bg-black/50 border border-white/10 rounded-lg py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full pl-10 bg-black/50 border border-white/10 rounded-lg py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-cyan-500 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors mt-6"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">Demo Accounts</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {state.users.slice(0, 4).map(u => (
              <div key={u.id} className="bg-white/5 p-2 rounded border border-white/10 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => { setEmail(u.email); setPassword('password'); }}>
                <div className="text-white font-medium truncate">{u.name}</div>
                <div className="text-gray-500 truncate">{u.email}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
