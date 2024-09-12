"use client"
import React, { useEffect, useState } from "react"
import Messages from "@/src/components/chatroomTest/Messages"
import Room from "@/src/components/chatroomTest/Room"
import { io, Socket } from "socket.io-client"
import { useSession } from "next-auth/react"

export default function Chat() {
  const socket: Socket = io("http://localhost:8000")

  const rooms = ["Room A", "Room B"]
  const { data: session } = useSession()
  const username: string = session?.user.name!

  console.log("Room Socket:", socket)

  const [room, setRoom] = useState<string>("")
  console.log("room:", room)

  useEffect(() => {
    if (room !== "") {
      socket.emit("join_room", { room: room, username: username })
    }
  }, [room])

  return (
    <section className="h-screen w-11/12 mb-32">
      <h1 className="flex h-20 w-full items-center justify-center text-center text-xl">
        Chat Test
      </h1>
      <div className="flex flex-row">
        <div className="h-full w-3/12">
          {rooms.map((room) => (
            <div onClick={() => setRoom(room)}>
              <h1>{room}</h1>
            </div>
          ))}
        </div>
        <div className="h-full w-9/12">
          <Messages socket={socket} room={room} username={username} />
        </div>
      </div>
    </section>
  )
}
