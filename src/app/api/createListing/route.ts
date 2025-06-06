import { getAuthSession } from "@/src/lib/auth/auth-options"
import { validateListing } from "@/src/lib/validators/validateListingGeneral"
import { db } from "@/src/server/db"
import { listings, notifications, users } from "@/src/server/db/schema"
import { products } from "@/src/lib/categories/Products"
import { ulid } from "ulid"
import { z } from "zod"
import { sql, eq } from "drizzle-orm"
import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "@/src/server/upstash"
import { headers } from "next/headers"
import { ListingCreatedTemplate } from "@/src/components/emailTemplates/ListingCreatedTemplate"
import { Nodemail } from "@/src/server/mail/mail"
import { render } from "@react-email/components"

const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "30 s"),
  analytics: true,
})

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()
    const ip = headers().get("x-forwarded-for")
    const {
      remaining,
      limit,
      success: limitReached,
    } = await rateLimit.limit(ip!)
    console.log("Rate Limit Stats:", remaining, limit, limitReached)

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session?.user.id))
    const userListings = await db
      .select()
      .from(listings)
      .where(eq(listings.authorId, user[0].id))

    // USER HAS FREE SUB:
    if (
      user[0].subscription === products[0].id &&
      userListings.length >= products[0].ads
    ) {
      return new Response("User has reached ad creation limit.", {
        status: 409,
      })
    }

    // USER HAS ONCE OFF SUB:
    if (
      user[0].subscription === products[1].id &&
      userListings.length >= user[0].maxAds!
    ) {
      return new Response("User has reached ad creation limit.", {
        status: 409,
      })
    }

    // USER HAS PRO SUB:
    if (
      user[0].subscription === products[2].id &&
      userListings.length >= products[2].ads
    ) {
      return new Response("User has reached ad creation limit.", {
        status: 409,
      })
    }

    // USER HAS BIZ SUB:
    if (
      user[0].subscription === products[3].id &&
      userListings.length >= products[3].ads
    ) {
      return new Response("User has reached ad creation limit.", {
        status: 409,
      })
    }

    const body = await req.json()

    const authorId = session?.user.id
    const listingId = `list-${ulid()}`

    const generateNotificationId = `listNot-${ulid()}`
    const notificationId = generateNotificationId

    const currentDate: Date = new Date()
    const expirationDate: Date = new Date(
      currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
    )
    const purgeDate: Date = new Date(
      currentDate.getTime() + 60 * 24 * 60 * 60 * 1000
    )

    const {
      tab,
      category,
      subCategory,
      price,
      condition,
      title,
      brand,
      model,
      mileage,
      year,
      transmission,
      fuel,
      description,
      items,
      images,
      location,
      meetup,
      displayContact,
    } = validateListing.parse(body)
    console.log(
      "data:",
      tab,
      category,
      subCategory,
      price,
      condition,
      title,
      brand,
      model,
      description,
      fuel,
      items,
      images,
      location,
      meetup,
      displayContact
    )

    const listingTitle = title.replace(/ /g, "-")
    const listingBrand = brand.replace(/ /g, "-")
    const listingModel = model.replace(/ /g, "-")
    const listingSubcategory = subCategory.replace(/ /g, "-")
    const listingLocation = location.replace(/ /g, "-")

    const url: string = `/${listingTitle}/${listingBrand}/${listingModel}/${listingSubcategory}/${listingLocation}/${listingId}`

    if (!limitReached) {
      return new Response("API request limit reached", { status: 429 })
    } else {
      const post = await db.insert(listings).values({
        id: listingId,
        url: url,
        authorId: authorId,
        createdAt: currentDate,
        updatedAt: currentDate,
        expirationDate: expirationDate,
        purgeDate: purgeDate,
        tab: tab,
        category: category,
        subCategory: subCategory,
        price: parseInt(price),
        condition: condition,
        title: title,
        brand: brand,
        model: model,
        mileage: parseInt(mileage),
        year: parseInt(year),
        transmission: transmission,
        fuel: fuel,
        description: description,
        items: JSON.stringify(items),
        images: images,
        location: location,
        meetup: meetup,
        displayContact: displayContact,
      })

      await db.execute(
        sql.raw(
          `
        UPDATE listings 
        SET tsvector_title = to_tsvector(title)
        WHERE id = '${listingId}';
        `
        )
      )

      await db.execute(
        sql.raw(
          `
        UPDATE listings 
        SET tsvector_brand = to_tsvector(brand)
        WHERE id = '${listingId}';
        `
        )
      )

      await db.execute(
        sql.raw(
          `
        UPDATE listings 
        SET tsvector_model = to_tsvector(model)
        WHERE id = '${listingId}';
        `
        )
      )

      // UPDATE SUBSCRIPTION
      const updatedMaxAds = user[0].maxAds! - 1
      const updatedMaxImages = user[0].maxImages! - 5

      if (user[0].subscription === products[1].id && user[0].maxAds === 3) {
        await db
          .update(users)
          .set({
            maxAds: updatedMaxAds,
            maxImages: updatedMaxImages,
            subscription: products[0].id,
          })
          .where(eq(users.id, session.user.id))
      }

      if (user[0].subscription === products[1].id && user[0].maxAds! > 3) {
        await db
          .update(users)
          .set({
            maxAds: updatedMaxAds,
            maxImages: updatedMaxImages,
          })
          .where(eq(users.id, session.user.id))
      }

      try {
        const template = await render(
          ListingCreatedTemplate({
            userName: authorId,
            userEmail: session.user.email || "",
            adId: listingId,
            adTitle: title,
          }) as React.ReactElement
        )

        await Nodemail({
          recipient: process.env.MAIL_USER!,
          sender: process.env.MAIL_USER!,
          subject: `DearDegens.com: Listing Recieved For Review`,
          template: template,
        })
        console.log(
          `Successfully sent listing creation email to admin, listing ID - ${listingId}`
        )
      } catch (error) {
        console.error(
          `Failed to send listing creation email to admin, listing ID - ${listingId}`
        )
        return new Response(
          `Failed to send listing creation email to admin, listing ID - ${listingId}`,
          { status: 500 }
        )
      }

      await db.insert(notifications).values({
        id: notificationId,
        userId: authorId,
        adId: listingId,
        adUrl: url,
        createdAt: currentDate,
        title: `Listing ${title} has been submitted!`,
        description: "Your almost there!",
        body: `Thank you for choosing DearDegens. Your ad for the ${brand} ${model} has been submitted and is currently being reviewed to ensure it meets our content policies. This process can take up to 2 working days. A notification will be sent to you when your listing goes live.`,
        isRead: false,
      })

      return new Response(JSON.stringify(post), { status: 200 })
    }
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
