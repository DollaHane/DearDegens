import { relations, sql } from "drizzle-orm"
import {
  boolean,
  datetime,
  index,
  int,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core"

// __________________________________________________________________________________________________________________
// ACCOUNTS
export const accounts = mysqlTable(
  "accounts",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    access_token: text("access_token"),
    expires_in: int("expires_in"),
    id_token: text("id_token"),
    refresh_token: text("refresh_token"),
    refresh_token_expires_in: int("refresh_token_expires_in"),
    scope: varchar("scope", { length: 255 }),
    token_type: varchar("token_type", { length: 255 }),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow()
      .notNull(),
  },
  (account) => ({
    providerProviderAccountIdIndex: uniqueIndex(
      "accounts__provider__providerAccountId__idx"
    ).on(account.provider, account.providerAccountId),
    userIdIndex: index("accounts__userId__idx").on(account.userId),
  })
)

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

// __________________________________________________________________________________________________________________
// SESSIONS
export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    sessionToken: varchar("sessionToken", { length: 255 }).notNull(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: datetime("expires").notNull(),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow()
      .notNull(),
  },
  (session) => ({
    sessionTokenIndex: uniqueIndex("sessions__sessionToken__idx").on(
      session.sessionToken
    ),
    userIdIndex: index("sessions__userId__idx").on(session.userId),
  })
)

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

// __________________________________________________________________________________________________________________
// USERS
export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    admin: boolean("admin").default(false).notNull(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("emailVerified"),
    image: varchar("image", { length: 255 }),
    imageBucket: text("imageBucket").default(""),
    wishlist: varchar("wishlist", { length: 191 }).references(
      () => wishlist.id
    ),
    // wishlist: text("wishlist").default(""),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow()
      .notNull(),
    coolingDown: boolean("coolingDown").default(false).notNull(),
  },
  (user) => ({
    emailIndex: uniqueIndex("users__email__idx").on(user.email),
  })
)

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts: one(accounts),
  sessions: many(sessions),
  listings: many(listings),
  notifications: many(notifications),
  offers: many(offers),
}))

// __________________________________________________________________________________________________________________
// TOKEN
export const verificationTokens = mysqlTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).primaryKey().notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: datetime("expires").notNull(),
    createdAt: timestamp("createdAt").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow(),
  },
  (verificationToken) => ({
    tokenIndex: uniqueIndex("verification_tokens__token__idx").on(
      verificationToken.token
    ),
  })
)

// __________________________________________________________________________________________________________________
// WISHLIST
export const wishlist: any = mysqlTable(
  "wishlist",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    wishlistItem: varchar("wishlistItem", { length: 191 }).references(
      () => wishlistItem.id
    ),
  },
  (wishlists) => {
    return {
      idIdx: uniqueIndex("idx_wishlist_id").on(wishlists.id),
    }
  }
)

// __________________________________________________________________________________________________________________
// WISHLIST ITEM
export const wishlistItem = mysqlTable(
  "wishlistItem",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    adId: varchar("adId", { length: 191 }).notNull(),
    wishlistId: varchar("wishlistId", { length: 191 }),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (wishlistItems) => {
    return {
      idIdx: uniqueIndex("idx_wishlistItem_id").on(wishlistItems.id),
    }
  }
)

// __________________________________________________________________________________________________________________
// LISTING
export const listings = mysqlTable(
  "listings",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    authorId: varchar("authorId", { length: 191 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").default(sql`CURRENT_TIMESTAMP`),
    expirationDate: datetime("expirationDate"),
    purgeDate: datetime("purgeDate"),
    category: varchar("category", { length: 191 }),
    subCategory: varchar("subCategory", { length: 191 }),
    price: int("price"),
    brand: varchar("brand", { length: 191 }),
    model: varchar("model", { length: 191 }),
    title: varchar("title", { length: 191 }),
    description: text("description"),
    items: text("items"),
    images: text("images"),
    location: varchar("location", { length: 191 }),
    meetup: varchar("meetup", { length: 191 }),
    isNew: boolean("isNew").default(true),
    isUrgent: boolean("isUrgent").default(false),
    isPending: boolean("isPending").default(false),
    isHot: boolean("isHot").default(false),
    isSold: boolean("isSold").default(false),
  },
  (listing) => ({
    idIndex: uniqueIndex("listings__id__idx").on(listing.id),
  })
)

export const listingsRelations = relations(listings, ({ one, many }) => ({
  authorId: one(users, {
    fields: [listings.authorId],
    references: [users.id],
  }),
  queries: many(queries),
}))

// __________________________________________________________________________________________________________________
// NOTIFICATIONS
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 191 }).primaryKey().notNull(),
  userId: varchar("userId", { length: 191 })
    .notNull()
    .references(() => users.id),
  adId: text("adId"),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  title: varchar("title", { length: 191 }).notNull(),
  description: varchar("description", { length: 191 }).notNull(),
  body: text("body").notNull(),
  isRead: boolean("isRead").default(false),
})

export const notificationsRelations = relations(notifications, ({ one }) => ({
  userId: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}))

