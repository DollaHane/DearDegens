"use client"
import React, { useState, useRef, useEffect } from "react"
import { io, Socket } from "socket.io-client"
import { roomType, messagesType, chatRoomType } from "@/src/types/db"
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTrigger,
} from "../components-ui/Sheet"
import { Loader2 } from "lucide-react"
import { Button } from "../components-ui/Button"
import { ScrollArea } from "../components-ui/ScrollArea"
import { Textarea } from "../components-ui/Textarea"
import { useSession } from "next-auth/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "@/src/hooks/use-toast"
import { useForm } from "@tanstack/react-form"
import { FieldApi } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import {
  ChatMessageCreationRequest,
  validateMessage,
} from "@/src/lib/validators/validateChatMessage"
import {
  onChangeAsync,
  onChangeAsyncDebounceMs,
} from "@/src/lib/validators/validateListing"
import { formatDateFromTimestamp } from "@/src/lib/utils"
import ChatRoomTrigger from "./ChatRoomTrigger"
import { cn } from "@/src/lib/utils"

interface ChatRoomProps {
  roomData: roomType
  messages: messagesType[]
  socket: Socket
}

type messageStateType = {
  message: string
  roomId: string
  userId: string | undefined
  userName: string | null | undefined
}

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

export default function ChatRoom({
  roomData,
  messages,
  socket
}: ChatRoomProps) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId: string = session?.user.id!
  
  const [disabled, setDisabled] = useState<boolean>(false)
  const [messagesRecieved, setMessagesReceived] = useState<any[]>([])
  
  useEffect(() => {
    setMessagesReceived(messages)
  }, [roomData.id, messages])

  // SET TRIGGER USER DETAILS
  const userName = () => {
    if (roomData.sellerId !== session?.user.id) {
      return (
        <ChatRoomTrigger
          roomData={roomData}
          userName={roomData.sellerName}
          userImage={roomData.sellerImage}
        />
      )
    } else {
      return (
        <ChatRoomTrigger
          roomData={roomData}
          userName={roomData.userName}
          userImage={roomData.userImage}
        />
      )
    }
  }

  // TANSTACK FORM
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
      message: "",
      roomId: roomData.id,
      userId: session?.user.id,
      userName: session?.user.name,
    },
    onSubmit: async ({ value }) => {
      const payload: ChatMessageCreationRequest = {
        message: value.message,
        roomId: roomData.id,
        userId: session?.user.id || "",
        userName: session?.user.name || "",
      }
      console.log("Payload:", payload)
      sendSocketMessage(payload)
    },
  })

  // SEND SOCKET MESSAGE
  const sendSocketMessage = ({ userName, roomId, message }: any) => {
    const createdAt: Date = new Date()
    socket.emit("send_message", { userName, userId, roomId, message, createdAt })
    form.reset()
  }

  // RECIEVE SOCKET MESSAGES
  useEffect(() => {
    socket.on("receive_message", (data: any) => {
      setMessagesReceived((state) => [
        {
          roomId: data.roomId,
          message: data.message,
          userName: data.userName,
          userId: data.userId,
          createdAt: data.createdAt,
        },
        ...state,
      ])
    })

    return () => {
      socket.off("receive_message")
    }
  }, [socket])


  return (
    <Sheet>
      <SheetTrigger className="w-full">
        <div className="h-full w-full">{userName()}</div>
      </SheetTrigger>
      <SheetContent className="backdrop-blur-xl bg-transparent">
        <SheetHeader className="z-40 mr-10 h-16 w-full bg-transparent pt-5 text-lg font-bold text-customAccent">
          <h1>Messages</h1>
          <div className="my-3 h-[1px] w-full bg-customAccent" />
        </SheetHeader>

        <div className="relative z-30 flex h-full w-full flex-col overflow-hidden">
          <div className="mb-5 flex w-full h-[60vh] overflow-hidden rounded-md">
            <ScrollArea className="flex w-full pr-5">
              {messagesRecieved &&
                messagesRecieved.map((msg: messagesType) => (
                  <div className="p-2">
                    {msg.roomId === roomData.id && (
                      <div
                        className="mt-3 flex flex-col rounded-2xl border border-muted shadow-md bg-background p-3"
                        key={msg.id}
                      >
                        <span
                          className={cn(
                            "flex text-xs font-bold italic text-primary",
                            session?.user.id === msg.userId &&
                              "justify-end text-customAccent"
                          )}
                        >
                          {msg.userName}
                        </span>
                        <p
                          className={cn(
                            "p-1 text-left text-sm text-primary",
                            session?.user.id === msg.userId &&
                              "justify-end text-right"
                          )}
                        >
                          {msg.message}
                        </p>
                        <span
                          className={cn(
                            "flex pl-1 text-left text-[10px] italic text-muted-foreground",
                            session?.user.id === msg.userId &&
                              "justify-end text-right"
                          )}
                        >
                          {formatDateFromTimestamp(msg.createdAt!)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              <div className="mt-3 flex flex-col justify-center rounded-2xl p-2 bg-background">
                <div className="flex justify-between">
                  <span className="flex w-full justify-start text-left text-xs font-bold italic text-primary">
                    DearDegens Admin
                  </span>
                </div>
                <p className="p-1 text-left text-xs italic text-muted-foreground">
                  Automated message: By participating in this chatroom, you
                  agree to abide by the content guidelines stipulated in our
                  terms of service. For any queries please contact us via
                  support@deardegens.com.
                </p>
                <span className="flex w-full justify-start pl-1 text-[10px] italic text-muted-foreground">
                  {formatDateFromTimestamp(roomData.createdAt!)}
                </span>
              </div>
              <div className="my-3 h-[1px] w-full bg-customAccent" />
              <p className="w-full text-end pr-2 text-xs italic text-muted-foreground">
                Chatroom opened: {formatDateFromTimestamp(roomData.createdAt!)}
              </p>
            </ScrollArea>
          </div>

          {/* SUBMIT MESSAGE */}
          <form.Provider>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void form.handleSubmit()
              }}
            >
              <div className="z-50 flex h-full w-full flex-col overflow-visible pr-5">
                <form.Field
                  name="message"
                  validators={{
                    onChange: validateMessage,
                    onChangeAsyncDebounceMs: onChangeAsyncDebounceMs,
                    onChangeAsync: onChangeAsync,
                  }}
                >
                  {(field) => (
                    <>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-full w-full bg-muted text-primary shadow-sm"
                        required
                      />
                    </>
                  )}
                </form.Field>
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
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={disabled || !canSubmit}
                      variant="outlineTwo"
                      className="z-50 mt-5 w-20 shadow-sm hover:bg-customAccent hover:text-zinc-100"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Send"
                      )}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </form.Provider>
        </div>
      </SheetContent>
    </Sheet>
  )
}
