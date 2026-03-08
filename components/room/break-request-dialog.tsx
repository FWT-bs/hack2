"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { breakRequestSchema, type BreakRequestValues } from "@/lib/validators"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function BreakRequestDialog({ open, onOpenChange, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BreakRequestValues>({
    resolver: zodResolver(breakRequestSchema),
    defaultValues: { requested_break_minutes: 5 },
  })

  function onFormSubmit() {
    onSubmit()
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a Break</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Why do you need a break?</Label>
            <Textarea id="reason" placeholder="I need to..." {...register("reason")} />
            {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="accomplishment_note">What have you accomplished so far?</Label>
            <Textarea id="accomplishment_note" placeholder="I've completed..." {...register("accomplishment_note")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requested_break_minutes">Break duration (minutes)</Label>
            <Input id="requested_break_minutes" type="number" min={1} max={30} {...register("requested_break_minutes", { valueAsNumber: true })} />
            {errors.requested_break_minutes && <p className="text-sm text-destructive">{errors.requested_break_minutes.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
