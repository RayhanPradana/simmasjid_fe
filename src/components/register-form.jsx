"use client";

import { useState } from "react";
import Image from "next/image"; // Jika tidak pakai Next.js, ganti dengan <img>
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export function RegisterForm({
  className,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                {/* LOGO */}
                <Image
                  src="/image/logo.png"
                  alt="Logo SimMasjid"
                  width={80}
                  height={80}
                  className="mb-2"
                />

                <h1 className="text-2xl font-bold">Buat Akun Anda</h1>
                <p className="text-muted-foreground text-balance">
                  Daftar untuk akun baru SimMasjid
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" type="text" placeholder="Nama Lengkap" required />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@contoh.com" required />
              </div>
              <div className="grid gap-3 relative">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="grid gap-3 relative">
                <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Daftar
              </Button>
              <div className="text-center text-sm">
                Sudah Punya Akun?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            </div>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src="/image/img4.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
