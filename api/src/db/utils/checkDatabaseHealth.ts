import { checkDbConnection, db } from "@/db/client.js";
import { timeout } from "@/utils/timeout.js";

let lastDbCheckTime = 0;
let isDbHealthy = true;
const CACHE_TTL_MS = 5000;

export async function checkDatabaseHealth(): Promise<boolean> {
    const now = Date.now();
    // Кэшируем статус для уменьшления нагрузки на БД
    if (now - lastDbCheckTime < CACHE_TTL_MS) {
        return isDbHealthy;
    }

    try {
        await timeout(checkDbConnection(), 2000);
        isDbHealthy = true;
    } catch (error) {
        isDbHealthy = false;
        console.error('Healthcheck DB Error:', error);
    }

    lastDbCheckTime = now;
    return isDbHealthy;
}