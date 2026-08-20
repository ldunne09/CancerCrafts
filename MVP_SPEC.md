# Cancer Patient App — MVP Development Baseline

> **Purpose:** This document is the baseline specification for building a showcase-ready Minimum Viable Product (MVP) of the Cancer Patient App. It is intended to be used as the starting context for VS Code Copilot Agent.
>
> **Source:** `cancer_app_business_model.pdf`
>
> **Important:** Build the MVP first. Do not expand into the post-MVP feature set unless explicitly requested.

---

## 1. Product Vision

The app is a patient-first platform designed to help people living with cancer:

- Connect with others
- Find practical resources
- Earn income through a simple marketplace
- Ask for and receive financial/practical assistance

The core product structure is:

- **CARE** — Community, resources, organization, and support
- **EARN** — Marketplace and tools that help patients/survivors generate income
- **HELP** — Financial assistance, fundraising, transportation, meals, and other practical resources

The MVP should demonstrate this concept through a polished, believable product experience rather than attempting to build the entire long-term vision.

---

# 2. MVP Goal

The MVP should prove this user journey:

> A person affected by cancer can enter the app, connect with the community, discover useful resources, create or find assistance, and participate in a simple marketplace.

The showcase should allow someone unfamiliar with the product to understand the value of the application within approximately 5 minutes.

### Primary demo journey

1. User signs in.
2. User lands on CARE.
3. User views community posts.
4. User creates or responds to a community post.
5. User navigates to HELP.
6. User finds practical resources.
7. User views or creates an assistance request.
8. User navigates to EARN.
9. User browses marketplace products.
10. User views a product.
11. User creates a marketplace listing.
12. User returns to the dashboard/profile and sees their activity.

---

# 3. MVP Scope

## Tier 1 — MUST BUILD

### CARE

- Community feed
- Community posts
- Create post
- Comments
- Support/like reaction
- Categories
- User profiles
- Anonymous posting option
- Basic reporting/moderation

### EARN

- Marketplace feed
- Product cards
- Product detail page
- Seller profile
- Create marketplace listing
- Product image upload
- Product categories
- Basic purchase/checkout flow
- Order confirmation
- Seller's products

### HELP

- Assistance feed
- Assistance request detail
- Create assistance request
- Assistance categories
- Goal amount
- Amount raised
- Progress indicator
- Donation/help flow
- Share request
- Request updates

### Resources

- Resource categories
- Resource list
- Resource detail
- Search
- Location filtering
- External resource links
- Admin resource management

### Account

- Sign up
- Sign in
- User profile
- Edit profile
- User activity
- Settings

### Navigation

Primary navigation should clearly expose:

- CARE
- EARN
- HELP
- PROFILE

---

# 4. Tier 2 — Showcase Polish

These features should be added after Tier 1 is working:

- Search improvements
- Notifications
- Image uploads
- Sharing
- Location filtering
- Marketplace checkout simulation
- Donation simulation
- Premium feature preview
- Loading states
- Empty states
- Error states
- Responsive/mobile-friendly UI
- Accessibility improvements
- Seed/demo data

---

# 5. Explicitly OUT OF SCOPE for MVP

Do not implement these unless explicitly requested:

- Full electronic medical records
- Hospital integrations
- Insurance integrations
- AI medical diagnosis
- Medication integrations
- Advanced medication reminders
- Full treatment planning
- Advanced symptom tracking
- Full caregiver coordination
- Employer portal
- Grant application automation
- Complex financial/payment infrastructure
- Production marketplace fulfillment
- Nationwide verified resource database
- Advanced analytics
- Complex subscription infrastructure

These are post-MVP opportunities.

---

# 6. Recommended Initial Technology Direction

The technology stack has not been mandated by the business model document. The following is a pragmatic MVP recommendation and can be changed if the repository already has an established stack.

## Suggested stack

### Frontend

Prefer one of:

- React + Next.js for a web-first showcase
- React Native + Expo if a mobile-first application is required

For a VS Code showcase MVP, default to **Next.js + TypeScript** unless the existing repository indicates otherwise.

### Backend / Data

Prefer:

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage

This keeps authentication, database, and storage relatively simple for an MVP.

### Styling

Use a maintainable component-based styling approach appropriate to the selected framework.

Prioritize:

- Clean UI
- Mobile responsiveness
- Accessibility
- Consistent components
- Simple design system

---

# 7. Product Navigation

Use this primary navigation:

```text
CARE
EARN
HELP
PROFILE
```

## CARE

Suggested sub-navigation:

```text
Community
Resources
```

## EARN

Suggested sub-navigation:

```text
Marketplace
My Listings
Sell Something
```

## HELP

