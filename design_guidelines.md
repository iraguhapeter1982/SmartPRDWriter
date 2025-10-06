# Family Command Center - Design Guidelines

## Design Approach

**Selected Approach:** Design System (Hybrid of Linear + Notion + Apple HIG)

**Justification:** This is a utility-focused productivity app where efficiency, clarity, and trust are paramount. Families need quick scanning, reliable real-time updates, and minimal cognitive load. The design should feel warm and approachable while maintaining professional productivity tool standards.

**Key Design Principles:**
1. **Glanceability First** - Information hierarchy optimized for busy parents scanning quickly
2. **Calm Clarity** - Minimal distractions, purposeful animations only for state changes
3. **Family-Friendly Warmth** - Approachable colors and typography, not corporate sterile
4. **Real-time Confidence** - Subtle feedback for sync states, clear data freshness indicators

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- **Primary Brand:** 195 75% 45% (warm teal - trustworthy, calm)
- **Primary Hover:** 195 75% 38%
- **Secondary:** 220 15% 96% (soft gray backgrounds)
- **Accent (Urgent/CTA):** 15 85% 58% (warm coral - for urgent school messages, primary CTAs)
- **Success:** 142 70% 45% (chore completions, purchase confirmations)
- **Text Primary:** 220 15% 20%
- **Text Secondary:** 220 10% 45%
- **Border:** 220 15% 88%
- **Background:** 0 0% 100%

**Dark Mode:**
- **Primary Brand:** 195 65% 55%
- **Primary Hover:** 195 65% 62%
- **Secondary:** 220 15% 15%
- **Accent (Urgent/CTA):** 15 75% 62%
- **Success:** 142 60% 50%
- **Text Primary:** 220 15% 95%
- **Text Secondary:** 220 10% 65%
- **Border:** 220 15% 25%
- **Background:** 220 15% 10%
- **Input Backgrounds:** 220 15% 13% (darker than background for form fields)

**Member Color Coding** (for calendar events/chores):
- Member 1: 270 65% 60% (purple)
- Member 2: 30 75% 55% (orange)
- Member 3: 150 60% 50% (teal-green)
- Member 4: 340 70% 58% (pink)
- Member 5: 45 80% 55% (yellow-gold)

### B. Typography

**Font Families:**
- **Primary (UI):** Inter (Google Fonts) - clean, legible, excellent at small sizes
- **Display (Headings):** Inter (weight variations) - maintain consistency
- **Monospace (Data):** JetBrains Mono - for times, dates, codes

**Type Scale:**
- **Hero/Page Titles:** text-4xl font-bold (36px)
- **Section Headers:** text-2xl font-semibold (24px)
- **Card Headers:** text-lg font-semibold (18px)
- **Body Text:** text-base font-normal (16px)
- **Small Text:** text-sm font-normal (14px)
- **Caption/Meta:** text-xs font-medium (12px)

**Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of **2, 3, 4, 6, 8, 12, 16** for consistency
- Component padding: p-4 or p-6
- Section spacing: space-y-6 or space-y-8
- Card gaps: gap-4
- Page margins: px-4 md:px-6 lg:px-8

**Container Widths:**
- Dashboard: max-w-7xl mx-auto
- Content sections: max-w-6xl mx-auto
- Forms/Settings: max-w-2xl mx-auto

**Grid Patterns:**
- Dashboard cards: grid grid-cols-1 lg:grid-cols-3 gap-6
- Calendar week view: grid grid-cols-7
- List items: Single column with dividers

### D. Component Library

**Navigation:**
- **Top Bar:** Fixed header with family name, today's date, profile menu, notification bell
- **Sidebar (Desktop):** Persistent navigation with icons + labels (Dashboard, Calendar, Lists, Chores, School Hub, Settings)
- **Bottom Nav (Mobile):** 5 primary items with icons, active state with primary color indicator

