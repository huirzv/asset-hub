# Asset Hub

I want you to build a production-quality MVP for a website called "Assetly."

Assetly is a completely free, community-driven game development asset library where creators can discover, preview, upload, and download free assets for use in games.

The platform should initially focus heavily on 3D models but be designed to later support UI packs, icons, textures, materials, VFX, audio, animations, and other game-development assets.

IMPORTANT PRODUCT POSITIONING:

Assetly is NOT a paid marketplace.

There are:
- no paid assets
- no checkout
- no creator payouts
- no subscriptions required to download
- no paywalls

The core idea is:

"Free assets for your next game."

Assetly should feel like a modern combination of a game asset marketplace, a developer tool, and a design-focused community library.

It should especially appeal to Roblox, Unity, Godot, Unreal Engine, Blender, and indie game developers.

==================================================
DESIGN DIRECTION
==================================================

The design is EXTREMELY important.

I do NOT want a generic AI-generated SaaS website.

Do NOT create:
- giant gradient hero text
- excessive rounded cards everywhere
- random floating glassmorphism boxes
- excessive purple gradients
- generic SaaS illustrations
- huge amounts of unused whitespace
- cartoonish design
- excessive shadows
- every section inside a card
- a dashboard that looks like a generic admin template

I want Assetly to look like a real product made by a top-tier design team in 2026.

Design inspiration should come from the overall polish and density of modern developer/design products and marketplaces, without copying any specific website.

The aesthetic should be:

- modern
- extremely clean
- premium
- developer-focused
- slightly dark
- content-first
- visual
- fast
- sophisticated
- minimal but NOT empty
- professional
- highly polished

Use a dark charcoal / near-black interface by default.

Use neutral surfaces with subtle differences in elevation.

Use ONE tasteful accent color throughout the product.

Typography should be excellent.

Use a modern sans-serif such as Inter or Geist.

Use strong typography hierarchy.

Cards should use subtle borders rather than huge shadows.

Border radius should generally be moderate, not excessively rounded.

Animations should be subtle:
- hover transitions
- image zoom
- button feedback
- skeleton loading
- modal transitions
- dropdown transitions

No unnecessary animation.

Asset imagery should be the main visual focus.

The product should feel closer to a professional creative/developer marketplace than a marketing landing page.

==================================================
NAVIGATION
==================================================

Create a sticky top navigation.

LEFT:

Assetly logo

CENTER / MAIN:

Explore
3D Models
2D & UI
Textures
Collections

RIGHT:

Search icon
Upload
Favorites
Profile / Sign In

The navigation should remain clean and relatively compact.

Search should be extremely prominent throughout the product.

==================================================
HOMEPAGE
==================================================

Build a homepage focused on DISCOVERY rather than marketing paragraphs.

Top hero:

Small Assetly logo/brand.

Large heading:

"Free assets for your next game."

Subtitle:

"Discover free 3D models, UI, textures and more for Roblox, Unity, Godot, Unreal and beyond."

Large central search bar:

"Search models, UI, textures..."

Search should support a keyboard shortcut hint such as:

⌘ K

Under search show quick searches:

Low Poly
Environment
Furniture
Weapons
Vehicles
UI
Nature
Characters

Add a primary CTA:

"Explore assets"

Secondary:

"Upload an asset"

DO NOT make the hero excessively tall.

Users should immediately begin seeing assets below the fold.

==================================================
TRENDING ASSETS
==================================================

Create:

"Trending this week"

Display a responsive marketplace grid.

Desktop:
4-5 cards per row depending on screen width.

Tablet:
3

Mobile:
2 or 1 depending on available space.

Asset card:

Large thumbnail / preview

Below:

Asset title

Creator:
@username

Small metadata:

download count
like count

Tags such as:

3D
CC0
GLB

Engine compatibility icons/tags where appropriate.

On hover:

- subtle thumbnail scale
- favorite heart appears
- quick preview option
- card border slightly changes

Do not overcrowd cards.

Images should remain the focus.

==================================================
CATEGORIES
==================================================

Create a visually attractive category browser.

Categories:

3D Models
UI Kits
Textures
Materials
Icons
VFX
Audio
Animations

Use visual thumbnail-based categories rather than giant generic icon cards.

==================================================
CURATED COLLECTIONS
==================================================

Create a section:

