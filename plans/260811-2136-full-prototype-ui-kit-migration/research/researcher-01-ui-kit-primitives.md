# @frontend-team/ui-kit Components Reference

**Status:** All 19 component docs fetched successfully; DS 1.1 confirmation pending (Sidebar doc confirmed DS 1.1 tokens; Chip & Modal docs also reference DS 1.1 styling).

---

## Input (Form Field)
**Import:** `import { Input } from '@frontend-team/ui-kit'`

| Property | Options | Default |
|----------|---------|---------|
| `variant` | light, fill, dim, borderless | light |
| `size` | xs(32px), s(36px), m(40px), l(48px), xl(56px) | m |
| `validation` | error, success | — |
| `leftIcon` | ReactNode | — |
| `rightIcon` | ReactNode | — |
| `unit` | ReactNode | — |

**Snippet:** `<Input variant="fill" size="l" placeholder="Enter email" type="email" />`

**Gotcha:** Focused inputs apply `border_accent_secondary_contrast` styling; `borderless` variant maintains zero horizontal padding.

**My iKame mapping:** Text inputs for login/profile forms, search fields, event creation forms.

---

## InputPinCode
**Import:** `import { InputPinCode } from '@frontend-team/ui-kit'`

| Property | Type | Default |
|----------|------|---------|
| `length` | number | 6 |
| `value` | string | — |
| `onChange` | function | — |
| `onComplete` | function | — |
| `numericOnly` | boolean | true |
| `mask` | boolean | false |
| `placeholder` | string | "-" |
| `separatorAfter` | number[] | — |
| `variant` | light, fill, dim | light |
| `size` | s, m, l | m |

**Snippet:** `<InputPinCode length={4} mask onChange={setPin} onComplete={handleVerify} />`

**Gotcha:** `separatorAfter` uses 1-based indexing (place dashes *after* slot N).

**My iKame mapping:** OTP verification, event access codes.

---

## Textarea
**Import:** `import { Textarea } from '@frontend-team/ui-kit'`

| Property | Options | Default |
|----------|---------|---------|
| `variant` | light, fill, dim, borderless | light |
| `size` | xs, s, m, l, xl | m |
| `autosize` | boolean | false |
| `minRows` | number | 3 |
| `maxRows` | number | — |

**Snippet:** `<Textarea autosize minRows={2} maxRows={6} placeholder="Type here..." />`

**Gotcha:** `maxRows` caps expansion before scrolling only when `autosize=true`.

**My iKame mapping:** Event descriptions, feedback/comments, long-form announcements.

---

## Select
**Import:** `import { Select } from '@frontend-team/ui-kit'`

| Property | Type | Default |
|----------|------|---------|
| `options` | SelectOption[] | required |
| `value` | string \| string[] | — |
| `onValueChange` | function | — |
| `multiple` | boolean | false |
| `searchable` | boolean | auto |
| `clearable` | boolean | false |
| `size` | xs, s, m, l, xl | m |
| `variant` | light, fill, dim, borderless | light |
| `validation` | error | — |
| `groups` | SelectGroup[] | — |
| `portalContainer` | HTMLElement \| null | undefined |

**Snippet:** `<Select options={plans} value={selected} onValueChange={setPlan} searchable />`

**Gotcha:** Focused triggers use `border_accent_secondary_contrast`; `borderless` keeps horizontal padding at 0. Use `portalContainer` prop when inside Drawer/Modal contexts. Virtualized dropdown rows estimate 48px height (64px with descriptions).

**My iKame mapping:** Event category filters, user role selection, timezone/locale picker.

---

## FileUpload
**Import:** `import { FileUpload } from '@frontend-team/ui-kit'`

| Property | Type | Default |
|----------|------|---------|
| `accept` | string (MIME) | — |
| `multiple` | boolean | false |
| `maxSize` | number (bytes) | — |
| `maxFiles` | number | — |
| `files` | FileEntry[] | — |
| `onFilesChange` | function | — |
| `onFileAdd` | function | — |
| `onFileRemove` | function | — |
| `placeholder` | string | "Upload a file" |
| `description` | string | — |

**Snippet:** `<FileUpload accept="image/*" maxSize={5242880} onFileAdd={handleAdd} />`

**Gotcha:** Two modes—uncontrolled (with `onFileAdd`) and controlled (with `files` prop + `onFileRemove`). Auto-preview for images in uncontrolled mode.

