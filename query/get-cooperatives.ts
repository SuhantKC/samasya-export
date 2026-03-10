"use server";
import { db } from "@/lib/db";

export async function getCooperatives() {
    const cooperatives = await db.cooperatives_cooperative.findMany({
        orderBy: {
            name: 'asc'
        }
    });

    return cooperatives;
}