Suggested sub-navigation:

```text
Find Help
Assistance Requests
Create Request
```

---

# 8. Screen Inventory

Build the following screens.

## Authentication

- `/login`
- `/signup`

## CARE

- `/care`
- `/care/community`
- `/care/community/[postId]`
- `/care/community/create`
- `/care/resources`
- `/care/resources/[resourceId]`

## EARN

- `/earn`
- `/earn/marketplace`
- `/earn/marketplace/[productId]`
- `/earn/sell`
- `/earn/my-listings`
- `/earn/sellers/[sellerId]`

## HELP

- `/help`
- `/help/requests`
- `/help/requests/[requestId]`
- `/help/requests/create`

## Account

- `/profile`
- `/profile/edit`
- `/settings`

## Admin

Create a basic protected admin area:

- `/admin`
- `/admin/users`
- `/admin/posts`
- `/admin/products`
- `/admin/assistance`
- `/admin/resources`
- `/admin/reports`

The admin interface can remain simple.

---

# 9. Core Data Model

Start with the following entities.

## users

```text
id
email
role
created_at
updated_at
```

Roles:

```text
patient
survivor
caregiver
supporter
admin
```

## profiles

```text
id
user_id
display_name
avatar_url
bio
location
created_at
updated_at
```

## posts

```text
id
user_id
category_id
content
is_anonymous
created_at
updated_at
```

## comments

```text
id
post_id
user_id
content
created_at
updated_at
```

## post_reactions

```text
id
post_id
user_id
reaction_type
created_at
```

## reports

```text
id
reporter_id
content_type
content_id
reason
status
created_at
resolved_at
```

## resource_categories

```text
id
name
description
```

## resources

```text
id
category_id
name
description
organization
location
website_url
phone
is_active
created_at
updated_at
```

## product_categories

```text
id
name
description
```

## products

```text
id
seller_id
category_id
name
description
price
image_url
status
created_at
updated_at
```

## orders

```text
id
buyer_id
total_amount
status
created_at
updated_at
```

## order_items

```text
id
order_id
product_id
seller_id
quantity
price
```

## assistance_requests

```text
id
user_id
category_id
title
description
goal_amount
amount_raised
status
created_at
updated_at
```

## assistance_updates

```text
id
request_id
content
created_at
```

## donations

```text
id
request_id
donor_id
amount
status
created_at
```

---

# 10. Security and Privacy Baseline

This application deals with people affected by cancer. Treat privacy and safety as first-class requirements.

For the MVP:

- Do not collect unnecessary medical information.
- Do not implement medical diagnosis.
- Do not present the application as medical advice.
- Protect authenticated routes.
- Enforce authorization at the backend/database level.
- Users can only edit their own content.
- Users can only manage their own marketplace listings.
- Users can only manage their own assistance requests.
- Admin functions require an admin role.
- Do not expose private user information unnecessarily.
- Validate all user input.
- Sanitize user-generated content.
- Add basic content reporting.
- Add basic moderation capabilities.
- Never store payment card information directly in the application.

For the showcase, financial transactions may be simulated rather than using real payment processing.

---

# 11. Demo Data

The application should ship with realistic seed/demo data.

Create approximately:

### Users

10–20 demo users with different roles.

### Community

15–30 posts covering:

- Treatment
- Emotional support
- Family
- Work
- Financial
- Survivorship
- General encouragement

### Resources

30–50 resources.

Use clearly marked demo/placeholder resources unless real resources have been verified.

### Marketplace

10–20 products.

Example categories:

- Artwork
- Handmade
- Jewelry
- Journals
- Digital products
- Inspirational products

### Assistance

5–10 assistance requests.

Examples:

- Transportation
- Groceries
- Utilities
- Childcare
- Treatment-related expenses
- Housing

The demo data should make the application feel populated immediately.

---

# 12. UX Principles

The product should feel:

- Compassionate
- Patient-first
- Safe
- Hopeful
- Practical
- Non-clinical
- Easy to understand

Avoid making the application feel like a hospital portal.

The goal is to communicate that people affected by cancer are whole people who are trying to live, work, create, connect, and financially survive.

---

# 13. CARE Requirements

## Community feed

Each post should display:

- Author/avatar
- Display name
- Anonymous indicator when applicable
- Time
- Category
- Content
- Support count
- Comment count
- Report action

## Create post

Fields:

```text
Category
Post content
Post anonymously
```

Buttons:

```text
Cancel
Post
```

## Comments

Users can:

- Read comments
- Add comments
- Report comments

## Reactions

Keep reactions simple.

Use one primary supportive reaction rather than building a complex reaction system.

---

# 14. EARN Requirements

## Marketplace

Display:

