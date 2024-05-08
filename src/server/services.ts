"use client"
import { useQuery } from "@tanstack/react-query"

import {
  roomType,
  listingsType,
  messagesType,
  offerType,
  queryType,
  userType,
} from "../types/db"
import {
  getAdOffers,
  getAdQueries,
  getUserQueries,
  getListings,
  getNotifications,
  getBucket,
  getWishlist,
  getChatrooms,
  getMessages,
  getUserOffers
} from "./actions"

export function useGetQueries(listingId: any) {
  return useQuery<queryType[]>({
    queryKey: ["adQueries"],
    queryFn: () => listingId && getAdQueries(listingId),
  })
}

export function useGetUserQueries(userId: any, listingId: any) {
  return useQuery<queryType[]>({
    queryKey: ["userQueries"],
    queryFn: () => listingId && getUserQueries(userId, listingId),
  })
}

export function useGetOffers(listingId: any) {
  return useQuery<offerType[]>({
    queryKey: ["adOffers"],
    queryFn: () => listingId && getAdOffers(listingId),
  })
}

export function useGetUserOffers(userId: any, listingId: any) {
  return useQuery<offerType[]>({
    queryKey: ["userOffers"],
    queryFn: () => userId && getUserOffers(userId, listingId),
  })
}

export function useGetWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => getWishlist(),
  })
}

export function useGetBucket() {
  return useQuery({
    queryKey: ["getBucket"],
    queryFn: getBucket,
  })
}

export function useGetNotifications() {
  return useQuery({
    queryKey: ["notify"],
    queryFn: getNotifications,
  })
}


export function useGetListing(listingId: any) {
  return useQuery<listingsType[]>({
    queryKey: ["listing"],
    queryFn: () => listingId && getListings(listingId),
  })
}

export function useGetChatrooms(mintId: any) {
  return useQuery<roomType[]>({
    queryKey: ["chatroom"],
    queryFn: () => mintId && getChatrooms(mintId),
  })
}

export function useGetMessages(roomId: any) {
  return useQuery<messagesType[]>({
    queryKey: ["messages"],
    queryFn: () => roomId && getMessages(roomId),
    refetchInterval: 1000,
  })
}
