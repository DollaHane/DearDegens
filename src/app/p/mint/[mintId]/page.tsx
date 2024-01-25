import React from "react"
import MintCarouselTwo from "@/src/components/pageMint/MintCarouselTwo"
import MintPageAuthorActions from "@/src/components/pageMint/MintPageAuthorActions"
import MintPageUsersActions from "@/src/components/pageMint/MintPageUsersActions"
import MintOffer from "@/src/components/pageMintOffers/MintOffer"
import { authOptions } from "@/src/lib/auth/auth-options"
import { formatTimeToNow } from "@/src/lib/utils"
import { getAdOffers, getAdQueries, getListings } from "@/src/server/actions"
import { db } from "@/src/server/db"
import { listings, queries } from "@/src/server/db/schema"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { listingsType, queryType } from "@/src/types/db"
import MintQA from "@/src/components/pageMint/MintQA"

interface MintPageProps {
  params: {
    mintId: string
  }
}

export default async function MintPage({ params }: MintPageProps) {
  const param = params
  const decodedParam = decodeURIComponent(param.mintId)
  const session = await getServerSession(authOptions)

  // LISTING QUERY
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ["prelisting"],
    queryFn: () => getListings(decodedParam),
  })

  const listing: listingsType[] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, decodedParam)) || []

  const query: queryType[] = await db.select().from(queries).where(eq(queries.adId, decodedParam)) || []


  // OFFER QUERY
  await queryClient.prefetchQuery({
    queryKey: ["adOffers"],
    queryFn: () => listing && getAdOffers(listing[0].id),
  })

  // QUERIES QUERY
  await queryClient.prefetchQuery({
    queryKey: ["adQueries"],
    queryFn: () => listing && getAdQueries(listing[0].id)
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
    <div className="flex w-full h-auto">
      <div className="w-10/12 md:w-8/12 mx-auto">
        {listing &&
          listing.map((item, index) => (
            <div key={index} className="mb-60">
              <MintCarouselTwo listing={item.images} />
              <div className="flex flex-row w-full justify-between mt-10">
                <div className="my-auto w-full">
                  <div className="flex w-full justify-between">
                    <h1 className="text-3xl font-bold mb-5 text-customAccent">
                      R {formatPrice(item.price)}
                    </h1>
                    {session &&
                      item.price && item.title &&
                      item.authorId !== session.user.id && (
                        <MintOffer
                          title={item.title}
                          sellerId={item.authorId}
                          adId={item.id}
                          askPrice={item.price}
                        />
                      )}
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
                  <p className="text-xs italic text-secondary">
                    Listed {formatTimeToNow(item.createdAt!)}
                  </p>
                </div>
              </div>
              <hr className="my-2 border border-t-muted-foreground" />
              <div className="min-h-[40px] flex ">
                {session?.user.id === item.authorId ? (
                  <HydrationBoundary state={dehydrate(queryClient)}>
                    <MintPageAuthorActions listingId={item.id} />
                  </HydrationBoundary>
                ) : (
                  <HydrationBoundary state={dehydrate(queryClient)}>
                    <MintPageUsersActions listingId={item.id} />
                  </HydrationBoundary>
                )}
              </div>
              <hr className="my-2 border border-t-muted-foreground" />
              <h1 className="text-lg font-bold mt-5">Description</h1>
              <p className="my-5 whitespace-pre-line">{item.description}</p>
              <hr className="my-2 border border-t-muted-foreground" />
              <h1 className="text-lg font-bold mt-5">Queries</h1>
              <MintQA queries={query}/>
            </div>
          ))}
      </div>
    </div>
  )
}
