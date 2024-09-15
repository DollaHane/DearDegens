"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { FileEdit } from "lucide-react"
import MintDelete from "./MintDelete"
import MintManageOffers from "./MintManageOffers"
import MintManageQueries from "./MintManagerQueries"
import ChatSheet from "../pageMintChat/ChatSheet"
import ShareButtons from "./ShareButtons"
import { listingsType } from "@/src/types/db"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { offerType, queryType } from "@/src/types/db"
import { cn } from "@/src/lib/utils"

interface UserActionsProps {
  listing: listingsType
  offers: offerType[]
  queries: queryType[]
  isLoading: boolean
  domain: string
}

export default function MintPageAuthorActions({
  offers,
  queries,
  listing,
  isLoading,
  domain,
}: UserActionsProps) {
  const { data: session } = useSession()
  const userId = session?.user.id!
  const [isExpired, setIsExpired] = useState<boolean>(true)

  useEffect(() => {
    if (listing.isExpired === false) {
      setIsExpired(false)
    }
  }, [])

  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false)
  const tooltip = document.getElementById("editTrigger")
  tooltip?.addEventListener("mouseover", () => {
    setTooltipVisible(true)
  })
  tooltip?.addEventListener("mouseout", () => {
    setTooltipVisible(false)
  })

  return (
    <div className="flex w-full justify-end space-x-1 md:space-x-2">
      <ShareButtons domain={domain} />
      <MintManageOffers offers={offers} isLoading={isLoading} />
      <MintManageQueries queries={queries} userId={userId} />
      {!isExpired ? (
        <Link
          id="editTrigger"
          href={`/ad/edit/${listing.id}`}
          className="group relative flex h-10 w-10 items-center justify-center text-primary hover:text-amber-500"
        >
          <p
            className={cn(
              "absolute -top-10 hidden h-8 w-[65px] items-center justify-center rounded-md border border-muted bg-background p-1 text-center text-xs text-primary opacity-0 shadow-md",
              tooltipVisible &&
                "opacity-100 flex transition-opacity duration-400 ease-in"
            )}
          >
            Edit Ad
          </p>
          <FileEdit />
        </Link>
      ) : (
        <div className="group flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-muted">
          <FileEdit />
        </div>
      )}
      <MintDelete listingId={listing.id} />
      <ChatSheet listingId={listing.id} />
    </div>
  )
}