"Built for your next project"

Example collections:

Cozy Cafe Starter Kit

Low Poly City

Fantasy RPG Essentials

Modern House Pack

Simulator UI Kit

Nature Essentials

Each collection should have a collage-style thumbnail.

Show:

number of assets
creator/curator

==================================================
BROWSE / EXPLORE PAGE
==================================================

Create /explore.

This is one of the most important pages.

Top:

"Explore assets"

Large search.

Below create filter controls.

Filters:

Category
Engine
File Format
License
Style
Sort

Engine:

Any
Roblox
Unity
Unreal Engine
Godot
Blender

Format:

GLB
GLTF
FBX
OBJ
BLEND
PNG
SVG
ZIP

License:

CC0
CC BY

Style:

Low Poly
Stylized
Realistic
Cartoon
Pixel
Minimal

Sort:

Trending
Most Downloaded
Newest
Most Liked

On desktop filters can use a sidebar or compact horizontal system depending on what produces the cleanest UX.

On mobile filters should open in a bottom sheet.

Show number of results.

Use pagination or infinite loading.

Use skeleton cards while loading.

The URL should eventually be able to represent filters.

==================================================
ASSET DETAIL PAGE
==================================================

Create:

/asset/[slug]

This page should feel extremely polished.

Layout:

LEFT / CENTER:

Large asset media viewer.

For 3D assets prepare the UI for an interactive GLB/glTF viewer using Google's <model-viewer> web component.

The viewer should support:

- drag to rotate
- zoom
- reset camera
- fullscreen
- loading state

If a working 3D file is not available in development, create the viewer component architecture and use a placeholder preview.

Also support an image gallery.

RIGHT SIDEBAR:

Asset name

Creator with avatar

Like button

Large primary button:

"Download Free"

Below:

file size
download count

Then metadata:

License
File formats
Polygon/triangle count if available
Uploaded date
Last updated

Compatibility:

Roblox
Unity
Unreal
Godot
Blender

Use clean badges.

==================================================
LICENSE DISPLAY
==================================================

Licensing must be extremely clear.

Example:

LICENSE

CC0

✓ Commercial use
✓ Modification
✓ Personal use
✓ Attribution not required

For CC BY:

✓ Commercial use
✓ Modification
✓ Personal use

⚠ Attribution required

Provide:

"Copy attribution"

Do NOT use AI to invent licensing permissions.

Licensing information must come from deterministic license definitions stored by the application.

==================================================
DESCRIPTION
==================================================

Below the viewer:

About this asset

Creator-written description.

Then:

Included files

Example:

restaurant.glb
restaurant.fbx
textures/
README.txt

Then:

Tags

Then:

Related Assets

==================================================
DOWNLOAD EXPERIENCE
==================================================

Downloads should NOT require an account.

Clicking:

"Download Free"

should open a clean download modal.

Show:

Asset name
Version
Download size
License

Example:

Low Poly Cafe Pack

Version 1.2
42 MB

CC0

[Download]

Also show:

"By downloading, you agree to follow the asset's license."

Do not introduce artificial countdowns or advertisements.

The experience should feel trustworthy.

==================================================
CREATOR PROFILES
==================================================

Create:

/@username

Profile header:

Avatar

Display Name

@username

Short bio

Optional external links

Stats:

Assets
Downloads
Likes

Tabs:

Assets
Collections
About

Display creator assets in the same marketplace grid.

==================================================
AUTHENTICATION
==================================================

Use Supabase authentication.

Support:

Email/password

and structure the UI so OAuth can be added later.

Downloading does NOT require authentication.

Authentication IS required for:

Uploading
Favoriting
Creating collections
Editing profile

==================================================
UPLOAD PAGE
==================================================

Create:

/upload

Make this page extremely easy.

Use a multi-step upload flow.

STEP 1

What are you uploading?

3D Model
UI
Texture
Material
Icon
VFX
Audio
Animation
Other

STEP 2

Upload files.

Support drag-and-drop.

For 3D:

main downloadable package

thumbnail

optional GLB preview

STEP 3

Asset information:

Title

Description

Category

Tags

Supported engines

File formats

License

Only allow licenses explicitly supported by Assetly.

Initially:

CC0

CC BY 4.0

Explain each license clearly.

STEP 4

Preview listing.

STEP 5