// __________________________________________________________________________________________________________________
// OFFERS
export const offers = mysqlTable("offers", {
  id: varchar("id", { length: 191 }).primaryKey().notNull(),
  userId: varchar("userId", { length: 191 })
    .notNull()
    .references(() => users.id),
  userName: varchar("userName", { length: 191 }),
  adId: varchar("adId", { length: 191 })
    .notNull()
    .references(() => listings.id),
  sellerId: varchar("sellerId", { length: 191 }),
  adTitle: varchar("adTitle", { length: 191 }),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  expirationDate: datetime("expirationDate"),
  purgeDate: datetime("purgeDate"),
  askPrice: int("askPrice"),
  offerPrice: int("offerPrice"),
  counterPrice: int("counterPrice"),
  isCountered: boolean("isCountered").default(false),
  isDeclined: boolean("isDeclined").default(false),
  isAccepted: boolean("isAccepted").default(false),
  isConfirmed: boolean("isConfirmed").default(false),
})

export const offersRelations = relations(offers, ({ one }) => ({
  userId: one(users, {
    fields: [offers.userId],
    references: [users.id],
  }),
}))

// __________________________________________________________________________________________________________________
// OFFERSLIST
export const offersList = mysqlTable("offersList", {
  id: varchar("id", { length: 191 }).primaryKey().notNull(),
  userId: varchar("userId", { length: 191 })
    .notNull()
    .references(() => users.id),
  userName: varchar("userName", { length: 191 }),
  adId: varchar("adId", { length: 191 })
    .notNull()
    .references(() => listings.id),
  itemId: varchar("itemId", { length: 191 })
    .notNull()
    .references(() => listings.id),
  sellerId: varchar("sellerId", { length: 191 }),
  name: varchar("name", { length: 191 }),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  expirationDate: datetime("expirationDate"),
  purgeDate: datetime("purgeDate"),
  askPrice: int("askPrice"),
  offerPrice: int("offerPrice"),
  counterPrice: int("counterPrice"),
  isCountered: boolean("isCountered").default(false),
  isDeclined: boolean("isDeclined").default(false),
  isAccepted: boolean("isAccepted").default(false),
  isConfirmed: boolean("isConfirmed").default(false),
})

export const offersListRelations = relations(offersList, ({ one }) => ({
  userId: one(users, {
    fields: [offersList.userId],
    references: [users.id],
  }),
}))

// __________________________________________________________________________________________________________________
// QUERIES
export const queries = mysqlTable("queries", {
  id: varchar("id", { length: 191 }).primaryKey().notNull(),
  userId: varchar("userId", { length: 191 })
    .notNull()
    .references(() => users.id),
  userName: varchar("userName", { length: 191 }),
  adId: varchar("adId", { length: 191 })
    .notNull()
    .references(() => listings.id),
  sellerId: varchar("sellerId", { length: 191 }),
  adTitle: varchar("adTitle", { length: 191 }),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  expirationDate: datetime("expirationDate"),
  purgeDate: datetime("purgeDate"),
  query: varchar("query", { length: 191 }),
  reply: varchar("reply", { length: 191 }),
  isAnswered: boolean("isAnswered").default(false),
  isPublic: boolean("isPublic").default(false),
})

export const queriesRelations = relations(queries, ({ one }) => ({
  adId: one(listings, {
    fields: [queries.id],
    references: [listings.id],
  }),
}))

// __________________________________________________________________________________________________________________
// REPORTS
export const listingReports = mysqlTable(
  "listingReports",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    userId: varchar("userId", { length: 191 })
      .references(() => users.id)
      .notNull(),
    adId: varchar("adId", { length: 191 })
      .references(() => listings.id)
      .notNull(),
    sellerId: varchar("sellerId", { length: 191 })
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    infraction: varchar("infraction", { length: 191 }).notNull(),
    description: text("description"),
    adFlagged: boolean("adFlagged").default(false),
  },
  (listingReport) => {
    return {
      idIdx: uniqueIndex("listingReports_id_idx").on(listingReport.id),
    }
  }
)

// __________________________________________________________________________________________________________________
// CHAT ROOM:
export const chatRoom = mysqlTable(
  "chatRoom",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    adId: varchar("adId", { length: 191 })
      .references(() => listings.id)
      .notNull(),
    userId: varchar("userId", { length: 191 })
      .references(() => users.id)
      .notNull(),
    sellerId: varchar("sellerId", { length: 191 })
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (chatRooms) => {
    return {
      idIdx: uniqueIndex("idx_chatRoom_id").on(chatRooms.id),
    }
  }
)

// __________________________________________________________________________________________________________________
// CHAT MESSAGE:
export const messages = mysqlTable(
  "messages",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    roomId: varchar("roomId", { length: 191 })
      .references(() => chatRoom.id)
      .notNull(),
    userId: varchar("userId", { length: 191 })
      .references(() => users.id)
      .notNull(),
    userName: varchar("userName", { length: 191 })
      .references(() => users.name)
      .notNull(),
    message: text("message"),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (message) => {
    return {
      idIdx: uniqueIndex("idx_messages_id").on(message.id),
    }
  }
)