- Product image
- Product name
- Price
- Seller
- Category

## Product detail

Display:

- Images
- Product name
- Description
- Price
- Seller
- Seller story/profile
- Buy button

## Create listing

Fields:

```text
Product name
Description
Price
Category
Image
Optional story
```

## Checkout

For MVP showcase:

```text
Product
Price
Buyer information
Confirm purchase
```

Then show:

```text
Purchase successful
Order number
Product
Amount
Seller
```

Do not implement real payment processing unless explicitly requested.

---

# 15. HELP Requirements

## Assistance feed

Display:

- Request title
- Category
- Requester
- Goal
- Amount raised
- Progress
- Short description

## Request detail

Display:

- Story
- Goal
- Amount raised
- Progress bar
- Updates
- Share
- Help/Donate button

## Create request

Fields:

```text
Title
Category
Amount needed
Description/story
Optional image
```

## Donation

For MVP showcase:

Allow the user to enter:

```text
$10
$25
$50
Custom amount
```

Then simulate the donation and update the progress.

Do not implement real money movement unless explicitly requested.

---

# 16. Resource Requirements

Resources should be discoverable without requiring a user account if practical.

Categories:

- Financial assistance
- Transportation
- Meals
- Housing
- Childcare
- Treatment assistance
- Emotional support
- Work/employment

Resource cards should include:

```text
Name
Organization
Description
Location
Website
Phone
```

Add:

- Search
- Category filtering
- Location filtering

---

# 17. Admin Requirements

Create a simple admin dashboard.

Dashboard metrics:

```text
Users
Community Posts
Marketplace Listings
Assistance Requests
Reports
Resources
```

Admin actions:

- View users
- Disable users
- Review reports
- Hide posts
- Remove marketplace listings
- Review assistance requests
- Create/edit resources
- Disable resources

Keep this functional but visually simple.

---

# 18. Premium Feature Preview

Do not implement the full premium system.

Create a preview page/card showing potential future functionality:

```text
Premium — Coming Soon

$5.99/month

Advanced treatment planning
Medication reminders
Document storage
Symptom tracking
Custom journals
Financial organization
Caregiver coordination
Private family updates
Enhanced marketplace tools
```

The purpose is to demonstrate the future business model, not implement it.

---

# 19. Business Model Alignment

Potential future revenue streams identified in the business model include:

- Marketplace fee
- Premium membership
- Business sponsorships
- Local advertising
- Fundraising tools
- Affiliate income
- Employer partnerships
- Nonprofit partnerships
- Grants
- Donations

The MVP should demonstrate the product mechanisms that could support these revenue streams without implementing every revenue model.

Initial focus:

1. Marketplace
2. Assistance/fundraising
3. Premium preview
4. Future sponsorship/resource opportunities

---

# 20. Development Order

Copilot Agent should implement the application in this order.

## Phase 1 — Foundation

- [ ] Inspect existing repository
- [ ] Identify current framework
- [ ] Do not replace an existing working stack without reason
- [ ] Establish project structure
- [ ] Establish environment configuration
- [ ] Configure database
- [ ] Configure authentication
- [ ] Establish reusable UI components
- [ ] Establish error/loading/empty states

## Phase 2 — Navigation and Layout

- [ ] Build application shell
- [ ] Build CARE/EARN/HELP/PROFILE navigation
- [ ] Build responsive layout
- [ ] Build reusable cards/buttons/forms/modals
- [ ] Establish design tokens

## Phase 3 — CARE

- [ ] User profiles
- [ ] Community feed
- [ ] Post creation
- [ ] Post details
- [ ] Comments
- [ ] Support reaction
- [ ] Anonymous posts
- [ ] Reporting

## Phase 4 — Resources

- [ ] Resource categories
- [ ] Resource list
- [ ] Resource details
- [ ] Search
- [ ] Filters
- [ ] Admin resource management

## Phase 5 — EARN

- [ ] Marketplace
- [ ] Product details
- [ ] Seller profiles
- [ ] Create listing
- [ ] Edit listing
- [ ] Image upload
- [ ] Demo checkout
- [ ] Order confirmation
- [ ] My listings

## Phase 6 — HELP

- [ ] Assistance feed
- [ ] Assistance detail
- [ ] Create assistance request
- [ ] Assistance updates
- [ ] Demo donations
- [ ] Progress tracking
- [ ] Sharing

## Phase 7 — Admin

- [ ] Admin dashboard
- [ ] Reports
- [ ] Users
- [ ] Posts
- [ ] Products
- [ ] Assistance requests
- [ ] Resources

## Phase 8 — Showcase Polish

