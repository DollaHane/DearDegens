"use client"
import React, { useState, useEffect } from "react"
import { Button } from "../components-ui/Button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useGetWishlist } from "@/src/server/services"
import axios from "axios"
import { toast } from "@/src/hooks/use-toast"
import { FaRegHeart, FaHeart } from "react-icons/fa6"
import { cn } from "@/src/lib/utils"
import { listingsType, wishlistType } from "@/src/types/db"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

interface WishListProps {
  listing: listingsType
}

interface WishlistType {
  wishlistId: string
  userId: string
  itemId: string
  adId: string
  createdAt: Date
}

export default function MintAddToWishlist({ listing }: WishListProps) {
  const { data: session } = useSession()
  const listingId = JSON.stringify(listing.id)
  // VARIABLES
  const queryClient = useQueryClient()
  const wishlist = useGetWishlist().data
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // TOGGLE ISWISHLIST:
  useEffect(() => {
    session &&
      wishlist &&
      (wishlist as wishlistType).map((item: wishlistType) => {
        if (item.adId === listing.id) {
          setIsInWishlist(true)
        }
      })
  }, [wishlist])

  // MUTATION: ADD TO WISHLIST
  const { mutate: addToWishlist } = useMutation({
    mutationFn: async () => {
      await axios.post("/api/createWishlistItem", listingId)
    },
    onError: (error) => {
      console.log("onError:", error)
      setIsInWishlist(false)
      setIsLoading(false)
      if (error.message === "Request failed with status code 429") {
        return toast({
          description: "Too many network requests, please wait 30 seconds.",
          variant: "warning",
        })
      } else {
        return toast({
          description: "Error adding listing in wishlist. Please try again.",
          variant: "destructive",
        })
      }
    },
    onSuccess: () => {
      return toast({
        description: "Added to wishlist.",
      })
    },
    onSettled: async (_, error) => {
      setIsInWishlist(true)
      setIsLoading(false)
      if (error) {
        console.log("onSettled error:", error)
      } else {
        await queryClient.invalidateQueries({ queryKey: ["wishlist"] })
      }
    },
  })

  const handleSubmitAdd = () => {
    addToWishlist()
    setIsInWishlist(true)
    setIsLoading(true)
  }

  // MUTATION: REMOVE FROM WISHLIST
  const { mutate: removeFromWishlist } = useMutation({
    mutationFn: async () => {
      await axios.put("/api/deleteWishlistItem", listingId)
    },
    onError: (error) => {
      console.log("onError:", error)
      setIsInWishlist(true)
      setIsLoading(false)
      if (error.message === "Request failed with status code 429") {
        return toast({
          description: "Too many network requests, please wait 30 seconds.",
          variant: "warning",
        })
      } else {
        return toast({
          description: "Error removing from wishlist. Please try again.",
          variant: "destructive",
        })
      }
    },
    onSuccess: () => {
      return toast({
        description: "Removed from wishlist.",
      })
    },
    onSettled: async (_, error) => {
      setIsInWishlist(false)
      setIsLoading(false)
      if (error) {
        console.log("onSettled error:", error)
      } else {
        await queryClient.invalidateQueries({ queryKey: ["wishlist"] })
      }
    },
  })

  const handleSubmitRemove = () => {
    removeFromWishlist()
    setIsInWishlist(false)
    setIsLoading(true)
  }

  // TOOLTIP
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false)
  const tooltip = document.getElementById("wishTrigger")
  tooltip?.addEventListener("mouseover", () => {
    setTooltipVisible(true)
  })
  tooltip?.addEventListener("mouseout", () => {
    setTooltipVisible(false)
  })

  // UI
  return isInWishlist === true ? (
    <div className="relative flex items-center justify-center">
      <Button
        id="wishTrigger"
        onClick={handleSubmitRemove}
        variant="icon"
        disabled={isLoading}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center text-rose-500 "
        )}
      >
        <p
          className={cn(
            "absolute -top-12 hidden h-10 w-[100px] items-center justify-center rounded-md border border-muted bg-background p-1 text-center text-xs text-primary opacity-0 shadow-md",
            tooltipVisible &&
              "flex opacity-100 transition-opacity duration-200 ease-in"
          )}
        >
          Remove From Wishlist
        </p>
        <FaHeart className="absolute z-40 h-6 w-6 transition duration-75 hover:scale-110" />
      </Button>
      {isLoading && (
        <Loader2 className="absolute z-50 flex h-3 w-3 animate-spin text-primary" />
      )}
    </div>
  ) : (
    <div className="relative flex items-center justify-center">
      <Button
        id="wishTrigger"
        onClick={handleSubmitAdd}
        variant="icon"
        disabled={isLoading}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center font-semibold  hover:text-rose-500"
        )}
      >
        <p
          className={cn(
            "absolute -top-12 hidden h-10 w-[85px] items-center justify-center rounded-md border border-muted bg-background p-1 text-center text-xs text-primary opacity-0 shadow-md",
            tooltipVisible &&
              "flex opacity-100 transition-opacity duration-200 ease-in"
          )}
        >
          Add To Wishlist
        </p>
        <FaRegHeart className="absolute z-40 h-6 w-6 transition duration-75 hover:scale-110" />
      </Button>
      {isLoading && (
        <Loader2 className="absolute z-50 flex h-3 w-3 animate-spin text-primary" />
      )}
    </div>
  )
}
