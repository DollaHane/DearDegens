"use client"
import React from "react"
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
import { Plus } from "lucide-react"
import "@splidejs/react-splide/css/core"
import { Button } from "../components-ui/Button"

export default function HomeCarousel() {
  const fetchListings = async ({ pageParam }: any) => {
    try {
      const response = await axios.get(
        `/api/getHomepage?page=${pageParam}&limit=${4}`
      )
      return response.data
    } catch (error) {
      console.error("fetch error:", error)
    }
  }

  const { data, fetchNextPage, isFetchingNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: ["results"],
      queryFn: fetchListings,
      initialPageParam: 1,
      getNextPageParam: (_, pages) => {
        return pages.length + 1
      },
    })

  const listings = data?.pages.flatMap((page) => page.rows) || [""]

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
          {!isFetching &&
            listings.map((listing: any, index: any) => (
              <CarouselItem
                key={index}
                tabIndex={index}
                className="basis-auto p-5"
              >
                <CarouselMintCardComponent listing={listing} />
              </CarouselItem>
            ))}
          <CarouselItem className="basis-auto p-5">
            <Button
              onClick={() => fetchNextPage()}
              className="h-60 w-40  rounded-lg border border-muted bg-background shadow-md transition duration-75 hover:scale-[0.99] hover:bg-background"
            >
              <Plus className="h-20 w-20 animate-pulse text-muted" />
            </Button>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious variant="icon" className="-left-8" />
        <CarouselNext variant="icon" className="-right-8" />
      </Carousel>
    </div>
  )
}
