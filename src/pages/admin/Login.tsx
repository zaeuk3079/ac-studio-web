import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 임시 비밀번호 설정 (실제 서비스 시 더 안전한 방식으로 변경 필요)
    if (password === 'acstudio123!') {
      localStorage.setItem('adminAuth', 'true');
      navigate(from, { replace: true });
    } else {
      setError('비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-md w-full"
      >
        <div className="flex justify-center mb-8">
          <div className="bg-burgundy-50 p-4 rounded-full">
            <Lock className="text-burgundy-800" size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-serif text-center text-stone-900 mb-2">Admin Login</h1>
        <p className="text-stone-500 text-center mb-8 text-sm">포트폴리오 관리를 위해 로그인해주세요.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
              placeholder="비밀번호를 입력하세요"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white py-3 rounded-lg font-medium transition-colors"
          >
            로그인
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← 메인 홈페이지로 돌아가기
          </button>
        </div>
      </motion.div>
    </div>
  );
}