**My iKame mapping:** Event poster/cover image, participant documents, manager attachments.

---

## Badge
**Import:** `import { Badge, NotiBadge } from '@frontend-team/ui-kit'`

**Badge props:**

| Property | Options | Default |
|----------|---------|---------|
| `variant` | default, primary, success, warning, error, info, outline | default |
| `color` | 16-color palette (gray, red, orange, blue, etc.) | — |
| `size` | xs, s, m, l, xl | m |
| `bordered` | boolean | true |
| `rounded` | boolean (pill) | true |
| `dot` | boolean | false |
| `iconLeft` | ReactNode (12px) | — |
| `iconRight` | ReactNode (12px) | — |

**NotiBadge props:**

| Property | Options | Default |
|----------|---------|---------|
| `size` | l, m, s (24px, 16px, 8px dot) | l |
| `color` | 16-color palette | red |
| `count` | number | — |
| `max` | number | 99 |

**Snippet:** `<Badge variant="success" rounded>Active</Badge>` / `<NotiBadge count={3} />`

**Gotcha:** `variant` and `color` are mutually exclusive—use one or the other. Default applies `radius_4` when `rounded=false`.

**My iKame mapping:** Event status (Active/Cancelled), manager attention indicators, unread notification counts.

---

## Chip
**Import:** `import { Chip, FilterChipRadioGroup, TabChip, InfoChip, InputChip } from '@frontend-team/ui-kit'`

| Property | Options | Default |
|----------|---------|---------|
| `variant` | tag, selector, check | — |
| `size` | xs, s, m, l, xl | m |
| `color` | 16-color palette | — |
| `filterType` | borderFill, borderLight, borderless | borderFill |
| `selected` | boolean | false |
| `searchable` | boolean | false |
| `clearable` | boolean | false |
| `pill` | boolean | false |
| `icon` | ReactNode (20px) | — |

**Snippet:** `<Chip variant="tag" icon={<Star />} onRemove={remove}>Important</Chip>`

**Gotcha:** Inactive `borderFill` use `bg_interactive_secondary` + `text_secondary`; active use `bg_accent_secondary_subtle` + `border_accent_secondary_contrast` + `fg_accent_secondary`. Leading icons render at 20px.

**My iKame mapping:** Event tags, filter pills (News/Events/Categories), participant status chips (RSVP, Attended).

---

## Avatar
**Import:** `import { Avatar } from '@frontend-team/ui-kit'`

| Property | Options | Default |
|----------|---------|---------|
| `src` | string (URL) | — |
| `alt` | string | — |
| `fallback` | string (text) | — |
| `icon` | ReactNode | — |
| `type` | image, icon, text | image |
| `size` | xxs, xs, s, m, l, xl | m |
| `onClick` | function | — |

**Snippet:** `<Avatar src={url} alt="John Doe" fallback="JD" size="m" onClick={handleClick} />`

**Gotcha:** Text fallback auto-extracts initials from `alt` ("John Doe" → "JD") or use explicit `fallback` string. `onClick` enables interactive button behavior.

**My iKame mapping:** User profile pictures (News authors, event organizers, participant lists), placeholder icons.

---

## Checkbox
**Import:** `import { Checkbox } from '@frontend-team/ui-kit'`

| Property | Options | Default |
|----------|---------|---------|
| `label` | string | — |
| `description` | string | — |
| `size` | sm, md, lg | md |
| `checked` | boolean \| "indeterminate" | — |
| `defaultChecked` | boolean | — |
| `onCheckedChange` | (checked: boolean \| "indeterminate") => void | — |
| `disabled` | boolean | — |

**Snippet:** `<Checkbox label="Accept terms" onCheckedChange={setAccepted} />`

**Gotcha:** Labels auto-link to input via id association. Supports indeterminate state (mixed selection).

**My iKame mapping:** Mandatory acknowledgement (terms, policies), participant preference selection.

---

## Switch
**Import:** `import { Switch } from '@frontend-team/ui-kit'`

| Property | Options | Default |
|----------|---------|---------|
| `label` | string | — |
| `description` | string | — |
| `size` | sm, md, lg | md |
| `labelPosition` | left, right | right |
| `checked` | boolean | — |
| `defaultChecked` | boolean | — |
| `onCheckedChange` | function | — |
| `disabled` | boolean | — |

