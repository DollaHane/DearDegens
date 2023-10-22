"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { Bell } from "lucide-react"

import { formatTimeToNow } from "../lib/utils"
import { notificationsType } from "../types/db"
import { setUnReadNotifications } from "./components-global/store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components-ui/Dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components-ui/DropdownMenu"

interface NotificationsNavProps {
  notification: notificationsType
  isRead: notificationsType
}

type Notication = {
  id: string
  adId: string
  title: string
  body: string
  createdAt: Date
}

export function NotificationsNav({
  notification,
  isRead,
}: NotificationsNavProps) {
  const initialUnreadNotifications = isRead.length
  const [unReadNotifications, setUnReadNotifications] = useState<number>(
    initialUnreadNotifications
  )
  const [selectedNotificationId, setSelectedNotificationId] =
    useState<string>("")
  const [displayedNotification, setDisplayedNotification] =
    useState<Notication | null>()

  const getUnreadNotifications = async () => {
    try {
      const response = await axios.get("/api/getNotification")

      const unreadNotifications = response.data
      setUnReadNotifications(unreadNotifications)
      return "Successfully fetched unread notifications!"
    } catch (error) {
      console.error(
        "Error fetching unread notifications, please try again later.",
        error
      )
      setUnReadNotifications(0)
    }
  }

  const handleNotificationSelected = async (notify: any) => {
    setSelectedNotificationId(notify.id)
    setUnReadNotifications(initialUnreadNotifications - 1)
    try {
      const response = await axios.put("/api/readNotification", notify.id)

      const updatedIsRead = response.data
      setUnReadNotifications(updatedIsRead)
      return "Notification successfully read"
    } catch (error) {
      console.error("Error updating notification read status:", error)
      setUnReadNotifications(initialUnreadNotifications)
    }
  }

  useEffect(() => {
    getUnreadNotifications()
  }, [selectedNotificationId])

  useEffect(() => {
    const selectedNotification = notification.find(
      (notifications: any) => notifications.id === selectedNotificationId
    )
    if (selectedNotification) {
      setDisplayedNotification(selectedNotification)
    }
  }, [selectedNotificationId])

  return (
    <div>
      <Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="relative">
              <Bell className="w-6 h-6" />
              {isRead.length > 0 && (
                <div className="absolute flex -top-3 -right-3 w-6 h-6 bg-red-500 content-center rounded-full shadow-md">
                  <p className="absolute top-1 w-full mx-auto text-white text-xs text-center">
                    {unReadNotifications}
                  </p>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="relative max-h-[350px] overflow-y-auto"
            align="end"
          >
            <h1 className="font-bold">Notifications</h1>
            {notification.map((notify: any, index: number) => (
              <div key={index} className="relative">
                <DropdownMenuSeparator />
                <DialogTrigger
                  onClick={() => handleNotificationSelected(notify)}
                >
                  {notify.isRead === false ? (
                    <DropdownMenuItem asChild className="text-start w-64">
                      <div className="grid grid-cols-1 w-full content-start border-teal-500 border-2 bg-teal-300/10">
                        <h1 className="font-semibold truncate">
                          {notify.title}
                        </h1>
                        <div className="flex max-h-40 gap-1 text-xs italic text-secondary">
                          <span>Created</span>
                          {formatTimeToNow(new Date(notify.createdAt))}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild className="text-start w-64">
                      <div className="grid grid-cols-1 w-full content-start">
                        <h1 className="font-semibold truncate">
                          {notify.title}
                        </h1>
                        <div className="flex max-h-40 gap-1 text-xs italic text-secondary">
                          <span>Created</span>
                          {formatTimeToNow(new Date(notify.createdAt))}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )}
                </DialogTrigger>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {displayedNotification && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-5">
                {displayedNotification.title}
              </DialogTitle>
              <DialogDescription className="text-primary">
                <p className="mb-5">{displayedNotification.body}</p>
                <Link href={`/p/mint/${displayedNotification.adId}`}>
                  <p className="italic">Follow this link to the ad</p>
                </Link>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="flex max-h-40 gap-1 text-xs italic text-secondary">
                <span>Created</span>
                {formatTimeToNow(new Date(displayedNotification.createdAt))}
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}