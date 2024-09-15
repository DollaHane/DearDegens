import React from "react"
import { UserAvatar } from "../components-ui/UserAvatar"
import { formatDateFromTimestamp } from "@/src/lib/utils"
import { roomType } from "@/src/types/db"

interface ChatRoomTriggerProps {
  roomData: roomType
  userName: string
  userImage: string
}

export default function ChatRoomTrigger({
  roomData,
  userName,
  userImage,
}: ChatRoomTriggerProps) {
  return (
    <div className="group flex w-full flex-row bg-background items-center space-x-5 rounded-lg border border-muted p-2 text-primary shadow-md transition duration-75 hover:scale-[0.99]">
      <UserAvatar
        user={{
          name: userName,
          image: userImage,
        }}
        className="h-8 w-8"
      />
      <h1 className="w-full text-left">{userName}</h1>
      <span className="flex w-36 justify-end text-xs italic text-muted-foreground">
        {formatDateFromTimestamp(roomData.createdAt!)}
      </span>
    </div>
  )
}
