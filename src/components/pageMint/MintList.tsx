import React from "react"
import MintOfferList from "../pageMintOffers/MintOfferList"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth/auth-options"

interface MintListProps {
  items: any
  adId: string
  sellerId: string
}

export default async function MintList({
  items,
  adId,
  sellerId,
}: MintListProps) {
  const list = JSON.parse(items)
  const listString = JSON.stringify(list)
  const session = await getServerSession(authOptions)

  // PRICE TEXT FORMATTER
  const formatPrice = (price: any) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
    })

    return formatter.format(price)
  }

  if (listString && listString.length > 65) {
    return (
      <div className="my-5 w-full">
        <hr className="my-2 border border-t-muted-foreground" />
        <h1 className=" mb-2 text-lg font-bold">Listed Items:</h1>
        {list.map((item: any, index: any) => {
          return (
            <div className="pl-2">
              <hr className="border border-dotted border-muted" />
              <div
                key={item.id}
                className="flex  w-full flex-row items-center justify-between"
              >
                <p>{item.name}</p>
                <div className="flex items-center space-x-5">
                  <p className="font-semibold text-customAccent">
                    R {formatPrice(item.price)}
                  </p>
                  {session?.user.id !== sellerId && (
                    <MintOfferList
                      itemId={item.id}
                      askPrice={item.price}
                      adId={adId}
                      sellerId={sellerId}
                      name={item.name}
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  } else {
    return <></>
  }
}
