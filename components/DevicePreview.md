# DevicePreview Component - Usage Guide

## Overview
The `WritingSocialPreview` component now supports both HTML content (default) and image content for the device screens.

## Props
```typescript
interface WritingSocialPreviewProps {
  laptopScreenImage?: string;  // URL to laptop screen image
  mobileScreenImage?: string;  // URL to mobile screen image
}
```

## Usage Examples

### Default (HTML Content)
```tsx
<WritingSocialPreview />
```

### With Images
```tsx
<WritingSocialPreview 
  laptopScreenImage="/images/laptop-screen.png"
  mobileScreenImage="/images/mobile-screen.png"
/>
```

### Mixed Content
```tsx
// Only laptop as image, mobile stays HTML
<WritingSocialPreview 
  laptopScreenImage="/images/laptop-screen.png"
/>
```

## Features Implemented

### ✅ Device Structure
- **Laptop**: Larger screen (44rem × 28rem), positioned left, realistic frame
- **Mobile**: Proportional screen (56 × 28rem), positioned right, iPhone-style frame

### ✅ Content Options
- **HTML Content**: Full social writing interface with:
  - Tweet format posts
  - Long article previews  
  - Repost/quote functionality
  - Discover section for new writers
  - Trending hashtags
  - Interactive buttons

- **Image Content**: Clean image replacement maintaining device aesthetics

### ✅ Design Improvements
- Larger, more readable screens
- Better device positioning (laptop left, mobile right)
- Non-cluttered layout with proper spacing
- Elegant background effects
- Enhanced feature highlights section

## Next Steps
1. Create screen mockup images
2. Replace HTML content with `laptopScreenImage` and `mobileScreenImage` props
3. Test responsive behavior across different screen sizes

## File Structure
```
components/
├── WritingSocialPreview.tsx  # Main component
└── DevicePreview.md         # This documentation
```