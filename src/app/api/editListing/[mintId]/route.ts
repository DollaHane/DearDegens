import { getAuthSession } from "@/src/lib/auth/auth-options"
import { validateListing } from "@/src/lib/validators/validateListingGeneral"
import { db } from "@/src/server/db"
import { sql } from "drizzle-orm"
import { listings, notifications } from "@/src/server/db/schema"
import { eq } from "drizzle-orm"
import { ulid } from "ulid"
import { z } from "zod"
import { ListingCreatedTemplate } from "@/src/components/emailTemplates/ListingCreatedTemplate"
import { render } from "@react-email/components"
import { Nodemail } from "@/src/server/mail/mail"

export async function PATCH(req: Request, context: any) {
  try {
    const listingId = context.params.mintId
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const listing = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))

    if (listing[0].isExpired === true && listing[0].wasRenewed === true) {
      return new Response("This listing cannot be updated.", { status: 409 })
    }

    const body = await req.json()
    const authorId = session?.user.id

    const generateNotificationId = `edtList-${ulid()}`
    const notificationId = generateNotificationId

    const currentDate: Date = new Date()

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

    const post = await db
      .update(listings)
      .set({
        url: url,
        updatedAt: currentDate,
        category: category,
        subCategory: subCategory,
        price: parseInt(price),
        title: title,
        brand: brand,
        model: model,
        description: description,
        mileage: parseInt(mileage),
        year: parseInt(year),
        transmission: transmission,
        fuel: fuel,
        items: JSON.stringify(items),
        images: images,
        location: location,
        meetup: meetup,
        displayContact: displayContact,
        isReviewed: false,
        nonCompliant: false,
      })
      .where(eq(listings.id, listingId))

    await db
      .update(notifications)
      .set({
        adUrl: url,
      })
      .where(eq(notifications.adId, listingId))

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
        subject: `DearDegens.com: Listing Recieved For Review (Updated).`,
        template: template,
      })
      console.log(
        `Successfully sent listing update email to admin, listing ID - ${listingId}`
      )
    } catch (error) {
      console.error(
        `Failed to send listing update email to admin, listing ID - ${listingId}`
      )
      return new Response(
        `Failed to send listing update email to admin, listing ID - ${listingId}`,
        { status: 500 }
      )
    }

    await db.insert(notifications).values({
      id: notificationId,
      userId: authorId,
      adId: listingId,
      adUrl: url,
      createdAt: currentDate,
      title: `Listing ${title} updates have been submitted!`,
      description: "We just need to run a few checks!",
      body: `The updates to your ad for the ${brand} ${model} have been submitted and are currently being reviewed to ensure it meets our content policies. This process can take up to 2 working days. A notification will be sent to you when your listing goes live.`,
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
