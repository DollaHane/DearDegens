"use server"

import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"

import { authOptions } from "../lib/auth/auth-options"
import { db } from "./db"
import {
  chatRoom,
  listings,
  messages,
  notifications,
  offers,
  queries,
  users,
  wishlist,
  wishlistItem,
} from "./db/schema"
import { chatRoomType } from "../types/db"
import { alias } from "drizzle-orm/mysql-core"

// Get user image bucket by userId
export async function getBucket() {
  try {
    const session = await getServerSession(authOptions)
    const user =
      session &&
      (await db.select().from(users).where(eq(users.id, session?.user.id)))

    if (user) {
      const getBucket = user[0].imageBucket
      const bucket = []
      if (getBucket) {
        const currentBucket = getBucket.split(",")
        const formattedBucket = currentBucket.map((item) => {
          const matchResult = item.match(/"([^"]*)"/)
          return matchResult ? matchResult[1] : null
        })
        bucket.push(formattedBucket)
      }
      console.log("User bucket query successful")
      return bucket
    }
  } catch (error) {
    console.error("Server Error: Failed to fetch user image bucket - ", error)
  }
}

// Get all notifications by userId
export async function getNotifications() {
  try {
    const session = await getServerSession(authOptions)
    const notification =
      session &&
      (await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, session?.user.id)))

    notification &&
      notification.sort((a: any, b: any) => b.createdAt - a.createdAt)

    console.log("Notification query successful")
    return notification
  } catch (error) {
    console.error("Server Error: Failed to fetch notifications - ", error)
  }
}

// Get General Listings
export async function getListings(decodedParam: string) {
  try {
    const listingGeneral = await db
      .select()
      .from(listings)
      .where(eq(listings.id, decodedParam))
    console.log("General listing query successful.")
    return listingGeneral
  } catch (error) {
    console.error("Server error: Failed to fetch general listings - ", error)
  }
}

// Get listing offers
export async function getAdOffers(mintId: string) {
  try {
    const adOffers = await db
      .select()
      .from(offers)
      .where(eq(offers.adId, mintId))

    adOffers && adOffers.sort((a: any, b: any) => b.createdAt - a.createdAt)

    console.log("Ad offers query successful")
    return adOffers
  } catch (error) {
    console.error("Server error: Failed to fetch ad offers - ", error)
  }
}

// Get listing Queries
export async function getAdQueries(mintId: string) {
  try {
    const adQueries = await db
      .select()
      .from(queries)
      .where(eq(queries.adId, mintId))

    adQueries && adQueries.sort((a: any, b: any) => b.createdAt - a.createdAt)

    console.log("Ad queries query successful")
    return adQueries
  } catch (error) {
    console.error("Server error: Failed to fetch ad queries - ", error)
  }
}

export async function getWishlist() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response("Unauthorised", { status: 401 })
    }

    const userId = session.user.id

    const userWishlist = await db
      .select({
        wishlistId: wishlist.id,
        userId: wishlist.userId,
        itemId: wishlistItem.id,
        adId: wishlistItem.adId,
        createdAt: wishlistItem.createdAt,
      })
      .from(wishlist)
      .leftJoin(wishlistItem, eq(wishlist.id, wishlistItem.wishlistId))
      .where(eq(wishlist.userId, userId))

    console.log("Wishlist query successful")

    return userWishlist
  } catch (error) {
    console.error("Server error: Failed to fetch wishlist - ", error)
  }
}

// Get listing Chatrooms
export async function getChatrooms(mintId: string) {
  try {
    // const roomQueries = await db
    //   .select()
    //   .from(chatRoom)
    //   .where(eq(chatRoom.adId, mintId))

    const buyer = alias(users, "buyer")
    const seller = alias(users, "seller")

    const roomQueries = await db
      .select({
        roomId: chatRoom.id,
        adId: chatRoom.adId,
        buyerId: buyer.id,
        buyerName: buyer.name,
        buyerImage: buyer.image,
        sellerId: seller.id,
        sellerName: seller.name,
        sellerImage: seller.image,
        createdAt: chatRoom.createdAt,
      })
      .from(chatRoom)
      .leftJoin(buyer, eq(buyer.id, chatRoom.userId))
      .leftJoin(seller, eq(seller.id, chatRoom.sellerId))
      .where(eq(chatRoom.adId, mintId))

    roomQueries &&
      roomQueries.sort((a: any, b: any) => b.createdAt - a.createdAt)

    console.log("Chatroom queries query successful")
    return roomQueries
  } catch (error) {
    console.error("Server error: Failed to fetch ad chatrooms - ", error)
  }
}

// Get Chatroom Messages
export async function getMessages(roomId: string) {
  try {
    console.log("roomId", roomId)
    const roomMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.roomId, roomId))

    console.log("messages:", roomMessages)

    roomMessages &&
      roomMessages.sort((a: any, b: any) => a.createdAt - b.createdAt)

    console.log("Chatroom messages query successful")
    return roomMessages
  } catch (error) {
    console.error("Server error: Failed to fetch chatroom messages - ", error)
  }
}
