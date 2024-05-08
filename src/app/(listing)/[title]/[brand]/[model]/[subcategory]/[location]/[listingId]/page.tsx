"use client"
import React from "react"
import MintCarousel from "@/src/components/pageMint/MintCarousel"
import MintPageAuthorActions from "@/src/components/pageMint/MintPageAuthorActions"
import MintPageUsersActions from "@/src/components/pageMint/MintPageUsersActions"
import MintQA from "@/src/components/pageMint/MintQA"
import MintOffer from "@/src/components/pageMintOffers/MintOffer"
import MintList from "@/src/components/pageMint/MintList"
import MintInfo from "@/src/components/pageMint/MintInfo"
import MintRenew from "@/src/components/pageMint/MintRenew"
import MintSold from "@/src/components/pageMint/MintSold"
import MintSoldRenew from "@/src/components/pageMint/MintSoldRenew"

import { authOptions } from "@/src/lib/auth/auth-options"
import { formatTimeToNow } from "@/src/lib/utils"
import {
  getAdOffers,
  getAdQueries,
  getListings,
  getUserOffers,
  getUserQueries,
} from "@/src/server/actions"
import { db } from "@/src/server/db"
import { listings, queries } from "@/src/server/db/schema"
import { listingsType, queryType } from "@/src/types/db"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryCache,
  useQueryClient,
} from "@tanstack/react-query"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import ShareButtons from "@/src/components/pageMint/ShareButtons"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useGetListing } from "@/src/server/services"

export default function MintPage() {
  const param = useParams()
  const { listingId }: any = param
  const { data: session } = useSession()
  const domain = process.env.URL!

  // LISTING QUERY
  const queryClient = useQueryClient()

  const adId = listingId.toString()
  const userId = session?.user.id!

  // LISTING QUERY
  const listingData = useGetListing(adId).data || []
  const listing = listingData[0]

  // OFFER QUERY
  queryClient.prefetchQuery({
    queryKey: ["adOffers"],
    queryFn: () => getAdOffers(listingId),
  })

  // USER QUERIES QUERY
  queryClient.prefetchQuery({
    queryKey: ["userOffers"],
    queryFn: () => getUserOffers(userId, listingId),
  })

  // QUERIES QUERY
  queryClient.prefetchQuery({
    queryKey: ["adQueries"],
    queryFn: () => getAdQueries(listingId),
  })

  // USER QUERIES QUERY
  queryClient.prefetchQuery({
    queryKey: ["userQueries"],
    queryFn: () => getUserQueries(userId, listingId),
  })

  // PRICE TEXT FORMATTER
  const formatPrice = (price: any) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
    })

    return formatter.format(price)
  }

  return (
    <div className="flex h-auto w-full">
      <HydrationBoundary state={dehydrate(queryClient)}>
      {listing && (
        <div className="mb-60">
          {/* TOP SECTION */}
          <div className="mt-10 flex w-full flex-row justify-between">
            <div className="my-auto w-full">
              <div className="flex w-full justify-between">
                <p className="mb-5 text-3xl font-bold text-customAccent">
                  R {formatPrice(listing.price)}
                </p>
                {session &&
                  (listing.price &&
                  listing.title &&
                  listing.authorId !== session.user.id ? (
                    <MintOffer listing={listing} />
                  ) : listing.isExpired ? (
                    <MintRenew listing={listing} />
                  ) : listing.isSold ? (
                    <MintSoldRenew listing={listing} />
                  ) : (
                    <MintSold listing={listing} />
                  ))}
              </div>
              <h1 className="mb-2 text-2xl font-bold">{listing.title}</h1>
              <p className="text-xs italic text-secondary">
                Listed {formatTimeToNow(listing.createdAt!)}
              </p>
            </div>
          </div>
          <div className="flex flex-col py-5 md:flex-row">
            {/* @ts-expect-error Server Component */}
            <MintCarousel listing={listing.images} />
            <MintInfo listing={listing} />
          </div>

          {session && (
            <>
              {/* MANAGER SECTION */}
              <hr className="my-2 border border-t-muted-foreground" />
              <div className="flex min-h-[40px] items-end">
                <ShareButtons domain={domain} />
                {session?.user.id === listing.authorId ? (
                  <MintPageAuthorActions listing={listing} />
                ) : (
                  <MintPageUsersActions listing={listing} />
                )}
              </div>
              {/* @ts-expect-error Server Component */}
              {/* <MintList
               items={listing.items}
               adId={listing.id}
               sellerId={listing.authorId}
             /> */}
            </>
          )}

          {/* DESCRIPTION SECTION */}
          <hr className="my-2 border border-t-muted-foreground" />
          <h1 className="mt-5 text-lg font-bold">Description:</h1>
          <p className="my-5 whitespace-pre-line pl-2 text-sm md:text-base">
            {listing.description}
          </p>
          <hr className="my-2 border border-t-muted-foreground" />

          {/* QUERIES SECTION */}
          <h1 className="mt-5 text-lg font-bold">Questions & Answers:</h1>
          <MintQA listing={listing} />
        </div>
      )}
      </HydrationBoundary>
    </div>
  )
}
