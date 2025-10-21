'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { FacebookUrl } from '@/lib/supabase/listings'
import { ExternalLink, Trash2, Plus, Copy, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface FacebookUrlsManagerProps {
  listingId: string
  facebookUrls: FacebookUrl[]
  onAdd: (url: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onRefresh: () => Promise<void>
}

export function FacebookUrlsManager({
  facebookUrls,
  onAdd,
  onDelete,
  onRefresh,
}: FacebookUrlsManagerProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [urlToDelete, setUrlToDelete] = useState<FacebookUrl | null>(null)
  const [newUrl, setNewUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!newUrl.trim()) {
      toast.error('Please enter a Facebook URL')
      return
    }

    // Validate Facebook URL
    if (!newUrl.includes('facebook.com') && !newUrl.includes('fb.com')) {
      toast.error('Please enter a valid Facebook URL')
      return
    }

    setIsSubmitting(true)
    try {
      await onAdd(newUrl)
      setNewUrl('')
      setAddDialogOpen(false)
      toast.success('Facebook URL added successfully')
      await onRefresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add Facebook URL')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!urlToDelete) return

    setIsSubmitting(true)
    try {
      await onDelete(urlToDelete.id)
      setDeleteDialogOpen(false)
      setUrlToDelete(null)
      toast.success('Facebook URL deleted successfully')
      await onRefresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete Facebook URL')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      toast.success('URL copied to clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Failed to copy URL')
    }
  }

  const openDeleteDialog = (url: FacebookUrl) => {
    setUrlToDelete(url)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Facebook Post URLs</h3>
        <Button onClick={() => setAddDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Facebook URL
        </Button>
      </div>

      {facebookUrls.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-foreground/70 mb-4">
              No Facebook URLs added yet. Add URLs to track analytics for specific Facebook posts.
            </p>
            <Button onClick={() => setAddDialogOpen(true)} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Facebook URL
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {facebookUrls.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0 mr-4">
                  <a
                    href={item.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground hover:underline flex items-center gap-2 group"
                  >
                    <span className="truncate">{item.facebook_url}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <p className="text-xs text-foreground/60 mt-1">
                    Added {new Date(item.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(item.facebook_url, item.id)}
                  >
                    {copiedId === item.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(item)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Facebook URL Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Facebook Post URL</DialogTitle>
            <DialogDescription className="text-foreground/70">
              Enter the URL of a Facebook post related to this listing to track its analytics.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="facebook-url">Facebook URL</Label>
              <Input
                id="facebook-url"
                type="url"
                placeholder="https://www.facebook.com/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSubmitting) {
                    handleAdd()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false)
                setNewUrl('')
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add URL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/70">
              This will delete the Facebook URL. Analytics data associated with this URL will remain but will no longer be linked to a specific post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
