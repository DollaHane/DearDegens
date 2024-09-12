"use client"
import React, { useEffect } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components-ui/Carousel"
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import CarouselMintCardComponent from "../componentsCards/CarouselMintCardComponent"
import CarouselMintCardSkeleton from "../componentsCards/CarouselMintCardSkeleton"
import { Plus, Loader2 } from "lucide-react"
import "@splidejs/react-splide/css/core"
import { Button } from "../components-ui/Button"
import { listingsType } from "@/src/types/db"
import { queryLimit } from "@/src/server/queryLimit"

export default function RecentCarousel() {
  const mock = ["1", "2", "3", "4", "5"]
  const fetchListings = async ({ pageParam }: any) => {
    try {
      const response = await axios.get(
        `/api/getRecent?page=${pageParam}&limit=${queryLimit}`
      )
      return response.data
    } catch (error) {
      console.error("fetch error:", error)
    }
  }

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["recent"],
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    queryFn: fetchListings,
    initialPageParam: 1,
    getNextPageParam: (_, pages) => {
      return pages.length + 1
    },
  })

  const listingsData = data?.pages.flatMap((page) => page.rows) || [""]

  return (
    <div>
      <Carousel
        opts={{
          align: "start",
          loop: false,
          dragFree: true,
        }}
        className="h-full w-full"
      >
        <CarouselContent className="ml-0 flex">
          {listingsData[0] !== "" &&
            listingsData.map((listing: listingsType, index: any) => (
              <CarouselItem
                key={index}
                tabIndex={index}
                className="flex basis-auto flex-row"
              >
                <CarouselMintCardComponent listing={listing} />
              </CarouselItem>
            ))}
          {listingsData[0] === "" &&
            mock.map((item, index) => (
              <CarouselItem
                key={item}
                tabIndex={index}
                className="flex basis-auto flex-row"
              >
                <CarouselMintCardSkeleton />
              </CarouselItem>
            ))}
          <CarouselItem className="basis-auto">
            <Button
              onClick={() => fetchNextPage()}
              className="h-60 w-40  rounded-lg border border-muted bg-background shadow-md transition duration-75 hover:scale-[0.99] hover:bg-background"
            >
              {!isFetchingNextPage ? (
                <Plus className="h-20 w-20 animate-pulse text-muted" />
              ) : (
                <Loader2 className="h-20 w-20 animate-spin text-muted" />
              )}
            </Button>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious variant="icon" className="-left-8" />
        <CarouselNext variant="icon" className="-right-8" />
      </Carousel>
    </div>
  )
}
