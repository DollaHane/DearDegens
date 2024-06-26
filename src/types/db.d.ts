import { InferInsertModel, InferSelectModel } from "drizzle-orm"

import {
  listings,
  notifications,
  offers,
  queries,
  wishlist,
  listingReports,
  chatRoom,
  messages,
} from "../server/db/schema"

export type userType = InferInsertModel<typeof users>
export type listingsType = InferInsertModel<typeof listings>
export type notificationsType = InferInsertModel<typeof notifications>
export type offerType = InferInsertModel<typeof offers>
export type queryType = InferInsertModel<typeof queries>
export type wishlistType = InferInsertModel<typeof wishlist>
export type listingReportsType = InferInsertModel<typeof listingReports>
export type messagesType = InferInsertModel<typeof messages>
export type chatRoomType = InferInsertModel<typeof chatRoom>

export type roomType = {
  id: string
  adId: string
  userId: string
  userName: string
  userImage: string
  sellerId: string
  sellerName: string
  sellerImage: string
  createdAt: Date
}

export type listingItemType = {
  id: string,
  name: string,
  price: number,
  isSold: boolean
}
