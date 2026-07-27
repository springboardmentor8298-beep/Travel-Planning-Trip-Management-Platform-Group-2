import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import FormField from '../components/common/FormField';
import Button from '../components/common/Button';
import { resetPasswordSchema } from '../utils/validationSchemas';
import { authApi } from '../api/authApi';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (values) => {
    setServerError('');
    if (!token) {
      setServerError('This reset link is missing its token. Please request a new one.');
      return;
    }
    try {
      await authApi.resetPassword({ token, newPassword: values.newPassword });
      toast.success('Password updated — please log in');
      navigate('/login', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'This link may have expired.');
    }
  };

  return (
    <AuthLayout eyebrow="Almost there" title="Set a new password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          label="New password"
          type="password"
          icon={Lock}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <FormField
          label="Confirm new password"
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
          Update password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link to="/login" className="font-semibold text-voyage-500 hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthLayout>
  );
}
