"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components-ui/Select"
import { FieldLabel } from "../pageCreateMint/FieldLabel"
import { Button } from "@/src/components/components-ui/Button"
import { toast } from "@/src/hooks/use-toast"
import {
  ReportCreationRequest,
  reportDescription,
} from "@/src/lib/validators/validateReport"
import { useForm } from "@tanstack/react-form"
import type { FieldApi } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { Loader2, AlertTriangle } from "lucide-react"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { Checkbox } from "../components-ui/Checkbox"
import { Label } from "../components-ui/Label"
import { Textarea } from "../components-ui/Textarea"
import { activities } from "@/src/lib/categories/Report"
import { listingsType } from "@/src/types/db"
import { cn } from "@/src/lib/utils"

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

interface MintReportProps {
  listing: listingsType
}

export default function MintReport({ listing }: MintReportProps) {
  const [disabled, setDisabled] = useState<boolean>(true)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [infraction, setInfraction] = useState<string>("")
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false)
  const tooltip = document.getElementById("reportTrigger")
  tooltip?.addEventListener("mouseover", () => {
    setTooltipVisible(true)
  })
  tooltip?.addEventListener("mouseout", () => {
    setTooltipVisible(false)
  })

  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
      description: "",
      infraction: "",
      adId: listing?.id,
      sellerId: listing?.authorId,
    },
    onSubmit: async ({ value }) => {
      const payload: ReportCreationRequest = {
        description: value.description,
        infraction: infraction,
        adId: listing?.id || "",
        sellerId: listing?.authorId || "",
      }
      createQuery(payload)
      setDisabled(true)
      console.log("Submit Payload:", payload)
    },
  })

  const { mutate: createQuery } = useMutation({
    // PAYLOAD
    mutationFn: async ({
      description,
      infraction,
      adId,
      sellerId,
    }: ReportCreationRequest) => {
      const payload: ReportCreationRequest = {
        description,
        infraction,
        adId,
        sellerId,
      }

      const { data } = await axios.post("/api/createListingReport", payload)

      return data
    },
    onError: () => {
      return toast({
        title: "Something went wrong.",
        description:
          "There was an error sending your report. Please try again.",
        variant: "destructive",
      })
    },
    onSuccess: () => {
      setSubmitted(true)
      return toast({
        description: "Your report is on the way to DearDegens Support.",
      })
    },
    onSettled: async (_, error) => {
      if (error) {
        console.log("onSettled error:", error)
      }
    },
  })

  return (
    <div>
      <AlertDialog>
        <AlertDialogTrigger
          id="reportTrigger"
          className="group relative flex h-10 w-10 items-center justify-center hover:text-orange-500"
        >
          <p
            className={cn(
              "absolute -top-10 hidden h-8 w-[85px] items-center justify-center rounded-md border border-muted bg-background p-1 text-center text-xs text-primary opacity-0 shadow-md",
              tooltipVisible &&
                "opacity-100 flex transition-opacity duration-200 ease-in"
            )}
          >
            Report Ad
          </p>
          <AlertTriangle />
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
                  <p className="italic">Report listing:</p>
                </AlertDialogTitle>

                <AlertDialogDescription>
                  <div className="relative mb-10 grid grid-cols-1 gap-2">
                    {/* CATEGORY */}
                    <form.Field name="infraction">
                      {(field) => {
                        return (
                          <div className="relative mb-10 w-full flex-col">
                            <div className="flex w-full justify-between">
                              <FieldLabel>
                                Listing contains / promotes:
                              </FieldLabel>
                              <FieldLabel className="py-2 text-xs italic text-rose-400">
                                (required)
                              </FieldLabel>
                            </div>

                            <Select
                              required
                              onValueChange={(event) => setInfraction(event)}
                            >
                              <SelectTrigger className="w-full text-primary">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-96 overflow-auto p-2">
                                {activities.map((item, index) => (
                                  <div key={index}>
                                    <SelectItem
                                      className="border-2 text-primary hover:border-customAccent"
                                      value={item}
                                      key={item}
                                    >
                                      {item}
                                    </SelectItem>
                                  </div>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )
                      }}
                    </form.Field>

                    {/* DESCRIPTION */}
                    <form.Field
                      name="description"
                      validators={{
                        onChange: reportDescription,
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
                              Additional information:
                            </label>
                            <label className="py-1 text-xs italic text-rose-400">
                              (optional)
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
                      (Note: This report will not be shared with the owner of
                      the listing. Once we recieve your report, we will evaluate
                      the contents of the report against our terms of service
                      and DearDegens disclaimer. In the event of an infringment,
                      we will remove the listing and notify the seller and
                      authorities if necessary. Repeat offences will result in
                      the users account being blocked.)
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
