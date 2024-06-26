"use client"
import React from "react"
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

interface ManageQueriesProps {
  queries: queryType[]
  userId: string
}

export default function MintManageQueries({
  queries,
  userId,
}: ManageQueriesProps) {
  return (
    <Sheet>
      <SheetTrigger className="group flex h-10 w-10 items-center justify-center hover:text-teal-500">
        <FileQuestion className="h-6 w-10" />
      </SheetTrigger>
      <SheetContent className="p-0">
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