Publish.

==================================================
UPLOAD SECURITY
==================================================

Security is EXTREMELY important.

Do NOT make newly uploaded files immediately publicly downloadable.

Create an upload lifecycle:

UPLOADING
↓
QUARANTINED
↓
VALIDATING
↓
SCANNING
↓
APPROVED
↓
PUBLIC

or:

REJECTED

New uploads should initially go into PRIVATE / QUARANTINED storage.

Public asset listings should only reference approved files.

Create database fields such as:

upload_status

scan_status

scan_result

scan_timestamp

validation_status

moderation_status

Do NOT pretend a file has been virus scanned unless an actual malware scanning service has returned a successful clean result.

For now, implement the architecture and UI states required for malware scanning.

Create a server-side / Edge Function abstraction such as:

scanUploadedAsset(file)

Do NOT expose privileged service credentials in frontend code.

The actual scanning provider should be swappable later.

==================================================
FILE VALIDATION
==================================================

Perform server-side validation in addition to client-side validation.

Do not trust file extensions alone.

Validate:

file size
extension
declared MIME type
detected file type where possible
allowed format
upload ownership

Use strict file size limits.

Reject unsupported executable/script-like file types.

For V1, DO NOT allow:

.exe
.msi
.bat
.cmd
.ps1
.scr
.com
.jar

or other executable formats.

Archive files require additional caution.

Do not automatically execute, render, or trust content contained inside archives.

Prepare the backend architecture for archive inspection and malware scanning before public release.

Use randomized/object-based storage paths rather than directly trusting user-provided filenames.

Never execute uploaded files.

==================================================
3D PREVIEW SECURITY
==================================================

3D previews should use a separate validated GLB/glTF preview file.

Do not execute scripts embedded in uploaded content.

Only render supported validated formats.

The downloadable ZIP/FBX/etc should remain separate from the browser preview file.

==================================================
REPORTING
==================================================

Every asset should have:

"Report asset"

Reasons:

Stolen content
Malware / suspicious file
Incorrect license
Copyright issue
Inappropriate content
Broken download
Other

Store reports in the database.

==================================================
DATABASE
==================================================

Use Supabase.

Create appropriate tables.

PROFILES

id
username
display_name
avatar_url
bio
website
created_at

ASSETS

id
creator_id
slug
name
description
category
thumbnail_url
preview_model_url
download_file_path
license
formats
engines
tags
file_size
triangle_count
download_count
like_count
upload_status
scan_status
scan_result
validation_status
moderation_status
created_at
updated_at

FAVORITES

user_id
asset_id
created_at

COLLECTIONS

id
creator_id
name
description
slug
cover_image
created_at

COLLECTION_ASSETS

collection_id
asset_id

DOWNLOAD_EVENTS

id
asset_id
created_at

REPORTS

id
asset_id
reporter_id
reason
description
status
created_at

Use proper foreign keys and indexes.

==================================================
SUPABASE SECURITY
==================================================

Use Row Level Security.

Users should only be able to modify their own:

profile
assets
collections

Users must not be able to manually mark their own uploads as:

approved
scanned
clean

Those fields must only be changeable through trusted server-side logic.

Users must not have direct access to quarantined files belonging to other users.

Public users should only be able to retrieve assets where:

upload_status = approved

AND

moderation_status = approved

Do not expose the Supabase service-role key in the browser.

==================================================
ADMIN ARCHITECTURE
==================================================

Prepare a basic protected /admin architecture.

Do NOT spend significant time designing a giant admin dashboard.

Admin should eventually be able to see:

Pending uploads
Failed scans
Reports
Recently uploaded assets

And approve/reject content where human review is required.

==================================================
SEARCH
==================================================

V1 search does NOT need AI.

Implement good traditional search against:

name
description
tags
category

Support filters.

Design the search architecture so semantic/vector search can be added later.

==================================================
AI — FUTURE, NOT V1
==================================================

DO NOT make AI required for the website to work.

Do NOT require Groq.

Prepare architecture/documentation for future AI features:

Natural language search

Example:

"cute low poly furniture for a colorful cafe game"

AI could convert this into relevant tags/search terms.

AI asset pack generation:

"I'm making a low poly airport game."

The system could determine likely asset categories and search existing assets.

AI upload tagging:

Analyze title/description/preview and suggest tags.

