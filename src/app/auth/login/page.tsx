"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Atom } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
                setIsLoading(false);
            } else {
                // Successful login
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred");
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black p-4">
            <Card className="w-full max-w-md border-0 shadow-lg sm:border sm:border-gray-200 dark:border-gray-800">
                <CardContent className="pt-10 pb-8 px-8">
                    <div className="flex flex-col items-center space-y-4 mb-8">
                        <div className="p-3 rounded-full bg-primary/10">
                            <Atom className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-center space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
                            <p className="text-sm text-muted-foreground">
                                Login to access your Virtual Labs
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                (Try: admin@test.com / password123)
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                placeholder="Ex: student@wirabhakti.ac.id"
                                required
                                type="email"
                                autoComplete="email"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                required
                                type="password"
                                autoComplete="current-password"
                                placeholder="Password"
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 font-medium text-center bg-red-50 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Signing In..." : "Sign In"}
                        </Button>

                        <div className="text-center text-sm">
                            <button type="button" className="text-muted-foreground hover:text-primary underline">
                                Forgot password?
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
