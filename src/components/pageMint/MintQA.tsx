"use client"
import React from "react"
import { useGetQueries } from "../../server/services"
import { listingsType } from "@/src/types/db"

interface MintQAParams {
  listing: listingsType
}

export default function MintQA({ listing }: MintQAParams) {
  const id = listing.id
  console.log('Q&A ID:', id)

  const queries = useGetQueries(id).data
  const isReFetching = useGetQueries(id).isRefetching

  return (
    <div className="mt-5">
      {!isReFetching ? (
        queries &&
        queries.map((qa, index) => {
          if (qa.isPublic === true) {
            return (
              <div className="flex w-full flex-col" key={index}>
                <div className="flex space-x-5">
                  <p className="w-5 font-bold">Q:</p>
                  <p className="w-full">{qa.query}</p>
                </div>
                <div className="flex space-x-5">
                  <p className="w-5 font-bold">A:</p>
                  <p className="w-full italic text-customAccent">{qa.reply}</p>
                </div>
                <hr className="my-2 border border-t-muted" />
              </div>
            )
          }
        })
      ) : (
        <div>
          <div className="flex w-full space-x-5 p-2">
            <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-full animate-pulse rounded-full bg-muted" />
          </div>
          <div className="flex w-full space-x-5 p-2">
            <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-full animate-pulse rounded-full bg-muted" />
          </div>
          <div className="mt-5 flex w-full space-x-5 p-2">
            <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-full animate-pulse rounded-full bg-muted" />
          </div>
          <div className="flex w-full space-x-5 p-2">
            <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-full animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      )}
    </div>
  )
}
