import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import FormField from '../components/common/FormField';
import Button from '../components/common/Button';
import { loginSchema } from '../utils/validationSchemas';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await login(values);
      toast.success('Welcome back!');
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password';
      setServerError(message);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to TripNest"
      subtitle="Pick up your itineraries right where you left off."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormField
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-voyage-500 hover:underline">
            Forgot password?
          </Link>
        </div>

        {serverError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {serverError}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Log in
        </Button>

        <a
          href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || ''}/oauth2/authorization/google`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-voyage-100 py-2.5 text-sm font-semibold text-ink hover:border-voyage-300"
        >
          Continue with Google
        </a>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        New to TripNest?{' '}
        <Link to="/register" className="font-semibold text-voyage-500 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
