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
import { FacebookPost } from '@/lib/supabase/facebook-posts'
import { ExternalLink, Trash2, Plus, Edit, Loader2, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface FacebookPostsManagerProps {
  listingId: string
  facebookPosts: FacebookPost[]
  onAdd: (url: string, views: number) => Promise<void>
  onUpdate: (id: string, url: string, views: number) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onRefresh: () => Promise<void>
}

export function FacebookPostsManager({
  facebookPosts,
  onAdd,
  onUpdate,
  onDelete,
  onRefresh,
}: FacebookPostsManagerProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToEdit, setPostToEdit] = useState<FacebookPost | null>(null)
  const [postToDelete, setPostToDelete] = useState<FacebookPost | null>(null)
  const [newUrl, setNewUrl] = useState('')
  const [newViews, setNewViews] = useState<string>('0')
  const [editUrl, setEditUrl] = useState('')
  const [editViews, setEditViews] = useState<string>('0')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async () => {
    if (!newUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }

    const views = parseInt(newViews) || 0
    if (views < 0) {
      toast.error('Views must be 0 or greater')
      return
    }

    setIsSubmitting(true)
    try {
      await onAdd(newUrl, views)
      setNewUrl('')
      setNewViews('0')
      setAddDialogOpen(false)
      toast.success('Facebook post added successfully')
      await onRefresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add Facebook post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!postToEdit) return

    if (!editUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }

    const views = parseInt(editViews) || 0
    if (views < 0) {
      toast.error('Views must be 0 or greater')
      return
    }

    setIsSubmitting(true)
    try {
      await onUpdate(postToEdit.id, editUrl, views)
      setEditDialogOpen(false)
      setPostToEdit(null)
      toast.success('Facebook post updated successfully')
      await onRefresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update Facebook post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!postToDelete) return

    setIsSubmitting(true)
    try {
      await onDelete(postToDelete.id)
      setDeleteDialogOpen(false)
      setPostToDelete(null)
      toast.success('Facebook post deleted successfully')
      await onRefresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete Facebook post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (post: FacebookPost) => {
    setPostToEdit(post)
    setEditUrl(post.url)
    setEditViews(post.views.toString())
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (post: FacebookPost) => {
    setPostToDelete(post)
    setDeleteDialogOpen(true)
  }

  const totalViews = facebookPosts.reduce((sum, post) => sum + post.views, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Facebook Posts</h3>
          {facebookPosts.length > 0 && (
            <p className="text-sm text-foreground/60">
              Total Views: {totalViews.toLocaleString()}
            </p>
          )}
        </div>
        <Button onClick={() => setAddDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Facebook Post
        </Button>
      </div>

      {facebookPosts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-foreground/70 mb-4">
              No Facebook posts added yet. Add posts with their view counts to track performance.
            </p>
            <Button onClick={() => setAddDialogOpen(true)} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Facebook Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {facebookPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2">
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground hover:underline flex items-center gap-2 group"
                    >
                      <span className="truncate">{post.url}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-foreground/60">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{post.views.toLocaleString()} views</span>
                    </div>
                    <span>
                      Added {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(post)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(post)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Facebook Post Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Facebook Post</DialogTitle>
            <DialogDescription className="text-foreground/70">
              Enter the URL and view count for a Facebook post. The URL can be any text - no validation required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="facebook-url">URL</Label>
              <Input
                id="facebook-url"
                type="text"
                placeholder="Enter any URL or text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSubmitting) {
                    handleAdd()
                  }
                }}
              />
              <p className="text-xs text-foreground/60">
                Enter any text - no URL validation required
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook-views">Views</Label>
              <Input
                id="facebook-views"
                type="number"
                min="0"
                placeholder="0"
                value={newViews}
                onChange={(e) => setNewViews(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false)
                setNewUrl('')
                setNewViews('0')
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Facebook Post Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Facebook Post</DialogTitle>
            <DialogDescription className="text-foreground/70">
              Update the URL or view count for this Facebook post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-facebook-url">URL</Label>
              <Input
                id="edit-facebook-url"
                type="text"
                placeholder="Enter any URL or text"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSubmitting) {
                    handleUpdate()
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-facebook-views">Views</Label>
              <Input
                id="edit-facebook-views"
                type="number"
                min="0"
                placeholder="0"
                value={editViews}
                onChange={(e) => setEditViews(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false)
                setPostToEdit(null)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Post
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
              This will permanently delete this Facebook post entry.
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
