import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Redis from "ioredis";
import { authOptions } from "@/app/lib/auth";

// Create a redis client instance
// Note: In a real serverless env, we might want to handle connection reuse better,
// but for Next.js App Router, initializing at top level usually works or connecting per request.
// ioredis handles reconnection automatically.
const redisUrl = process.env.REDIS_URL;

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!redisUrl) {
        console.error("REDIS_URL is not defined");
        return NextResponse.json({}, { status: 200 });
    }

    const key = `user:${session.user.email}`;

    try {
        // Connect on demand if needed, or rely on global client
        const redis = new Redis(redisUrl);
        const dataStr = await redis.get(key);
        redis.quit(); // Close connection to prevent leaks in serverless functions if not reusing

        const data = dataStr ? JSON.parse(dataStr) : {};
        return NextResponse.json(data);
    } catch (error) {
        console.error("Redis Sync Fetch Failed:", error);
        return NextResponse.json({}, { status: 200 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!redisUrl) {
        return NextResponse.json({ error: "Database configuration missing" }, { status: 500 });
    }

    const key = `user:${session.user.email}`;
    const data = await request.json();

    try {
        const redis = new Redis(redisUrl);
        await redis.set(key, JSON.stringify(data));
        redis.quit();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Redis Sync Save Failed:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}
