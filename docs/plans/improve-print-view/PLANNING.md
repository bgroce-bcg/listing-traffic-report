# improve-print-view - PLANNING

## Summary
Enhance the listing print view by adding image upload functionality for property photos, implementing PDF download capability with the same styling as the print view, adding navigation from the listing detail page to the print view, and ensuring social media data is properly displayed (verification that existing implementation is complete).

## Requirements
- Add image upload functionality to allow users to attach a property photo to listings
- Store uploaded images using Supabase Storage
- Display the uploaded image in the print view header section
- Add a "View Print Report" button on the listing detail page that navigates to `/reports/[listingId]/print`
- Implement "Save as PDF" button on the print page that downloads the page as a PDF file
- Ensure PDF maintains the same premium styling as the browser print view
- Verify social media/Facebook data is displayed in the print view (already implemented per analysis)

## UI / UX
- Image upload control added to listing detail or edit page
- Image preview shown after upload
- "View Print Report" button added to listing actions on detail page
- "Save as PDF" button placed prominently on print page (alongside existing "Print Report" button)
- PDF download uses same professional formatting as current print view

## Sections

### image-upload-storage
**Description:** Implement image upload functionality with Supabase Storage integration
**Objectives:**
- Create Supabase Storage bucket for listing images
- Add `image_url` column to listings table
- Build image upload component using shadcn/ui file input patterns
- Integrate upload component into listing edit/detail page
- Handle image upload to Supabase Storage and update listing record
**Verification:**
- User can upload an image from listing page
- Image is stored in Supabase Storage
- Listing record updated with image URL
- Image displays in listing detail page

### print-view-enhancements
**Description:** Add navigation to print view and implement PDF download functionality
**Objectives:**
- Add "View Print Report" button to listing detail page that navigates to print route
- Update print page to display uploaded listing image in header
- Add "Save as PDF" button to print page using browser print-to-PDF or html2pdf library
- Ensure PDF preserves premium styling (gradients, colors, formatting)
**Verification:**
- "View Print Report" button navigates correctly to `/reports/[listingId]/print`
- Uploaded image appears in print view header
- "Save as PDF" button downloads properly formatted PDF
- PDF matches print view styling
- Social media data confirmed visible in print output

## Notes
- Social media/Facebook data is already implemented and displaying in print view (verified)
- Current print page uses browser `window.print()` - PDF download may use similar approach or html2pdf.js
- Existing jsPDF implementation in listing detail page provides alternative reference
- Print CSS already configured with `@media print` rules in globals.css
- Supabase Storage buckets need proper RLS policies for authenticated users
