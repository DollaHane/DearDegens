import React, { useState, useEffect } from "react"
import { Button } from "../components-ui/Button"
import { FieldLabel } from "../pageCreateMint/FieldLabel"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components-ui/Select"
import { Input } from "../components-ui/Input"
import { listingCategories } from "@/src/lib/categories/AdCategories"
import { southAfricaSearch } from "@/src/lib/locations/southAfricaSearch"
import { ScrollArea } from "../components-ui/ScrollArea"
import { useQueryClient } from "@tanstack/react-query"
import { currentYear } from "@/src/lib/utils"
import { SheetClose } from "../components-ui/Sheet"

interface MintFilterProps {
  setFilterCallback: (data: any) => void
  initPayload: {
    tab: string
    category: string
    subCategory: string
    priceMin: number
    priceMax: number
    location: string
    mileageMin: number
    mileageMax: number
    yearMin: number
    yearMax: number
    transmission: string
  }
}

export default function MintFilterCategories({
  setFilterCallback,
  initPayload,
}: MintFilterProps) {
  const [type, setType] = useState<string>(initPayload.tab)
  const [category, setCategory] = useState<string>(initPayload.category)
  const [subCategory, setSubCategory] = useState<string>(
    initPayload.subCategory
  )
  const [priceMin, setPriceMin] = useState<number>(initPayload.priceMin)
  const [priceMax, setPriceMax] = useState<number>(initPayload.priceMax)
  const [location, setLocation] = useState<string>(initPayload.location)
  const [mileageMin, setMileageMin] = useState<number>(initPayload.mileageMin)
  const [mileageMax, setMileageMax] = useState<number>(initPayload.mileageMax)
  const [yearMin, setYearMin] = useState<number>(initPayload.yearMin)
  const [yearMax, setYearMax] = useState<number>(initPayload.yearMax)
  const [transmission, setTransmission] = useState<string>(
    initPayload.transmission
  )

  const queryClient = useQueryClient()

  const mainCategories = listingCategories.filter((item, index) => {
    if (item.type === type) {
      return item.categories.map((sub) => sub)
    }
  })

  const { categories } = mainCategories[0] || [""]

  const subcategories =
    categories &&
    categories.filter((item) => {
      if (item.name === category) {
        return item.subCategories.map((subs) => subs)
      }
    })

  const [payload, setPayload] = useState<any>({
    tab: type,
    category: category,
    subCategory: subCategory,
    priceMin: priceMin,
    priceMax: priceMax,
    location: location,
    mileageMin: mileageMin,
    mileageMax: mileageMax,
    yearMin: yearMin,
    yearMax: yearMax,
    transmission: transmission,
  })

  const sendSetFilterCallback = async (payload: any) => {
    setFilterCallback(payload)
    await queryClient.invalidateQueries({ queryKey: [`${type}`] })
  }

  useEffect(() => {
    setFilterCallback(payload)
  }, [payload])

  useEffect(() => {
    setPayload({
      tab: type,
      category: category,
      subCategory: subCategory,
      priceMin: priceMin,
      priceMax: priceMax,
      location: location,
      mileageMin: mileageMin,
      mileageMax: mileageMax,
      yearMin: yearMin,
      yearMax: yearMax,
      transmission: transmission,
    })
  }, [
    type,
    category,
    subCategory,
    priceMin,
    priceMax,
    location,
    mileageMin,
    mileageMax,
    yearMin,
    yearMax,
    transmission,
  ])

  const setDefaultPayload = async () => {
    setCategory("")
    setSubCategory("")
    setPriceMin(0)
    setPriceMax(9999999)
    setLocation("")
    setMileageMin(0)
    setMileageMax(300000)
    setYearMin(1900)
    setYearMax(currentYear)
    setTransmission("")
    setFilterCallback(payload)
    await queryClient.invalidateQueries({ queryKey: [`${type}`] })
  }

  return (
    <ScrollArea className="mt-10 flex h-full flex-col pb-20 pr-5">
      <div className="space-y-3">
        <div>
          <FieldLabel>Category:</FieldLabel>
          <Select
            required
            onValueChange={(event) => setCategory(event)}
            defaultValue={category}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-96 overflow-auto p-2">
              {categories &&
                categories.map((item, index) => (
                  <div key={index}>
                    <SelectItem
                      className="text-primary"
                      value={item.name}
                      key={item.name}
                    >
                      {item.name}
                    </SelectItem>
                  </div>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <FieldLabel>Sub-category:</FieldLabel>
          <Select
            required
            onValueChange={(event) => setSubCategory(event)}
            defaultValue={subCategory}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-96 overflow-auto p-2">
              {subcategories &&
                subcategories.map((item, index) => (
                  <div key={index}>
                    <p
                      className="text-lg font-bold text-primary"
                      key={item.name}
                    >
                      {item.name}
                    </p>
                    <hr className="mb-5 mt-2 border border-muted"></hr>
                    {item.subCategories.map((subs) => (
                      <SelectItem key={subs} value={subs}>
                        {subs}
                      </SelectItem>
                    ))}
                  </div>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <FieldLabel>Location:</FieldLabel>
          <Select
            required
            onValueChange={(event) => setLocation(event)}
            defaultValue={location}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-96 overflow-auto p-2">
              {southAfricaSearch.map((category: any, index: any) => (
                <div key={index}>
                  <hr className="mb-10"></hr>
                  <p
                    className="text-lg font-bold text-primary"
                    key={category.name}
                  >
                    {category.name}
                  </p>
                  {category.subCategories.map((subs: any) => (
                    <SelectItem key={subs} value={subs}>
                      {subs}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-full flex-row">
          <div className="pr-5">
            <FieldLabel>Price Min:</FieldLabel>
            <Input
              type="number"
              id="priceMin"
              placeholder=""
              defaultValue={priceMin}
              onChange={(event) => setPriceMin(parseInt(event.target.value))}
            />
          </div>
          <div>
            <FieldLabel>Price Max:</FieldLabel>
            <Input
              type="number"
              id="priceMax"
              placeholder=""
              defaultValue={priceMax}
              onChange={(event) => setPriceMax(parseInt(event.target.value))}
            />
          </div>
        </div>

        {type === "Vehicles" && (
          <>
            <div className="flex w-full flex-row">
              <div className="pr-5">
                <FieldLabel>Mileage Min:</FieldLabel>
                <Input
                  type="number"
                  id="mileageMin"
                  placeholder=""
                  defaultValue={mileageMin}
                  onChange={(event) =>
                    setMileageMin(parseInt(event.target.value))
                  }
                />
              </div>
              <div>
                <FieldLabel>Mileage Max:</FieldLabel>
                <Input
                  type="number"
                  id="mileageMax"
                  placeholder=""
                  defaultValue={mileageMax}
                  onChange={(event) =>
                    setMileageMax(parseInt(event.target.value))
                  }
                />
              </div>
            </div>
            <div className="flex w-full flex-row">
              <div className="pr-5">
                <FieldLabel>Year Min:</FieldLabel>
                <Input
                  type="number"
                  id="yearMin"
                  placeholder=""
                  defaultValue={yearMin}
                  onChange={(event) => setYearMin(parseInt(event.target.value))}
                />
              </div>
              <div>
                <FieldLabel>Year Max:</FieldLabel>
                <Input
                  type="number"
                  id="yearMax"
                  placeholder=""
                  defaultValue={yearMax}
                  onChange={(event) => setYearMax(parseInt(event.target.value))}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Transmission:</FieldLabel>
              <Select
                required
                onValueChange={(event) => setTransmission(event)}
                defaultValue={transmission}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-96 overflow-auto p-2">
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        <div className="flex flex-row gap-5 pt-5">
          <Button
            variant="outlineTwo"
            onClick={() => sendSetFilterCallback(payload)}
            className="w-20"
          >
            Filter
          </Button>
          <Button onClick={setDefaultPayload} className="w-20">
            Reset
          </Button>
          <SheetClose className="h-10 w-20 rounded-full bg-background shadow-lg hover:bg-muted">
            Close
          </SheetClose>
        </div>
      </div>
    </ScrollArea>
  )
}
