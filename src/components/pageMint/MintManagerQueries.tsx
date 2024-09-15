"use client"
import React, { useState } from "react"
import { FileQuestion } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components-ui/Sheet"
import { ScrollArea } from "../components-ui/ScrollArea"
import MintQueriesCard from "../pageMintQueries/MintQueriesCard"
import { queryType } from "@/src/types/db"
import Image from "next/image"
import Rabbit from "@/src/assets/rabbit.svg"
import { cn } from "@/src/lib/utils"

interface ManageQueriesProps {
  queries: queryType[]
  userId: string
}

export default function MintManageQueries({
  queries,
  userId,
}: ManageQueriesProps) {
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false)
  const tooltip = document.getElementById("queriesTrigger")
  tooltip?.addEventListener("mouseover", () => {
    setTooltipVisible(true)
  })
  tooltip?.addEventListener("mouseout", () => {
    setTooltipVisible(false)
  })
  return (
    <Sheet>
      <SheetTrigger
        id="queriesTrigger"
        className="group relative flex h-10 w-10 items-center justify-center hover:text-teal-500"
      >
        <p
          className={cn(
            "absolute -top-12 hidden h-10 w-[75px] items-center justify-center rounded-md border border-muted bg-background p-1 text-center text-xs text-primary opacity-0 shadow-md",
            tooltipVisible &&
              "opacity-100 flex transition-opacity duration-200 ease-in"
          )}
        >
          Manage Queries
        </p>
        <FileQuestion className="h-6 w-10" />
      </SheetTrigger>
      <SheetContent className="p-0 backdrop-blur-xl bg-transparent">
        <SheetHeader className="h-full">
          <SheetTitle className="mx-auto mt-5 w-11/12 text-customAccent">
            Queries:
          </SheetTitle>
          {queries.length === 0 ? (
            <div className="flex w-full flex-col items-center justify-center">
              <div className="w-full pt-10 text-center italic">
                There are no queries available for this listing.
              </div>
              <Image
                src={Rabbit}
                alt="rabbit"
                width={100}
                className="mt-10 text-primary"
              />
            </div>
          ) : (
            <ScrollArea className="mt-5 flex h-full flex-col pb-16 pr-2">
              <div className="mt-8">
                {queries &&
                  userId &&
                  queries.map((item: any, index) => {
                    return (
                      <MintQueriesCard
                        key={index}
                        query={item}
                        userId={userId}
                      />
                    )
                  })}
              </div>
            </ScrollArea>
          )}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}
