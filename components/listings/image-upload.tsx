'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { uploadListingImage, deleteListingImage } from '@/lib/supabase/storage'
import { updateListing } from '@/lib/supabase/listings'
import Image from 'next/image'

interface ImageUploadProps {
  listingId: string
  currentImageUrl?: string | null
  onUploadSuccess?: (imageUrl: string) => void
  onDeleteSuccess?: () => void
}

export function ImageUpload({
  listingId,
  currentImageUrl,
  onUploadSuccess,
  onDeleteSuccess,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [imagePath, setImagePath] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.')
      return
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size exceeds 5MB limit.')
      return
    }

    try {
      setUploading(true)

      // Upload to Supabase Storage
      const { url, path } = await uploadListingImage(listingId, file)

      // Update listing record with image URL
      await updateListing(listingId, { image_url: url })

      // Update preview
      setPreviewUrl(url)
      setImagePath(path)

      toast.success('Image uploaded successfully')
      onUploadSuccess?.(url)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async () => {
    if (!previewUrl) return

    try {
      setDeleting(true)

      // Delete from storage if we have the path
      if (imagePath) {
        await deleteListingImage(imagePath)
      }

      // Update listing record to remove image URL
      await updateListing(listingId, { image_url: null })

      // Clear preview
      setPreviewUrl(null)
      setImagePath(null)

      toast.success('Image deleted successfully')
      onDeleteSuccess?.()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete image')
    } finally {
      setDeleting(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-foreground/70" />
              <h3 className="font-semibold">Property Image</h3>
            </div>
            {previewUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </>
                )}
              </Button>
            )}
          </div>

          {previewUrl ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column: Current Image */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground/70">Current Image</p>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={previewUrl}
                    alt="Property image"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>

              {/* Right column: Upload Controls */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground/70">Replace Image</p>
                <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/20 h-full flex flex-col items-center justify-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-foreground/40" />
                  <p className="text-sm text-foreground/60 mb-4">
                    Upload a new image to replace the current one
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Button
                    onClick={handleUploadClick}
                    disabled={uploading}
                    variant="outline"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Choose New Image
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-foreground/50 mt-4">
                    JPEG, PNG, WebP, GIF • Max 5MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/20">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-foreground/40" />
              <p className="text-sm text-foreground/60 mb-4">
                No image uploaded yet. Upload a property photo to display in reports.
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
              <Button
                onClick={handleUploadClick}
                disabled={uploading}
                variant="default"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
              <p className="text-xs text-foreground/50 mt-4">
                Accepted formats: JPEG, PNG, WebP, GIF • Max size: 5MB
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
