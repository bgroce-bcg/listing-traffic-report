'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Facebook } from 'lucide-react'
import { toast } from 'sonner'
import { addFacebookUrl, deleteFacebookUrl } from '@/lib/actions/listings'
import type { Database } from '@/lib/supabase/database.types'

type FacebookUrl = Database['public']['Tables']['facebook_urls']['Row']

interface FacebookUrlsSectionProps {
  listingId: string
  facebookUrls: FacebookUrl[]
  onUpdate: () => void
}

export function FacebookUrlsSection({ listingId, facebookUrls, onUpdate }: FacebookUrlsSectionProps) {
  const [newUrl, setNewUrl] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const handleAdd = async () => {
    if (!newUrl.trim()) {
      toast.error('Please enter a Facebook URL')
      return
    }

    if (!newUrl.includes('facebook.com')) {
      toast.error('Must be a valid Facebook URL')
      return
    }

    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      toast.error('URL must start with http:// or https://')
      return
    }

    setIsAdding(true)
    const result = await addFacebookUrl(listingId, newUrl)
    setIsAdding(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Facebook URL added')
      setNewUrl('')
      onUpdate()
    }
  }

  const handleDelete = async (urlId: string) => {
    setDeletingIds(prev => new Set(prev).add(urlId))
    const result = await deleteFacebookUrl(urlId, listingId)
    setDeletingIds(prev => {
      const next = new Set(prev)
      next.delete(urlId)
      return next
    })

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Facebook URL deleted')
      onUpdate()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facebook Posts</CardTitle>
        <CardDescription>
          Add Facebook post URLs to track engagement metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New URL Form */}
        <div className="space-y-2">
          <Label htmlFor="new-facebook-url" className="text-sm font-medium">
            Add Facebook Post URL
          </Label>
          <div className="flex gap-2">
            <Input
              id="new-facebook-url"
              type="url"
              placeholder="https://www.facebook.com/..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAdd()
                }
              }}
            />
            <Button onClick={handleAdd} disabled={isAdding}>
              <Plus className="h-4 w-4 mr-2" />
              {isAdding ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>

        {/* List of URLs */}
        {facebookUrls.length > 0 ? (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Added Facebook Posts ({facebookUrls.length})</Label>
            <div className="space-y-2">
              {facebookUrls.map((url, index) => (
                <div
                  key={url.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                >
                  <Facebook className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        Post {index + 1}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Added {new Date(url.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <a
                      href={url.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate block"
                    >
                      {url.facebook_url}
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(url.id)}
                    disabled={deletingIds.has(url.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Facebook className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No Facebook posts yet</p>
            <p className="text-xs">Add your first post to start tracking engagement</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
