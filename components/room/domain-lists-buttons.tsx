"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { DomainListsCard } from "./domain-lists-card"
import { ShieldCheck, ShieldX } from "lucide-react"

export function DomainListsButtons() {
  const [openFor, setOpenFor] = useState<"allowed" | "blocked" | null>(null)

  const open = openFor !== null

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-green-500/40 text-green-700 dark:text-green-400 hover:bg-green-500/10"
          onClick={() => setOpenFor("allowed")}
        >
          <ShieldCheck className="h-4 w-4" />
          Allowed sites
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-red-500/40 text-red-700 dark:text-red-400 hover:bg-red-500/10"
          onClick={() => setOpenFor("blocked")}
        >
          <ShieldX className="h-4 w-4" />
          Blocked sites
        </Button>
      </div>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOpenFor(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {openFor === "blocked" ? "Blocked sites" : "Allowed sites"}
            </DialogTitle>
            <DialogDescription>
              Manage which websites are allowed or blocked during your session.
              Changes apply to everyone in this demo room.
            </DialogDescription>
          </DialogHeader>
          <DomainListsCard />
        </DialogContent>
      </Dialog>
    </>
  )
}