AI should never determine licensing permissions.

==================================================
FAVORITES
==================================================

Logged-in users can favorite assets.

Create:

/favorites

Simple asset grid.

==================================================
COLLECTIONS
==================================================

Allow users to create collections.

Example:

"Assets for my horror game"

Users can save existing assets into collections.

Collections can eventually be public.

==================================================
RESPONSIVENESS
==================================================

The website must be excellent on:

Desktop
Laptop
Tablet
Mobile

Do not simply shrink the desktop design.

Mobile:

compact navigation
excellent search
2-column asset grid where practical
bottom-sheet filters
touch-friendly viewer controls

==================================================
ACCESSIBILITY
==================================================

Use semantic HTML.

Keyboard navigation.

Visible focus states.

Proper labels.

Good color contrast.

Alt text architecture.

Do not rely solely on color to communicate state.

==================================================
PERFORMANCE
==================================================

Performance matters heavily.

Use:

lazy-loaded images
optimized thumbnails
skeleton loading
code splitting where appropriate
efficient Supabase queries
pagination
responsive images

Do NOT download full 3D model files just to render marketplace cards.

Marketplace cards use optimized thumbnail images.

Only load the interactive 3D preview on the asset detail page or when explicitly requested.

==================================================
EMPTY STATES
==================================================

Design polished empty states.

Examples:

No favorites:

"You haven't saved anything yet."

[Explore assets]

No search results:

"No assets found."

Try removing filters or searching for something broader.

==================================================
ERROR STATES
==================================================

Create polished states for:

upload failed
download unavailable
3D preview unavailable
network error
asset removed
scan failed

Do not expose technical stack traces to users.

==================================================
TRUST
==================================================

The platform should visibly communicate:

Free assets
Clear licenses
Creator attribution
Secure download architecture

BUT:

Never display:

"Virus Free"

"100% Safe"

"Guaranteed Safe"

unless technically justified.

Once real malware scanning is implemented, appropriate wording would be:

"Scanned"

with scan status/details.

==================================================
BRAND
==================================================

Use "Assetly" as the temporary brand name throughout the application.

Centralize the brand name so it can easily be changed later.

Create a simple, modern logo mark.

Do NOT make the logo overly complicated.

The brand should feel appropriate for:

game developers
3D artists
indie developers
Roblox developers
Unity developers
Godot developers
designers

==================================================
DEMO CONTENT
==================================================

Populate development with realistic placeholder listings so the site feels alive.

Examples:

Low Poly Cafe Pack

Stylized Pine Trees

Modern Furniture Kit

Fantasy Weapons Pack

Simulator UI Kit

Low Poly City Props

Cartoon Food Pack

Sci-Fi Corridor Kit

Nature Essentials

Minimal Game Icons

Use placeholder/generated visual assets rather than copyrighted marketplace content.

Do not scrape or copy assets from other marketplaces.

==================================================
CODE QUALITY
==================================================

Build this as maintainable production-quality code.

Use reusable components.

Avoid giant components.

Keep marketplace cards reusable.

Keep filter logic modular.

Keep licensing definitions centralized.

Keep engine definitions centralized.

Keep upload validation rules centralized.

Use TypeScript.

Use clear types/interfaces for assets, creators, collections, licenses and scan statuses.

Do not hard-code mock data throughout individual components.

==================================================
IMPORTANT

Do not attempt to build every future feature right now.

The working MVP priority is:

1. Beautiful homepage
2. Explore/search
3. Asset detail page
4. 3D preview architecture
5. Downloads
6. Authentication
7. Creator profiles
8. Upload flow
9. Secure/quarantined upload architecture
10. Favorites
11. Collections
12. Reporting
13. Responsive design

AI is NOT required for V1.

Payments are NOT required.

Messaging is NOT required.

Comments are NOT required.

Following creators is NOT required.

Prioritize making the core asset discovery experience extremely polished.

Before finishing, review the entire application for:

- visual consistency
- mobile responsiveness
- broken interactions
- accessibility
- security mistakes
- exposed credentials
- upload vulnerabilities
- inconsistent spacing
- inconsistent typography
- unnecessary UI clutter

The final result should look and feel like a REAL modern game-development product, not a generated template.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/030b8ab7-4f40-4444-89e9-5bc45b518719).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
