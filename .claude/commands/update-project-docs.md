Analyze the current project structure and update the documentation in `docs/backend/project-structure.md` to reflect the latest codebase state. Focus on:

1. **App Routes**: Check all route files in `app/` directory (page.tsx, layout.tsx, etc.)
2. **Server Actions**: Document server actions in `app/` directories
3. **API Routes**: List API route handlers in `app/api/`
4. **Components**: Document key components in `components/` (auth, UI, shared)
5. **Lib/Utils**: Document utilities in `lib/` (Supabase clients, helpers, types)
6. **Contexts**: List React contexts in `contexts/` (auth, etc.)
7. **Database Schema**: Check for new migrations in `supabase/migrations/`
8. **Supabase Setup**: Document RLS policies, triggers, and database configuration
9. **Environment Variables**: List required env vars from `.env.local`
10. **TypeScript Types**: Document key types from `lib/supabase/database.types.ts`

Keep the documentation concise and well-organized. Only update sections that have changed - don't rewrite unchanged content. Preserve the existing structure and formatting style.

After updating, provide a brief summary of the changes made.