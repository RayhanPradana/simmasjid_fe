"use client";
import { useAuth } from "@/context/auth-context";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) return <p>Silakan login dulu.</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Selamat datang, {user.name}!</h1>
      <p className="mb-4">Email: {user.email}</p>
      <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded">
        Logout
      </button>
    </div>
  );
}
