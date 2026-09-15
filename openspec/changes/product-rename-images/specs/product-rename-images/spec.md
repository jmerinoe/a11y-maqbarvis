# Spec: Product Rename & Image Update

## Purpose

Defines the renaming of two t-shirt products and the replacement of all 8 product images with supplied PNG mockups.

## Requirements

### REQ-PRI-01: Rename product p001
Product p001 SHALL be renamed from "Camiseta azul" / "Blue t-shirt" to **"Camiseta"** (Spanish) / **"T-shirt"** (English) in `src/data/products.js`.

### REQ-PRI-02: Rename product p002
Product p002 SHALL be renamed from "Camiseta blanca" / "White t-shirt" to **"Camiseta de rayas"** (Spanish) / **"Striped t-shirt"** (English) in `src/data/products.js`.

### REQ-PRI-03: Replace all 8 product images
All 8 products SHALL use the supplied PNG mockup images. The `image` field in `src/data/products.js` SHALL point to the new PNG files at `/images/p00X.png` (where `p00X` matches the product ID).

### REQ-PRI-04: Copy images to public/images
The 8 supplied PNG files SHALL be copied from `ImagenesMaqueta/` into `public/images/` normalized to the `p00X.png` naming convention (no spaces, no accents) to ensure clean URLs.

### REQ-PRI-05: Remove old JPG placeholders
The old `p001.jpg` through `p008.jpg` files in `public/images/` SHALL be removed since they are no longer referenced after the change.

### REQ-PRI-06: No changes to other product attributes
For all 8 products, the price, sizes, colors, colorHex, and description fields SHALL remain unchanged. Only the `name` (for p001 and p002) and the `image` (for all 8) are modified.

### REQ-PRI-07: Other 6 products keep their names
Products p003 through p008 SHALL keep their current names in both Spanish and English. Only their image is replaced.

### REQ-PRI-08: Search still works with new names
The product search (`getFilteredProducts`) SHALL continue to filter by localized product name. Searching for "Camiseta" SHALL match p001 ("Camiseta") and p002 ("Camiseta de rayas"). Searching for "rayas" SHALL match p002. This requires no code change (the search already uses the localized name) but is asserted as a requirement.

## Scenarios

### Scenario: Product listing shows new names and images
- **Given** the attendee is on the product listing screen
- **When** they view the catalog
- **Then** p001 shows the name "Camiseta" (ES) / "T-shirt" (EN) with the basic t-shirt image
- **And** p002 shows the name "Camiseta de rayas" (ES) / "Striped t-shirt" (EN) with the striped t-shirt image
- **And** p003 through p008 show their existing names with the new PNG images

### Scenario: Product detail shows new name and image
- **Given** the attendee navigates to the p001 product detail screen
- **When** the screen renders
- **Then** the h1 shows "Camiseta" (ES) / "T-shirt" (EN)
- **And** the product image is the basic t-shirt PNG

### Scenario: Search by new name
- **Given** the attendee is on the home screen
- **When** they search for "Camiseta"
- **Then** the listing shows both p001 ("Camiseta") and p002 ("Camiseta de rayas")

### Scenario: Search by partial new name
- **Given** the attendee is on the home screen
- **When** they search for "rayas"
- **Then** the listing shows only p002 ("Camiseta de rayas")

### Scenario: Language toggle updates renamed products
- **Given** the attendee is viewing p001 in Spanish (name "Camiseta")
- **When** they toggle to English
- **Then** the product name changes to "T-shirt"

### Scenario: Old JPG images no longer present
- **Given** the project after the change is applied
- **When** the build runs
- **Then** no `p00X.jpg` files exist in `public/images/` or `dist/`
- **And** all product images are PNG files

### Scenario: Other products unchanged
- **Given** the attendee views p003 (Vaqueros slim)
- **When** the screen renders
- **Then** the name is still "Vaqueros slim" / "Slim jeans" (unchanged)
- **And** the image is the new Vaqueros PNG