**Snippet:** `<Switch label="Dark mode" checked={isDark} onCheckedChange={setIsDark} />`

**Gotcha:** Label positioning (left/right); default is right-aligned.

**My iKame mapping:** Feature toggles (notifications, visibility settings), profile preference switches.

---

## RadioGroup
**Import:** `import { RadioGroup, RadioGroupItem } from '@frontend-team/ui-kit'`

| Property | Options | Default |
|----------|---------|---------|
| `orientation` | vertical, horizontal | vertical |
| `value` | string | — |
| `defaultValue` | string | — |
| `onValueChange` | function | — |
| **RadioGroupItem:** | | |
| `value` | string (required) | — |
| `label` | string | — |
| `description` | string | — |
| `size` | sm, md, lg | md |
| `disabled` | boolean | — |

**Snippet:** `<RadioGroup defaultValue="free"><RadioGroupItem value="free" label="Free" /><RadioGroupItem value="pro" label="Pro" /></RadioGroup>`

**Gotcha:** Supports both controlled (`value`/`onValueChange`) and uncontrolled (`defaultValue`) modes.

**My iKame mapping:** Event type selection (In-person/Virtual/Hybrid), access level picker, survey questions.

---

## Modal
**Import:** `import { Modal } from '@frontend-team/ui-kit'`

| Property | Options | Default |
|----------|---------|---------|
| `open` | boolean | — |
| `onOpenChange` | function | — |
| `trigger` | ReactNode | — |
| `title` | string | — |
| `description` | string | — |
| `footer` | ReactNode | — |
| `variant` | default, spotlight | default |
| `size` | sm, md, lg, xl, 2xl, full | md |
| `showCloseButton` | boolean | true |
| `closeOnOverlayClick` | boolean | true |

**Snippet:** `<Modal title="RSVP" size="md" footer={<Button>Confirm</Button>}><p>Confirm attendance</p></Modal>`

**Gotcha (Spotlight variant):** Removes overlay, positions from top. Requires `bodyClassName="h-full flex flex-col"` for sticky footer. Search bar uses `border-b border_secondary`; results use `flex-1 overflow-y-auto py-2`; footer uses `border-t border_secondary` with pinned positioning.

**My iKame mapping:** RSVP confirmations, manager action modals, event creation wizard, mandatory acknowledgement dialogs.

---

## Drawer
**Import:** `import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerBody, DrawerFooter, DrawerClose } from '@frontend-team/ui-kit'`

| Property | Options | Default |
|----------|---------|---------|
| `side` | left, right, top, bottom | left |
| `size` | s(320px), m(1/3 vw), l(1/2 vw), full | m |

**Snippet:** `<Drawer><DrawerTrigger asChild><Button>Open</Button></DrawerTrigger><DrawerContent side="right" size="m"><DrawerBody>Content</DrawerBody></DrawerContent></Drawer>`

**Gotcha:** Mobile (<640px) drawers are full-width regardless of `size`. Left/right: `s`=320px, `m`=min(1/3 viewport, 320px), `l`=min(1/2 viewport, 320px).

**My iKame mapping:** Notification drawer, event details sidebar, participant list slide-out, filter/sort drawer.

---

## Tooltip
**Import:** `import { Tooltip, TooltipProvider } from '@frontend-team/ui-kit'`

| Property | Options | Default |
|----------|---------|---------|
| `content` | ReactNode (required) | — |
| `title` | ReactNode | — |
| `side` | top, right, bottom, left | top |
| `align` | start, center, end | center |
| `delayDuration` | number (ms) | 400 |
| `avoidCollisions` | boolean | false |
| `open` | boolean | — |
| `onOpenChange` | function | — |
| `disabled` | boolean | false |

**Snippet:** `<TooltipProvider><Tooltip content="Save your work" title="Save"><button>💾</button></Tooltip></TooltipProvider>`

**Gotcha:** `TooltipProvider` must wrap your app or the section using tooltips. Controlled via `open`/`onOpenChange`. Title renders in bold above content.

**My iKame mapping:** Help hints on form fields, info icons for event requirements, participant role explanations.

---

## Popover
**Import:** `import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from '@frontend-team/ui-kit'`

| Property | Options | Default |
|----------|---------|---------|
| `trigger` | ReactNode | required |
| `children` | ReactNode | required |
| `open` | boolean | — |
| `onOpenChange` | function | — |
| `side` | top, right, bottom, left | bottom |
| `align` | start, center, end | start |
| `sideOffset` | number (px) | 8 |
| `portal` | boolean | true |

