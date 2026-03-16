'use server';

import { PrismaClient } from '@agentfoundry/db';
import { revalidatePath } from 'next/cache';

// Re-using the singleton pattern common in NextJs with Prisma
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function getLocalUsers() {
    try {
        return await prisma.user.findMany({
            orderBy: { createdAt: 'asc' }
        });
    } catch (e) {
        console.error('Failed to get local users:', e);
        return [];
    }
}

export async function getLocalTeams(userId: string) {
    try {
        const memberships = await prisma.membership.findMany({
            where: { userId },
            include: { team: true }
        });
        return memberships.map(m => m.team);
    } catch (e) {
        console.error('Failed to get local teams:', e);
        return [];
    }
}

export async function createLocalUser(email: string, name: string) {
    try {
        const user = await prisma.user.create({
            data: { email, name }
        });
        revalidatePath('/teams');
        return user;
    } catch (e) {
        console.error('Failed to create local user:', e);
        return null;
    }
}

export async function createLocalTeam(userId: string, name: string, slug: string) {
    try {
        const team = await prisma.team.create({
            data: {
                name,
                slug,
                memberships: {
                    create: {
                        userId,
                        role: 'OWNER'
                    }
                }
            }
        });
        revalidatePath('/teams');
        return team;
    } catch (e) {
        console.error('Failed to create local team:', e);
        return null;
    }
}
