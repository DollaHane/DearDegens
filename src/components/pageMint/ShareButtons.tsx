"use client"
import { useParams } from "next/navigation"
import React, { useState } from "react"
import { Facebook } from "lucide-react"
import { FaXTwitter } from "react-icons/fa6"
import { FaWhatsapp } from "react-icons/fa"
import { Share2, ExternalLink } from "lucide-react"
import { toast } from "@/src/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/components-ui/DropdownMenu"
import { Button } from "../components-ui/Button"
import { cn } from "@/src/lib/utils"

import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share"

interface ShareButtonProps {
  domain: string
}

export default function ShareButtons(domain: ShareButtonProps) {
  const params = useParams()
  const url = `${domain.domain}/${params?.title}/${params?.brand}/${params?.model}/${params?.subcategory}/${params?.location}/${params?.listingId}`

  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false)
  const tooltip = document.getElementById("shareTrigger")
  tooltip?.addEventListener("mouseover", () => {
    setTooltipVisible(true)
  })
  tooltip?.addEventListener("mouseout", () => {
    setTooltipVisible(false)
  })

  return (
    <div className="items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger
          id="shareTrigger"
          className="relative flex h-10 w-10 items-center justify-center focus:outline-none"
        >
          <p
            className={cn(
              "absolute -top-10 hidden h-8 w-[75px] items-center justify-center rounded-md border border-muted bg-background p-1 text-center text-xs text-primary opacity-0 shadow-md",
              tooltipVisible &&
                "opacity-100 flex transition-opacity duration-200 ease-in"
            )}
          >
            Share Ad
          </p>
          <Share2 className="h-6 w-6 hover:text-customAccent" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex flex-row gap-3">
          <DropdownMenuItem asChild>
            <FacebookShareButton
              url={url}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-primary"
            >
              <Facebook className="h-6 w-6 hover:text-sky-500" />
            </FacebookShareButton>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <TwitterShareButton
              url={url}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-primary"
            >
              <FaXTwitter className="h-6 w-6 hover:text-zinc-400" />
            </TwitterShareButton>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <WhatsappShareButton
              url={url}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-primary"
            >
              <FaWhatsapp className="h-7 w-7 hover:text-lime-500" />
            </WhatsappShareButton>
          </DropdownMenuItem>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(url)
              return toast({
                description: "Copied to clipboard",
              })
            }}
            className="relative flex h-[42px] w-[42px]"
            variant="icon"
          >
            <ExternalLink className="absolute flex h-6 w-6 hover:text-customAccent" />
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
