import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { setTokens } from '../utils/tokenStorage';
import { authApi } from '../api/authApi';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Google sign-in did not return a token.');
      return;
    }

    setTokens(token, null);

    authApi
      .me()
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => setError('Could not complete sign-in. Please try again.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-4 text-center">
        <p className="font-medium text-ink">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="text-sm font-semibold text-voyage-500 hover:underline"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <Loader2 className="h-6 w-6 animate-spin text-voyage-500" />
    </div>
  );
}
