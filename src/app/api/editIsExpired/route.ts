import { db } from "@/src/server/db"
import { eq } from "drizzle-orm"
import { listings } from "@/src/server/db/schema"

export async function PATCH(req: Request) {
  try {
    const listingId = await req.json()

    console.log("listingId", listingId)

    const currentDate: Date = new Date()
    const expirationDate: Date = new Date(
      currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
    )
    const purgeDate: Date = new Date(
      currentDate.getTime() + 60 * 24 * 60 * 60 * 1000
    )

    const listing = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))

    if (listing[0].wasRenewed === true) {
      return new Response("Unable to renew listing for a second cycle.", {
        status: 400,
      })
    }

    const update = await db
      .update(listings)
      .set({
        isExpired: false,
        wasRenewed: true,
        updatedAt: currentDate,
        expirationDate: expirationDate,
        purgeDate: purgeDate,
      })
      .where(eq(listings.id, listingId))

    return new Response(JSON.stringify(update), {
      status: 200,
    })
  } catch (error) {
    console.error("Failed to update isExpired status:", error)
    return new Response("Failed to update isExpired status.", { status: 500 })
  }
}
