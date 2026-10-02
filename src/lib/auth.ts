import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifySiakadSsoToken } from "@/lib/siakad-auth";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/auth/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                ssoToken: { label: "SSO Token", type: "text" },
                isSso: { label: "Is SSO", type: "text" },
            },
            async authorize(credentials) {
                // Handle Single Sign-On (SSO) login
                if (credentials?.ssoToken) {
                    const verification = await verifySiakadSsoToken(credentials.ssoToken);
                    if (!verification.isValid || !verification.payload?.email) {
                        console.error("[NextAuth SSO] Token verification failed:", verification.error);
                        return null;
                    }

                    const payload = verification.payload;
                    const email = payload.email.toLowerCase().trim();
                    const name = payload.name || email.split("@")[0];
                    const rawRole = (payload.role || "STUDENT").toUpperCase();
                    const role = ["LECTURER", "ADMIN", "STUDENT"].includes(rawRole) ? rawRole : "STUDENT";
                    const nim = payload.nim || (role === "STUDENT" ? payload.nim_nidn : undefined);
                    const nidn = payload.nidn || (role === "LECTURER" ? payload.nim_nidn : undefined);
                    const deptName = payload.departmentName || payload.prodi;

                    let departmentId: string | undefined = undefined;
                    if (deptName) {
                        let dept = await prisma.department.findFirst({
                            where: { name: deptName }
                        });
                        if (!dept) {
                            dept = await prisma.department.create({
                                data: { name: deptName }
                            });
                        }
                        departmentId = dept.id;
                    }

                    let user = await prisma.user.findUnique({
                        where: { email }
                    });

                    if (!user) {
                        const randomPass = Math.random().toString(36).slice(-10) + Date.now().toString(36);
                        const hashedPassword = await bcrypt.hash(randomPass, 10);

                        user = await prisma.user.create({
                            data: {
                                email,
                                name,
                                password: hashedPassword,
                                role,
                                nim,
                                nidn,
                                siakadUserId: payload.siakadUserId || payload.sub || undefined,
                                phone: payload.phone || undefined,
                                departmentId,
                            }
                        });
                    } else {
                        // Update existing user with latest info from SIAKAD
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                name: name || user.name,
                                role: role || user.role,
                                nim: nim || user.nim,
                                nidn: nidn || user.nidn,
                                ...(departmentId ? { departmentId } : {}),
                            }
                        });
                    }

                    return {
                        id: user.id + "",
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                }

                // Standard email & password login
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email.toLowerCase().trim() }
                });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id + "",
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    debug: process.env.NODE_ENV === "development",
};
