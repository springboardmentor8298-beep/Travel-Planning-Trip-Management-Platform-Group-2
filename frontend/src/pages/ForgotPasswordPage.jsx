import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import FormField from '../components/common/FormField';
import Button from '../components/common/Button';
import { forgotPasswordSchema } from '../utils/validationSchemas';
import { authApi } from '../api/authApi';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values) => {
    await authApi.forgotPassword(values.email);
    setSent(true);
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Reset your password"
      subtitle="We'll email you a secure link to get back in."
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-voyage-50 px-4 py-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-voyage-500" />
          <p className="font-medium text-ink">Check your inbox</p>
          <p className="text-sm text-ink-soft">
            If that email is registered, a reset link is on its way.
          </p>
        </div>
      ) : (
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
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link to="/login" className="font-semibold text-voyage-500 hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthLayout>
  );
}
