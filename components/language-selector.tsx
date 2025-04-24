"use client"

import { useState } from "react"
import { Check, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const languages = [
  { label: "English", value: "en" },
  { label: "Bahasa Indonesia", value: "id" },
  { label: "Español", value: "es" },
  { label: "Français", value: "fr" },
  { label: "Deutsch", value: "de" },
  { label: "Italiano", value: "it" },
  { label: "日本語", value: "ja" },
  { label: "한국어", value: "ko" },
  { label: "Português", value: "pt" },
  { label: "Русский", value: "ru" },
  { label: "简体中文", value: "zh" },
]

export function LanguageSelector() {
  const [open, setOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState({ label: "Bahasa Indonesia", value: "id" })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} size="icon" className="w-9 px-0">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Pilih bahasa</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Cari bahasa..." />
          <CommandList>
            <CommandEmpty>Bahasa tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.value}
                  value={language.value}
                  onSelect={(currentValue) => {
                    const selectedLang = languages.find((language) => language.value === currentValue)
                    if (selectedLang) {
                      setSelectedLanguage(selectedLang)
                    }
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedLanguage.value === language.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {language.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
