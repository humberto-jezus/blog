import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useI18n } from '../contexts/I18nContext';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';

export default function Login() {
  const { user, isAdmin, login, error } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useSeo({
    title: 'Login Administrativo | Humberto Jezus',
    description: 'Área restrita de administração do blog Humberto Jezus.',
    noindex: true,
  });

  if (user && isAdmin) {
    return <Navigate to="/admin" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(email, password);
    setIsSubmitting(false);
  };

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f8] px-4 font-sans">
        <h1 className="text-3xl font-normal text-[#242424] mb-4">{t('login.accessDenied')}</h1>
        <p className="text-[#505050] mb-8 text-center max-w-md">
          {t('login.noPrivileges')}
        </p>
        <button 
          onClick={() => navigate('/')}
          className="rounded bg-[#0067b8] px-6 py-2 text-sm font-semibold text-white hover:bg-[#005a9e] transition-colors shadow-sm"
        >
          {t('login.backHome')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f8] px-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 max-w-md w-full"
      >
        <h1 className="text-3xl font-normal text-[#242424] mb-2 text-center">{t('login.loginAdmin')}</h1>
        <p className="text-[#505050] mb-8 text-sm text-center">
          {t('login.loginDesc')}
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-[#242424] mb-1 uppercase tracking-wider">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-[#242424] shadow-sm focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8] sm:text-sm transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-[#242424] mb-1 uppercase tracking-wider">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-[#242424] shadow-sm focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8] sm:text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-[#0067b8] px-6 py-3 text-sm font-semibold text-white hover:bg-[#005a9e] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
