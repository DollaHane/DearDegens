"use client"
import React, { useState, useEffect, useRef } from "react"
import { Input } from "../components-ui/Input"
import { Button } from "../components-ui/Button"
import { ScrollArea } from "../components-ui/ScrollArea"
import { Socket } from "socket.io-client"

interface MessageProps {
  socket: Socket
  room: string
  username: string
}

export default function Messages({ socket, room, username }: MessageProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const userName: string = username
  const roomId: string = room
  const [message, setMessage] = useState<string>()
  const [messagesRecieved, setMessagesReceived] = useState<any[]>([])

  useEffect(() => {
    setMessagesReceived([])
  }, [room]);

  // SEND MESSAGES
  const sendMessage = () => {
    if (message !== "") {
      const __createdtime__ = Date.now()
      socket.emit("send_message", { username, room, message, __createdtime__ })
      setMessage("")
    }
  }

  // RECIEVE MESSAGES
  useEffect(() => {
    socket.on("receive_message", (data: any) => {
        console.log('data', data)
        setMessagesReceived((state) => [
          ...state,
          {
            roomId: data.roomId,
            message: data.message,
            userName: data.userName,
            __createdtime__: data.__createdtime__,
          },
        ])
    })

    return () => {socket.off("receive_message")}
  }, [socket])


  // FORMAT TIMESTAMP
  function formatDateFromTimestamp(timestamp: Date) {
    const date = new Date(timestamp)

    const day = date.getDate()
    const month = date.toLocaleString("default", { month: "short" })
    const hour = date.getHours()
    const minute = date.getMinutes()

    const formattedDate = `${day} ${month} ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

    return formattedDate
  }

  // FOCUS ON NEW MESSAGE
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messagesRecieved])

  console.log('messages:', messagesRecieved)

  return (
    <div className="relative flex flex-col h-full w-full">
      <h1 className="z-40 w-full bg-background p-2 text-left font-bold text-primary">
        Messages:
      </h1>
      <div className=" mt-5 flex w-full flex-row items-center justify-center">
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="h-10 w-full text-primary"
        />
        <Button
          variant="outline"
          className="ml-3 text-primary"
          onClick={sendMessage}
        >
          Send
        </Button>
      </div>
      <div className=" flex w-full flex-col justify-end rounded-md">
        <ScrollArea className="mt-5 pr-5">
          {messagesRecieved.map((msg, i) => (
            <div
              className="mt-3 flex flex-col justify-center rounded-md border border-muted bg-background p-2 shadow-lg"
              key={i}
              // ref={i === messagesRecieved.length - 1 ? bottomRef : null}
            >
              <div className="flex justify-between">
                <span className="flex font-bold text-customAccent">
                  {msg.username}
                </span>
              </div>
              <p className="p-1 text-left text-primary">{msg.message}</p>
              <span className="flex w-full justify-end text-xs italic text-muted-foreground">
                {msg.room}
              </span>
              <span className="flex w-full justify-end text-xs italic text-muted-foreground">
                {formatDateFromTimestamp(msg.__createdtime__)}
              </span>
            </div>
          ))}
        </ScrollArea>
      </div>

      
    </div>
  )
}
