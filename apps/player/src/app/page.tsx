"use client";

import { signIn, useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music, LogIn, LogOut, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { LoadingOverlay } from "@/components/LoadingOverlay";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: standardSchemaResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid username or password");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <LoadingOverlay size="lg" />
      </main>
    );
  }

  if (session) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-bg-card mb-6">
            <Music className="w-10 h-10 text-spotify-green" />
          </div>
          <h1 className="text-4xl font-bold font-title mb-4">Teleplay</h1>
          <p className="text-body-medium text-text-secondary mb-6">
            Welcome,{" "}
            <span className="text-text-base font-semibold">
              {session.user?.name}
            </span>
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/players")}>
              <Users className="w-4 h-4" />
              <span>View Players</span>
            </Button>
            <Button variant="outline" onClick={() => signOut()}>
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
          <p className="text-caption text-text-secondary mt-8">
            Browse all available players from the dashboard
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-bg-card mb-6">
            <Music className="w-10 h-10 text-spotify-green" />
          </div>
          <h1 className="text-3xl font-bold font-title">Teleplay</h1>
          <p className="text-body-medium text-text-secondary mt-2">
            Sign in to control the music
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Username"
              placeholder="Enter your username"
              {...register("username")}
              error={errors.username?.message}
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              {...register("password")}
              error={errors.password?.message}
            />

            {error && (
              <p className="text-body-medium text-text-negative">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? (
                <LoadingOverlay size="sm" className="flex-none" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-caption text-text-secondary mt-8">
          Teleplay - Telegram group music remote control
        </p>
      </div>
    </main>
  );
}
