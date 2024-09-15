"use client"
import React, { useState, useEffect } from "react"
import { io, Socket } from "socket.io-client"
import { MessageCircle } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components-ui/Sheet"
import { messagesType, roomType, chatRoomType } from "@/src/types/db"
import { useSession } from "next-auth/react"
import { useGetChatrooms, useGetMessages } from "@/src/server/services"
import ChatRoom from "./ChatRoom"
import ChatRoomSkeleton from "./ChatRoomSkeleton"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/src/lib/utils"

interface ChatSheetProps {
  listingId: any
}

export default function ChatSheet({ listingId }: ChatSheetProps) {
  // SOCKET
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [transport, setTransport] = useState("N/A")
  const [selectedRoom, setSelectedRoom] = useState<string>("")
  const socket: Socket = io("http://localhost:8000")
  const { data: session } = useSession()
  const userId = session?.user.id
  const userName = session?.user.name!

  console.log('selectedRoom', selectedRoom)

  // TANSTACK QUERY
  const queryClient = useQueryClient()
  const messages = useGetMessages(selectedRoom).data as messagesType[]
  const { data, isFetching } = useGetChatrooms(listingId)

  const chatRoomData: roomType[] = []
  const filteredRoom =
    data &&
    data.map((data: roomType) => {
      if (data.sellerId === userId || data.userId === userId) {
        chatRoomData.push(data)
      }
    })

  // INVALIDATE LISTING CHAT
  const handleInvalidateChat = async () => {
    await queryClient.invalidateQueries({ queryKey: ["chatroom", listingId] })
  }

  // INVALIDATE LISTING CHAT
  const handleInvalidateMessages = async (roomId: string) => {
    await queryClient.invalidateQueries({ queryKey: ["messages", roomId] })
  }

  useEffect(() => {
    handleInvalidateMessages(selectedRoom)
  }, [selectedRoom])

  // SOCKET CONNECTION
  useEffect(() => {
    if (socket.connected) {
      onConnect()
    }

    function onConnect() {
      setIsConnected(true)
      setTransport(socket.io.engine.transport.name)

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name)
      })
    }

    function onDisconnect() {
      setIsConnected(false)
      setTransport("N/A")
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
    }
  }, [])

  // JOIN ROOM
  const joinRoom = (roomId: string) => {
    setSelectedRoom(roomId)
    // handleInvalidateMessages(roomId)
    const room = { roomId, userName, userId }
    if (room.roomId !== "") {
      socket.emit("join_room", room)
    }
  }

  // TOOLTIP
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false)
  const tooltip = document.getElementById("chatTrigger")
  tooltip?.addEventListener("mouseover", () => {
    setTooltipVisible(true)
  })
  tooltip?.addEventListener("mouseout", () => {
    setTooltipVisible(false)
  })

  return (
    <Sheet>
      <SheetTrigger
        id="chatTrigger"
        className="group relative flex h-10 min-w-10 items-center justify-center hover:text-blue-500"
        onClick={handleInvalidateChat}
      >
        <p
          className={cn(
            "absolute -top-10 h-8 w-[85px] hidden items-center justify-center rounded-md border border-muted bg-background p-1 text-center text-xs text-primary opacity-0 shadow-md",
            tooltipVisible &&
              "opacity-100 flex transition-opacity duration-200 ease-in"
          )}
        >
          Chat Room
        </p>
        <MessageCircle />
      </SheetTrigger>
      <SheetContent className="backdrop-blur-xl bg-transparent">
        <SheetHeader className="h-full">
          <SheetTitle className="text-customAccent">Chat Rooms</SheetTitle>
          <div className="flex items-center justify-end gap-2">
            <p className="text-xs">Connection Status:</p>
            {isConnected ? (
              <div className="w-3 h-3 rounded-full shadow-md bg-green-500"/>
            ):(
              <div className="w-3 h-3 rounded-full shadow-md bg-red-500"/>
            )}
          </div>
          {isFetching === true ? (
            <div className="pt-3">
              <ChatRoomSkeleton />
            </div>
          ) : (
            <div className="h-full pt-3">
              {chatRoomData && chatRoomData.length > 0 ? (
                <div className="flex flex-col space-y-1">
                  {chatRoomData.map((data: roomType, index) => {
                    return (
                      <div onClick={() => joinRoom(data.id)} key={index} className="w-full">
                        <ChatRoom
                          roomData={data}
                          messages={messages!}
                          socket={socket}
                          key={data.id}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-left text-primary">
                  <h1 className="mb-2 text-lg font-bold">No Rooms Available</h1>
                  <p>
                    You must have a confirmed offer to use the chat
                    functionality
                  </p>
                </div>
              )}
            </div>
          )}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}