**Dashboard Cards:**
- **Today Card:** Large card showing current date, upcoming events (next 3), weather widget (optional)
- **Quick Stats:** Small cards for pending chores (count), unread school messages (count), list items (count)
- **Week Timeline:** Horizontal scrollable timeline showing 7 days with event dots color-coded by member
- **Quick Actions:** Floating action button (+ Add) with menu for New Event, New List Item, New Chore

**Calendar Components:**
- **Event Cards:** Rounded rectangles with left border in member color, title, time range, location icon if present
- **Month View:** Grid with small event dots, click to expand day
- **Week View:** Time slots with overlapping events, drag-to-create placeholder

**Lists:**
- **List Items:** Checkbox on left, item title, optional note (text-sm text-secondary), assigned avatar on right
- **Purchase Toggle:** Strikethrough animation when checked, subtle success color flash
- **Add Input:** Sticky bottom input with auto-focus on "Add Item" tap

**Chores:**
- **Chore Cards:** Avatar of assignee, chore title, recurrence badge, points indicator, complete button
- **Completion Animation:** Checkmark animation with confetti effect (very subtle, 300ms)
- **History List:** Completed items with timestamp and completer avatar

**School Hub:**
- **Message Cards:** Subject line (font-semibold), sender name, date, urgent tag if applicable, preview text
- **Filter Tabs:** All, Urgent, Teacher, Class, School-wide
- **Detail View:** Full message with HTML email rendering, attachment indicators

**Forms:**
- **Input Fields:** Dark mode: bg-[220 15% 13%] with border, rounded-lg, p-3
- **Labels:** text-sm font-medium mb-2
- **Buttons:** Primary (filled primary color), Secondary (outline), Ghost (text only)
- **Validation:** Inline error messages in accent color below field

**Data Display:**
- **Avatar Groups:** Overlapping circles for multiple assignees (max 3 visible + count)
- **Badges:** Rounded-full px-3 py-1 text-xs for status indicators (Urgent, Recurring, Due Today)
- **Empty States:** Centered icon + message + CTA button

**Overlays:**
- **Modals:** Centered, max-w-2xl, backdrop blur-sm
- **Drawers (Mobile):** Slide up from bottom for forms/details
- **Toasts:** Top-right notifications, 4s auto-dismiss, success/error/info variants

### E. Animations

**Minimal Use Only:**
- **Real-time Updates:** Subtle slide-in (200ms) for new list items/messages
- **State Changes:** 200ms ease transitions for hover, active, focus states
- **Completion Actions:** Checkmark animation (300ms) with optional subtle particle effect
- **Loading States:** Skeleton screens (no spinners), pulse animation on placeholders
- **Page Transitions:** None - instant navigation preferred

---

## Images

**Dashboard Hero Area:**
- **Placement:** Top of dashboard, above Today Card
- **Description:** Warm, friendly illustration or photo of a family kitchen command center (physical bulletin board with calendar, notes, magnets) - subtle and not overwhelming, 16:9 aspect ratio, max height 200px on desktop
- **Treatment:** Soft overlay gradient (bottom to top) to blend into content below

**Onboarding Screens:**
- **Welcome:** Illustration of connected family members icons in a circle
- **Calendar Connect:** Google Calendar logo with sync arrows
- **School Hub:** Illustration of school building with message icons

**Empty States:**
- **No Events:** Small illustration of empty calendar with encouraging message
- **No Lists:** Illustration of grocery cart with sparkles
- **No Messages:** Illustration of empty inbox with peaceful visual

**Avatars:**
- Use Gravatar fallback or generated avatars (DiceBear API) with member color as background

---

## Platform-Specific Considerations

**Mobile (Primary):**
- Bottom navigation always visible
- Swipe gestures for list item actions (complete, delete)
- Pull-to-refresh on feeds
- Large tap targets (min 44px height)

**Tablet/Kiosk Mode:**
- Split-screen layout: Calendar on left (60%), Quick Actions sidebar (40%)
- Persistent Today Card in top-right corner
- Larger typography (scale up by 10%)

**Dark Mode:**
- Default for evening hours (6pm-7am auto-switch)
- Manual toggle in settings
- All form inputs use darker background (220 15% 13%) for depth
- Reduced contrast on borders for comfort