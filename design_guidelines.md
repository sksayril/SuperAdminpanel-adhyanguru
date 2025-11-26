# Design Guidelines: Learnzie Learning Management System

## Design Approach

**Reference-Based Approach**: Drawing inspiration from modern EdTech platforms like Coursera, Khan Academy, and Notion's clean aesthetic. The design prioritizes clarity, information hierarchy, and dashboard efficiency over visual flourish.

## Core Design Principles

1. **Information Density with Breathing Room**: Dashboard-heavy interface that displays multiple data points without feeling cluttered
2. **Card-Based Architecture**: Every major content block lives in elevated cards with subtle shadows
3. **Progress Visualization**: Heavy use of progress bars, completion percentages, and visual status indicators
4. **Dual-Mode Design**: Distinct yet cohesive styling for Student Dashboard and Admin Panel

## Typography System

**Font Family**: 
- Primary: Inter or DM Sans (via Google Fonts CDN)
- Monospace: JetBrains Mono for code/technical content

**Hierarchy**:
- Page Titles: text-2xl to text-3xl, font-semibold
- Section Headers: text-xl, font-semibold
- Card Titles: text-lg, font-medium
- Body Text: text-sm to text-base, font-normal
- Metadata/Labels: text-xs to text-sm, font-medium with reduced opacity

## Layout & Spacing System

**Tailwind Units**: Use consistent spacing of 2, 4, 6, 8, 12, 16, and 24 (p-2, m-4, gap-6, space-y-8, etc.)

**Layout Structure**:
- Fixed sidebar: w-64 on desktop, collapsible on mobile
- Main content area: flex-1 with max-w-7xl container
- Dashboard grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for metric cards
- Nested grids for sub-sections with gap-4 to gap-6

## Component Library

### Navigation
- **Sidebar**: Fixed left navigation with logo at top, primary nav items with icons (from Heroicons), active state with background highlight and left border accent
- **Top Bar**: User profile, notifications icon, search bar (optional based on page)

### Dashboard Widgets
- **Metric Cards**: White background, rounded-lg, p-6, shadow-sm, with icon, label, value, and change indicator
- **Progress Rings/Bars**: Circular progress for overall completion, linear bars for individual courses
- **Activity Feed**: Timeline-style list with timestamps, avatars, and action descriptions
- **Calendar Widget**: Monthly view with day cells, color-coded events, clickable dates

### Data Display
- **Course Cards**: Image thumbnail, course title, instructor name, progress bar, duration, rating stars
- **Assignment List**: Table or card layout with status badges (Pending/In Progress/Completed), due dates, priority indicators
- **Schedule Timeline**: Day-by-day breakdown with time slots and course sessions

### Forms & Inputs
- **Text Inputs**: border, rounded-md, px-4 py-2, focus ring with brand color
- **Select Dropdowns**: Custom styled with chevron icon
- **Date Pickers**: Inline calendar view for scheduling
- **Filter Controls**: Pill-style buttons for category/status filtering

### Admin-Specific Components
- **Data Tables**: Striped rows, sortable columns, action buttons (edit/delete icons)
- **Analytics Charts**: Bar charts for enrollment, line graphs for engagement (use Chart.js or Recharts library)
- **User Management Cards**: Profile photo, name, role badge, action menu
- **Content Editor**: WYSIWYG-style interface for course creation

### Status Indicators
- **Badges**: Rounded-full px-3 py-1 with status colors - pending (yellow), active (blue), completed (green), overdue (red)
- **Dot Indicators**: Small colored circles for quick status scanning

## Page Layouts

### Student Dashboard
- **Hero Section**: Personalized greeting with student name, current date/time
- **3-Column Grid**: Quick stats (Courses Enrolled, Completed, In Progress)
- **2-Column Layout**: Left side shows Upcoming Classes + Recent Activity, Right side shows Calendar + Task List
- No large hero images - focus on data visualization

### Courses Page
- **Filter Bar**: Category tabs, search, sort dropdown
- **Grid Layout**: 3-column course card grid (lg:grid-cols-3 md:grid-cols-2)
- **Pagination**: Bottom-aligned with page numbers

### Schedule Page
- **Weekly View**: 7-column grid with time slots
- **Day/Month Toggle**: Tab-style switcher
- **Event Details Modal**: Overlay with course info, time, location, join button

### Admin Panel
- **Overview Dashboard**: Similar to student but with system-wide metrics
- **Management Tables**: Full-width tables with search, filters, bulk actions
- **Create/Edit Forms**: Modal or dedicated page with multi-step wizard for complex inputs

## Images

**Profile Images**: User avatars in circular format (rounded-full) throughout the interface

**Course Thumbnails**: 16:9 aspect ratio placeholder images for course cards, use subtle gradients or abstract patterns if no real images available

**No Hero Images**: This is a dashboard application focused on functionality - avoid large decorative hero images

## Interaction Patterns

- **Card Hover**: Subtle lift effect (hover:shadow-lg, transition-shadow)
- **Button States**: Solid primary buttons with hover:brightness adjustment
- **Modal Animations**: Fade-in with backdrop, slide-up for mobile
- **Sidebar Collapse**: Smooth width transition on mobile toggle
- **Loading States**: Skeleton screens for data-heavy components

## Accessibility

- Clear focus indicators on all interactive elements
- Sufficient color contrast for all text
- Icon-only buttons must have aria-labels
- Keyboard navigation support for modals and dropdowns
- Screen reader friendly status announcements

This LMS design prioritizes usability and information clarity, creating a professional learning environment that works efficiently for both students and administrators.