import type { Metadata } from "next";
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: "Регистрация — SOVA AI",
};

export default function SignupPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Регистрация</h1>
        <p className="text-sm text-muted-foreground mt-1">Создайте аккаунт SOVA AI</p>
      </div>
      <div className="bg-white dark:bg-black rounded-lg border p-6 shadow-sm">
        <SignupForm />
      </div>
    </div>
  );
}