**Snippet:** `<Popover trigger={<Button>More</Button>}><div>Popover content</div></Popover>`

**Gotcha:** Set `portal={false}` when used inside Drawer/Modal to maintain scroll behavior within container; default `portal=true` renders through document portal.

**My iKame mapping:** Event details expansion, participant action menus, attendance status explanations.

---

## DropdownMenu
**Import:** `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuSub, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@frontend-team/ui-kit'`

| Property | Options | Default |
|----------|---------|---------|
| `side` | top, right, bottom, left | bottom |
| `align` | start, center, end | start |
| `sideOffset` | number (px) | 8 |

**Snippet:** `<DropdownMenu><DropdownMenuTrigger asChild><Button>⋮</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem>Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>`

**Gotcha:** Composite component; use `asChild` on trigger for custom elements. Supports nested menus (DropdownMenuSub), checkboxes, and radio groups.

**My iKame mapping:** Event action menus (Edit/Cancel/Share), participant row actions, manager controls.

---

## Tabs
**Import:** `import { Tabs } from '@frontend-team/ui-kit'`

| Property | Options | Default |
|----------|---------|---------|
| `items` | TabsItem[] | required |
| `variant` | default, underline, borderless | default |
| `color` | orange, primary | orange |
| `tabHeight` | number \| string | — |
| `value` | string | — |
| `defaultValue` | string | first enabled |
| `onValueChange` | function | — |
| `tabsListClassName` | string | — |
| `triggerClassName` | string | — |
| `contentClassName` | string | — |

**Snippet:** `<Tabs items={[{value: 'news', label: 'News', content: <News />}, {value: 'events', label: 'Events', content: <Events />}]} />`

**Gotcha:** Default variant uses `bg_tertiary` track; active thumb uses `bg_primary`, `text_primary`, and `shadow_s`. `tabHeight` accepts number (36) or string ("36px").

**My iKame mapping:** News/Events/Announcements filter tabs, event details sections (Overview/Schedule/Participants).

---

## Accordion
**Import:** `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@frontend-team/ui-kit'`

| Property | Options | Default |
|----------|---------|---------|
| `type` | single, multiple | required |
| `variant` | default, card | default |
| `collapsible` | boolean | — |
| `value` | string \| string[] | — |
| `defaultValue` | string \| string[] | — |

**Snippet:** `<Accordion type="single" collapsible><AccordionItem value="faq-1"><AccordionTrigger>FAQ?</AccordionTrigger><AccordionContent>Answer</AccordionContent></AccordionItem></Accordion>`

**Gotcha:** `collapsible` prop only applies when `type="single"` (allows closing all items).

**My iKame mapping:** Event FAQ sections, notification grouping, event schedule breakdowns (by day/category).

---

## Alert
**Import:** `import { Alert } from '@frontend-team/ui-kit'`

| Property | Options | Default |
|----------|---------|---------|
| `variant` | default, success, warning, error, info | default |
| `title` | string | — |
| `description` | string | — |
| `icon` | ReactNode | — |
| `onClose` | function | — |
| `action` | ReactNode | — |
| `children` | ReactNode | — |

**Snippet:** `<Alert variant="warning" title="Capacity reached" description="Event is full" action={<Button>Waitlist</Button>} />`

**Gotcha:** Custom `icon` replaces default variant icon. `onClose` prop enables dismissal button. `action` positions below text.

**My iKame mapping:** Mandatory acknowledgements (mandatory-acknowledgement alert), event status warnings (full, cancelled), system announcements, permission/access denials.

---

## Failures & Unresolved

**Failed fetches:** None. All 19 component docs returned successfully.

**Unresolved Questions:**
1. Confirm full DS 1.1 token alignment across all components (Sidebar/Chip/Modal/Tabs confirmed; others unmarked).
2. Clarify theme/dark-mode switching mechanism—does @frontend-team/ui-kit provide a theme provider or leverage external setup?
3. Validate `portalContainer` behavior in real Drawer/Modal nested contexts (documented for Select; verify other overlays).
4. Confirm InputPinCode `separatorAfter` 1-based indexing with actual examples (doc unclear on array syntax).
5. Modal `spotlight` variant layout rules sound specific—verify sticky footer CSS works with complex layouts.