- [ ] Seed data
- [ ] Empty states
- [ ] Loading states
- [ ] Error handling
- [ ] Responsive polish
- [ ] Accessibility
- [ ] Demo user accounts
- [ ] Demo walkthrough
- [ ] Final QA

---

# 21. Definition of Done

The MVP is ready for showcase when:

- [ ] A new user can create an account.
- [ ] A user can sign in/out.
- [ ] A user can navigate CARE/EARN/HELP/PROFILE.
- [ ] A user can view community posts.
- [ ] A user can create a community post.
- [ ] A user can comment.
- [ ] A user can support/react to a post.
- [ ] A user can post anonymously.
- [ ] A user can report content.
- [ ] A user can browse resources.
- [ ] A user can search/filter resources.
- [ ] A user can browse marketplace products.
- [ ] A user can view product details.
- [ ] A user can create a marketplace listing.
- [ ] A user can view seller information.
- [ ] A user can complete a simulated purchase.
- [ ] A user can create an assistance request.
- [ ] A user can view an assistance request.
- [ ] A user can make a simulated donation.
- [ ] Assistance progress updates correctly.
- [ ] A user can update their profile.
- [ ] Admin can moderate reported content.
- [ ] Admin can manage resources.
- [ ] Demo data makes the app feel populated.
- [ ] The primary demo journey works from beginning to end.
- [ ] No obvious broken links or dead-end screens exist.
- [ ] The UI works on desktop and mobile-sized screens.

---

# 22. Copilot Agent Instructions

When implementing this specification:

1. **Inspect the repository before making changes.**
2. Identify the existing framework, package manager, architecture, and conventions.
3. Reuse existing infrastructure where possible.
4. Do not introduce unnecessary dependencies.
5. Do not rewrite the entire application if a working foundation already exists.
6. Implement one feature area at a time.
7. Keep the application runnable after each major phase.
8. Prefer small, testable components.
9. Keep business logic separate from UI where practical.
10. Use TypeScript types/interfaces consistently if TypeScript is present.
11. Validate inputs on both client and server where applicable.
12. Enforce authorization server-side/database-side.
13. Do not expose secrets in client code.
14. Use environment variables for configuration.
15. Add useful error messages.
16. Add loading and empty states.
17. Use seed/demo data to make the showcase functional.
18. Do not implement real financial transactions unless explicitly instructed.
19. Do not implement medical diagnosis or medical decision-making.
20. Do not add post-MVP features simply because they appear in the business model.
21. If a requirement is ambiguous, choose the smallest implementation that supports the MVP demo.
22. Before completing each phase, verify that existing functionality still works.
23. Keep a `README.md` updated with setup and run instructions.
24. Maintain a `TODO.md` or project task list and mark completed work.
25. Document important architectural decisions.

---

# 23. Suggested Repository Structure

Adapt this to the existing project rather than forcing it.

```text
/
├── app/
│   ├── login/
│   ├── signup/
│   ├── care/
│   ├── earn/
│   ├── help/
│   ├── profile/
│   ├── settings/
│   └── admin/
│
├── components/
│   ├── ui/
│   ├── care/
│   ├── earn/
│   ├── help/
│   ├── resources/
│   └── layout/
│
├── lib/
│   ├── auth/
│   ├── database/
│   ├── validation/
│   └── utilities/
│
├── types/
│
├── data/
│   └── seed/
│
├── public/
│
├── tests/
│
├── README.md
├── TODO.md
└── MVP_SPEC.md
```

---

# 24. First Copilot Agent Task

Start by asking Copilot Agent to:

```text
Read MVP_SPEC.md completely.

Then inspect the existing repository.

Do not start by implementing every feature.

First report:

1. Current framework
2. Package manager
3. Existing application structure
4. Existing database/backend
5. Existing authentication
6. Existing UI/component system
7. Existing routes
8. Existing tests
9. Existing environment configuration
10. Any reusable code we should preserve

Then compare the repository against MVP_SPEC.md.

Create a proposed implementation plan with small milestones.

Do not make destructive architectural changes.

After presenting the plan, begin with Phase 1 Foundation only.
```

---

# 25. First Milestone

The first milestone should produce a running application with:

```text
Login
   ↓
Application Shell
   ↓
CARE | EARN | HELP | PROFILE
```

With placeholder pages for each section.

Once that foundation works, implement CARE.

Then Resources.

Then EARN.

Then HELP.

Then Admin.

Then showcase polish.

---

# 26. Guiding Principle

**Build the smallest believable product, not the smallest possible product.**

The MVP should feel like something a real patient could use, while remaining small enough that a development team can demonstrate it quickly.

The three words should remain visible throughout the product:

> **CARE. EARN. HELP.**

They are the organizing principle for the MVP.
