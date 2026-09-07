import type { Metadata } from "next";
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: "Вход — SOVA AI",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-premium-lg">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Sova AI</h1>
          <p className="text-lg text-gray-600">Войдите в свой аккаунт</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-premium-lg p-8">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Нет аккаунта?{' '}
          <a href="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Зарегистрироваться
          </a>
        </p>
      </div>
    </div>
  );
}