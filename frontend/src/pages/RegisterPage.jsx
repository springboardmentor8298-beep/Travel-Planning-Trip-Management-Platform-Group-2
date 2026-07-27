import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import FormField from '../components/common/FormField';
import Button from '../components/common/Button';
import { registerSchema } from '../utils/validationSchemas';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password
      });
      toast.success('Account created — welcome to TripNest!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setServerError(message);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Plan itineraries, split budgets, and travel with your group."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          label="Full name"
          icon={User}
          placeholder="Jordan Rivera"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <FormField
          label="Confirm password"
          type="password"
          icon={Lock}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {serverError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {serverError}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-voyage-500 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
