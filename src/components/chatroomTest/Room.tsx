"use client"
import React, { useState } from "react"


export default function Room({ socket }: any) {
  console.log('Room Socket:', socket)
  const roomId = "jbdejhbew76kjas"
  const username: string = "Shane"

  const [room, setRoom] = useState<string>(roomId)
  console.log("room:", room)

  const joinRoom = () => {
    setRoom(roomId)
    const room ={roomId, username}
    if (room.roomId !== "") {
      socket.emit("join_room", room)
    }
  }

  return (
    <div
      onClick={joinRoom}
      className="h-20 w-full border border-transparent shadow-lg hover:border-customAccent"
    >
      {username}
      {room}
    </div>
  )
}
