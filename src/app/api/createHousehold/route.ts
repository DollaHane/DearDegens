import { getAuthSession } from "@/src/lib/auth/auth-options"
import { validateHousehold } from "@/src/lib/validators/validateHousehold"
import { db } from "@/src/server/db"
import {
  listings,
  notifications,
  users,
  usersRelations,
} from "@/src/server/db/schema"
import { nanoid } from "nanoid"
import { z } from "zod"

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const authorId = session?.user.id

    const generateListingId = nanoid()
    const listingId = generateListingId

    const generateNotificationId = nanoid()
    const notificationId = generateNotificationId

    const currentDate: Date = new Date()
    const expirationDate: Date = new Date(
      currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
    )
    const purgeDate: Date = new Date(
      currentDate.getTime() + 60 * 24 * 60 * 60 * 1000
    )

    const {
      category,
      subCategory,
      price,
      title,
      brand,
      model,
      description,
      items,
      images,
      location,
      meetup,
    } = validateHousehold.parse(body)
    console.log(
      "data:",
      category,
      subCategory,
      price,
      title,
      brand,
      model,
      description,
      items,
      images,
      location,
      meetup
    )

    const post = await db.insert(listings).values({
      id: listingId,
      authorId: authorId,
      createdAt: currentDate,
      updatedAt: currentDate,
      expirationDate: expirationDate,
      purgeDate: purgeDate,
      category: category,
      subCategory: subCategory,
      price: price,
      title: title,
      brand: brand,
      model: model,
      description: description,
      items: JSON.stringify(items),
      images: images,
      location: location,
      meetup: meetup,
    })

    const notification = await db.insert(notifications).values({
      id: notificationId,
      userId: authorId,
      adId: listingId,
      createdAt: currentDate,
      title: `Listing ${title} is live!`,
      description: "Congratulations, your listing is live!",
      body: `Thank you for choosing PepperMint to place your ${brand} ${model} on the market. Your ad has been published to the our marketplace and we will be keeping you posted any new developements. Head over to "My Ads" to view or make any changes to your listing.`,
      isRead: false,
    })

    return new Response(JSON.stringify(post), { status: 200 })
  } catch (error) {
    console.error("error:", error)
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 })
    }
    return new Response(
      "Could not create a post at this time. Please try later",
      { status: 500 }
    )
  }
}
