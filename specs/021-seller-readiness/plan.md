# Plan: Seller Readiness & Web Deployment

## 🎯 Goal
Transform JOECASHIER from an Electron-only local app into a production-ready, sellable web application hosted on Vercel.

## 🛠 Technical Context
- **Frontend**: React 18, TypeScript, Tailwind CSS v4.
- **Database**: Currently `better-sqlite3` (Electron). Needs abstraction for `Supabase` or `IndexedDB`.
- **Hosting**: Vercel (Web target).
- **Persistence Strategy**: Implement a Repository pattern to swap SQLite with a Web API.

## 📋 Phase 0: Strategy & Marketing (Immediate)
1. **Sales Strategy Report**: Comprehensive advice on competing with Shopify/Square.
2. **Premium README**: Create `SALES_README.md` (Market-ready).
3. **Screenshot Guide**: Precisely which pages to capture for maximum conversion.

## 📋 Phase 1: Web Compatibility (Design)
1. **Data Layer Abstraction**:
   - Create `DatabaseProvider` interface.
   - Implement `SqliteRepository` (Current).
   - Design `SupabaseRepository` (New).
2. **Environment Switching**:
   - Detect `isElectron` vs `isWeb`.
   - Auto-select repository based on environment.
3. **Printing Fallbacks**:
   - Ensure `PrintService` uses standard `window.print()` when `electronAPI` is absent.

## 📋 Phase 2: Vercel Deployment
1. **Vite Web Config**: Specialized configuration for Vercel.
2. **Supabase Schema**: Migration of SQLite tables to Postgres (Supabase).
3. **Vercel Project Setup**: CI/CD pipeline logic.

## 🚦 Gate Evaluation
- **Build Success**: `npm run build` must work for web target.
- **Data Integrity**: Migration script for local data to cloud.
- **UX Parity**: Web version must feel as fast as the desktop version.
