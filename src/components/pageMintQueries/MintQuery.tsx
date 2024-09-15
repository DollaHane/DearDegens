"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/src/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/components-ui/AlertDialog"
import { Button } from "@/src/components/components-ui/Button"
import { toast } from "@/src/hooks/use-toast"
import { QueryCreationRequest } from "@/src/lib/validators/validateQuery"
import { useForm } from "@tanstack/react-form"
import type { FieldApi } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { HelpCircle, Loader2 } from "lucide-react"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { useGetQueriesUser } from "@/src/server/services"
import { Checkbox } from "../components-ui/Checkbox"
import { Label } from "../components-ui/Label"
import { Textarea } from "../components-ui/Textarea"
import { listingsType } from "@/src/types/db"
import { useSession } from "next-auth/react"

function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <>
      {field.state.meta.touchedErrors ? (
        <em className="absolute -bottom-8 text-rose-500">
          {field.state.meta.touchedErrors}
        </em>
      ) : null}
    </>
  )
}

interface MintQueryProps {
  listing: listingsType
}

export default function MintQuery({ listing }: MintQueryProps) {
  const [disabled, setDisabled] = useState<boolean>(true)
  const [isLimited, setIsLimited] = useState<boolean>(false)
  const [hover, setHover] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false)
  const tooltip = document.getElementById("query")
  tooltip?.addEventListener("mouseover", () => {
    setTooltipVisible(true)
  })
  tooltip?.addEventListener("mouseout", () => {
    setTooltipVisible(false)
  })

  const queries = useGetQueriesUser(listing.id).data || []

  useEffect(() => {
    if (queries.length >= 3) {
      setIsLimited(true)
    }
  }, [queries])

  useEffect(() => {
    const element: Element | null = document.querySelector("#query")
    if (element) {
      element.addEventListener("mouseover", (event) => {
        setHover(true)
      })

      element.addEventListener("mouseout", (event) => {
        setHover(false)
      })
    }
  }, [isLimited])

  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
      query: "",
      adId: listing?.id,
      sellerId: listing?.authorId,
      adTitle: listing?.title || "",
      adBrand: listing?.brand || "",
      adModel: listing?.model || "",
      adSubCategory: listing?.subCategory || "",
      adLocation: listing?.location || "",
      url: listing.url,
    },
    onSubmit: async ({ value }) => {
      const payload: QueryCreationRequest = {
        query: value.query,
        adId: listing?.id || "",
        sellerId: listing?.authorId || "",
        adTitle: listing?.title || "",
        adBrand: listing?.brand || "",
        adModel: listing?.model || "",
        adSubCategory: listing?.subCategory || "",
        adLocation: listing?.location || "",
        url: listing.url,
      }
      createQuery(payload)
      setDisabled(true)
      console.log("Submit Payload:", payload)
    },
  })

  const { mutate: createQuery } = useMutation({
    // PAYLOAD
    mutationFn: async ({
      query,
      adId,
      sellerId,
      adTitle,
      adBrand,
      adModel,
      adSubCategory,
      adLocation,
      url,
    }: QueryCreationRequest) => {
      const payload: QueryCreationRequest = {
        query,
        adId,
        sellerId,
        adTitle,
        adBrand,
        adModel,
        adSubCategory,
        adLocation,
        url,
      }

      const { data } = await axios.post("/api/createQuery", payload)

      return data
    },
    onError: () => {
      return toast({
        title: "Something went wrong.",
        description: "There was an error sending your query. Please try again.",
        variant: "destructive",
      })
    },
    onSuccess: () => {
      setSubmitted(true)
      return toast({
        description: "Your query is on the way to the seller.",
      })
    },
    onSettled: async (_, error) => {
      if (error) {
        console.log("onSettled error:", error)
      } else {
        await queryClient.invalidateQueries({
          queryKey: ["queries", listing.id],
        })
      }
    },
  })

  return (
    <div>
      <AlertDialog>
        <AlertDialogTrigger
          disabled={isLimited}
          className={cn(
            "group relative flex h-10 w-10 items-center justify-center hover:text-blue-500",
            isLimited && "text-muted-foreground hover:text-muted-foreground"
          )}
        >
          <div
            id="query"
            className="absolute left-0 top-0 z-50 flex h-full w-full"
          />
          {isLimited ? (
            <div
              className={cn(
                "absolute -top-16 flex h-10 w-40 rounded-lg border border-muted bg-background p-1 text-center text-xs text-primary opacity-0 shadow-md",
                hover && "opacity-1 transition duration-75"
              )}
            >
              You have reached your query limit for this ad.
            </div>
          ) : (
            <p
              className={cn(
                "absolute -top-12 hidden h-10 w-[100px] items-center justify-center rounded-md border border-muted bg-background p-1 text-center text-xs text-primary opacity-0 shadow-md",
                tooltipVisible &&
                  "opacity-100 flex transition-opacity duration-200 ease-in"
              )}
            >
              Request More Information
            </p>
          )}
          <HelpCircle />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <form.Provider>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void form.handleSubmit()
              }}
              className="space-y-8"
            >
              <AlertDialogHeader>
                <AlertDialogTitle className="mb-5 font-bold">
                  <span className="italic">
                    Have a question for the seller?
                  </span>
                </AlertDialogTitle>

                <AlertDialogDescription>
                  <div className="relative mb-10 grid grid-cols-1 gap-2">
                    {/* REPLY */}
                    <form.Field
                      name="query"
                      validators={{
                        onChange: z
                          .string()
                          .min(3, "Your message must be at least 3 characters")
                          .max(
                            191,
                            "Your message cannot be greater than 191 characters"
                          ),
                        onChangeAsyncDebounceMs: 500,
                        onChangeAsync: z.string().refine(
                          async (value) => {
                            await new Promise((resolve) =>
                              setTimeout(resolve, 1000)
                            )
                            return !value.includes("error")
                          },
                          {
                            message: "No 'error' allowed in message",
                          }
                        ),
                      }}
                    >
                      {(field) => (
                        <>
                          <div className="flex h-5 w-full justify-between">
                            <label className="py-1 text-primary">
                              Type your message here:
                            </label>
                            <label className="py-1 text-xs italic text-rose-400">
                              (required)
                            </label>
                          </div>
                          <Textarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="h-32 w-full text-primary"
                            required
                          />
                          <FieldInfo field={field} />
                        </>
                      )}
                    </form.Field>
                  </div>

                  <div>
                    <p className="text-xs italic">
                      (Note: Once the seller recieves this message, they will
                      have the option of making the query public when they
                      reply. Both your message and the sellers reply will be
                      displayed on the listing page to better inform other
                      potential buyers.)
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <form.Subscribe
                  /* @ts-ignore */
                  selector={(state) => [
                    state.canSubmit,
                    state.isSubmitting,
                    state.isSubmitted,
                    state.errors,
                  ]}
                >
                  {/* @ts-ignore */}
                  {([canSubmit, isSubmitting]) =>
                    !submitted ? (
                      <div className="flex w-full flex-col justify-between gap-5 md:flex-row">
                        <div className="flex items-center justify-start space-x-2">
                          <Checkbox
                            id="disable"
                            checked={!disabled}
                            onCheckedChange={() => setDisabled(!disabled)}
                          />
                          <Label
                            htmlFor="disable"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            <Link href="/termsofservice" className="underline">
                              Agree to terms of service.
                            </Link>
                          </Label>
                        </div>
                        <div className="space-x-5">
                          <Button
                            type="submit"
                            disabled={disabled || !canSubmit}
                            variant="outline"
                            className="w-20"
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              "Send"
                            )}
                          </Button>
                          <AlertDialogCancel onClick={() => setDisabled(true)}>
                            Cancel
                          </AlertDialogCancel>
                        </div>
                      </div>
                    ) : (
                      <AlertDialogAction onClick={() => setSubmitted(false)}>
                        Close
                      </AlertDialogAction>
                    )
                  }
                </form.Subscribe>
              </AlertDialogFooter>
            </form>
          </form.Provider>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
