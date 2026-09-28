"use client"

import * as React from "react"
import { useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  createSpeciality,
  deleteSpeciality,
  getAllSpecialities,
  updateSpeciality,
  Speciality,
  SPECIALITIES_SWR_KEY,
} from "@/lib/api/specialities"
import { Loader2, Plus, Edit, Trash2 } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/dialogs/confirm-dialog"

interface SpecialityManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SpecialityManagementDialog({
  open,
  onOpenChange,
}: SpecialityManagementDialogProps) {
  const { mutate } = useSWRConfig()
  const {
    data: specialities,
    isLoading,
    error,
  } = useSWR<Speciality[]>(SPECIALITIES_SWR_KEY, getAllSpecialities)

  const [editSpeciality, setEditSpeciality] = useState<Speciality | null>(null)
  const [newSpecialityName, setNewSpecialityName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState<Speciality | null>(null)

  const resetForm = () => {
    setEditSpeciality(null)
    setNewSpecialityName("")
  }

  const handleAddClick = () => {
    resetForm()
    // A bit of a hack to represent "new"
    setEditSpeciality({ id: -1, name: "" })
  }

  const handleCancelEdit = () => {
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSpecialityName.trim()) {
      toast.error("Speciality name cannot be empty.")
      return
    }

    setIsSubmitting(true)
    try {
      if (editSpeciality && editSpeciality.id !== -1) {
        // Update
        await updateSpeciality(editSpeciality.id, newSpecialityName)
        toast.success("Speciality updated successfully.")
      } else {
        // Create
        await createSpeciality(newSpecialityName)
        toast.success("Speciality created successfully.")
      }
      mutate(SPECIALITIES_SWR_KEY)
      resetForm()
    } catch (error) {
      console.error("Failed to save speciality:", error)
      toast.error("Failed to save speciality.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteCandidate) return
    setIsSubmitting(true)
    try {
      await deleteSpeciality(deleteCandidate.id)
      toast.success(`Speciality "${deleteCandidate.name}" deleted.`)
      mutate(SPECIALITIES_SWR_KEY)
      setDeleteCandidate(null)
    } catch (error) {
      console.error("Failed to delete speciality:", error)
      toast.error("Failed to delete speciality.")
    } finally {
      setIsSubmitting(false)
    }
  }

  React.useEffect(() => {
    if (editSpeciality) {
      setNewSpecialityName(editSpeciality.name)
    }
  }, [editSpeciality])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Specialities</DialogTitle>
            <DialogDescription>
              Add, edit, or delete trainer specialities.
            </DialogDescription>
          </DialogHeader>

          {editSpeciality ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-semibold">
                {editSpeciality.id === -1
                  ? "Add New Speciality"
                  : "Edit Speciality"}
              </h3>
              <div>
                <Label htmlFor="speciality-name">Speciality Name</Label>
                <Input
                  id="speciality-name"
                  value={newSpecialityName}
                  onChange={(e) => setNewSpecialityName(e.target.value)}
                  placeholder="e.g., Frontend Development"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex justify-end">
                <Button onClick={handleAddClick}>
                  <Plus className="mr-2 h-4 w-4" /> Add New
                </Button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center text-destructive"
                        >
                          Failed to load specialities.
                        </TableCell>
                      </TableRow>
                    ) : (
                      specialities?.map((spec) => (
                        <TableRow key={spec.id}>
                          <TableCell className="font-medium">
                            {spec.name}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditSpeciality(spec)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteCandidate(spec)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleteCandidate}
        onOpenChange={(isOpen) => !isOpen && setDeleteCandidate(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteCandidate?.name}"?`}
        description="This action cannot be undone. This will permanently delete the speciality."
        confirmText="Delete"
        type="destructive"
        loading={isSubmitting}
      />
    </>
  )
} 