
# Wongnok recipes

A modern, responsive community recipe-sharing platform — discover, share, rate, and manage delicious recipes!

## Features

- Browse, search, and filter recipes without logging in
- Share original recipes with name, image, ingredients, steps, cooking time, and difficulty
- Rate others' recipes once per recipe (members only)
- Fully responsive & beautiful design (mobile, tablet, desktop)
- Fast image loading & scalable layout for big recipe collections
- Modular, modern React frontend, Shadcn UI, Tailwind CSS
- Supabase-ready (easy backend plug-in for auth, DB, storage, RESTful API)
- All source code well-structured for easy extensibility

---

## Stack

- **Frontend:** React + Vite + Typescript + Tailwind + Shadcn UI
- **Backend:** (Recommended: Supabase/Postgres, Node.js/Express or Python/FastAPI)
- **API:** RESTful endpoints (see `/api` and Postman collection as reference)
- **Image storage:** (Supabase Storage or S3 for real deployment)
- **Authentication:** (Supabase Auth, with email & password flow)

---

## Setup & Running

1. **Install dependencies**

   ```
   npm install
   ```

2. **Run the development server**

   ```
   npm run dev
   ```

3. **(Recommended): Connect to Supabase for fullstack features:**

   - Click the green Supabase button in Lovable, connect your DB and storage.
   - See [Supabase integration docs](https://docs.lovable.dev/integrations/supabase/).

---

## Folder Structure

```
src/
  assets/           # Sample data, images
  components/       # UI components
  pages/            # Main pages and modals
  hooks/            # Custom hooks
  lib/              # Utility files
```

---

## Backend & API Endpoints

> **NOTE:** Backend and API functionality will be available when you connect to Supabase and set up your database.

**Example Endpoints:**

| Method | Endpoint                   | Description                        |
|--------|----------------------------|------------------------------------|
| POST   | `/api/register`            | Register a new user                |
| POST   | `/api/login`               | Log in a user                      |
| GET    | `/api/recipes`             | Fetch recipes, supports filters    |
| GET    | `/api/recipes/:id`         | Get recipe details                 |
| POST   | `/api/recipes`             | Create a recipe                    |
| PUT    | `/api/recipes/:id`         | Update (own) recipe                |
| DELETE | `/api/recipes/:id`         | Delete (own) recipe                |
| POST   | `/api/recipes/:id/rate`    | Rate another member's recipe       |

(See `/postman/WongnokRecipes.postman_collection.json` for API samples)

---

## Postman API Collection

A `WongnokRecipes.postman_collection.json` sample will be provided as soon as you connect your backend.

---

## Next steps

- Add Supabase: authentication, database, REST API
- Implement members-only flows (add recipe, edit, rating)
- Optimize image delivery with Supabase or cloud storage
- Make the recipes real, dynamic, and community-driven!

---

## Credits

Made with ❤️ using Lovable, Tailwind and Shadcn UI.

