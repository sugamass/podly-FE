# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Speak in Japanese.

## Project Overview

**Podly** is a TikTok-style social media application for podcast content, built as an **ejected Expo React Native app**. The app combines video and podcast features in a modern, mobile-first interface with "Professional Minimalism" design theme.

## Technology Stack

- **Expo SDK**: 53.0.4 (ejected)
- **React Native**: 0.79.1 with New Architecture enabled
- **React**: 19.0.0
- **TypeScript**: 5.8.3 (strict mode)
- **Navigation**: Expo Router v5 (file-based routing with typed routes)
- **State Management**: Zustand 5.0.2
- **Styling**: NativeWind 4.1.23 (Tailwind CSS for React Native)
- **Audio**: React Native Track Player 4.1.1
- **Backend**: Supabase 2.50.0 (BaaS with auth, real-time, storage)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on specific platforms (ejected)
npm run android    # expo run:android
npm run ios        # expo run:ios

# Build for production (ejected)
npx expo run:android --variant release
npx expo run:ios --configuration Release
```

## Code Architecture

### Application Structure (`/app`)

File-based routing with Expo Router v5:

- `(tabs)/` - Tab navigation with typed routes
- `modal.tsx` - Modal presentations
- `create-*.tsx` - Multi-step content creation flow
- `edit-profile/` - Profile editing screens

### State Management Pattern

- **Global**: Zustand stores (`store/authStore.ts`, `store/podcastStore.ts`)
- **Local**: React hooks with TypeScript interfaces
- **Persistence**: AsyncStorage for auth state

### Component Architecture

- Reusable components in `/components`
- Feature-specific components (AudioPlayer, AuthModal, PodcastActions)
- Custom hooks in `/hooks` for business logic
- Typed props with comprehensive interfaces

### Service Layer (`/services`)

- `supabase.ts` - Primary data layer with comprehensive TypeScript types
- `TrackPlayerService.ts` - Audio playback configuration
- External APIs for content generation (`scriptGenerator.ts`, `audioGenerator.ts`)
- Database operation abstractions

## Critical Development Rules

### 1. Ejected Project Constraints

- **Native Code**: Handle ios/android folder changes carefully
- **Dependencies**: Test both platforms when adding native dependencies
- **Builds**: Use platform-specific build processes

### 2. Database Operations

- **No Migrations**: Never create database migration files (\*.sql)
- **Direct Access**: Use Supabase client methods only
- **Schema Reference**: Check `docs/db_schema.md` for current structure
- **ID Generation**: Use helper functions in `services/supabase.ts` (except profiles.id which remains UUID)

### 3. External API Integration

- **Script Generation**: Use application server API, not Supabase
- **Audio Generation**: Use application server API, not Supabase
- **Error Handling**: Implement proper fallbacks for external API failures
- **Configuration**: Store API endpoints in environment variables

### 4. UI Design System

**Theme**: "Professional Minimalism" with dark mode focus

**Color Palette**:

- Background: #121620 (deep dark blue)
- Card: #1E2430 (matte charcoal)
- Primary: #4F7CFF (professional blue)
- Secondary: #6AD5E8 (soft teal)
- Highlight: #F2994A (orange)

**4px Grid System**: All spacing, sizing, borders must be multiples of 4px

- Minimum: 4px
- Common: 8px, 12px, 16px, 20px, 24px, 32px
- Sections: 40px, 48px, 64px
- Exception: Font sizes prioritize readability over grid

### 5. Code Quality Standards

- **TypeScript**: Strict mode, all props/state typed
- **Styling**: NativeWind classes preferred over inline styles
- **Icons**: Ionicons for consistency
- **No Emojis**: Prohibited in console.log, errors, system messages
- **Path Aliases**: Use `@/*` for root-relative imports

### 6. Media and Performance

- **Video**: expo-video for playback
- **Audio**: react-native-track-player for background playback
- **Images**: expo-image with optimization
- **Lists**: FlatList for large datasets
- **Memoization**: React.memo, useMemo, useCallback appropriately

## Database Schema (Supabase)

### Core Tables

- **profiles**: User info (UUID id linked to auth.users)
- **podcasts**: Content with metadata, scripts, audio URLs (VARCHAR(255) ids)
- **genres**: Content categorization (VARCHAR(255) ids)
- **likes/saves/follows**: Social interactions (VARCHAR(255) ids)
- **play_history**: Progress tracking (VARCHAR(255) ids)
- **bgm**: Background music (VARCHAR(255) ids)

### Authentication

- Supabase Auth with email/password
- Row Level Security (RLS) policies enforced
- AsyncStorage for session persistence

### ID Generation

- Use helper functions: `generateId()`, `generateUUIDLikeId()`, `generateSemanticId()`
- Exception: `profiles.id` remains UUID (linked to auth.users)

## File Organization

```
app/                 # Expo Router v5 file-based routing
├── (tabs)/         # Tab navigation
├── _layout.tsx     # Root layout
├── modal.tsx       # Modal screens
└── create-*.tsx    # Content creation flow

components/         # Reusable UI components
store/             # Zustand state management
services/          # External integrations
hooks/             # Custom React hooks
utils/             # Utility functions
constants/         # App constants
assets/            # Static files
```

## Testing and Debugging

- Use Expo development tools for debugging
- Test on both iOS and Android for ejected features
- Check Supabase dashboard for backend issues
- Monitor external API rate limits and errors
- Use TypeScript strict mode for compile-time error catching

## Key Features

- **TikTok-Style Feed**: Vertical scrolling with full-screen immersion
- **Audio Playback**: Background audio with progress tracking
- **Content Creation**: Multi-step flow with script/audio generation
- **Social Features**: Following, likes, saves, comments
- **Real-time Updates**: Supabase real-time subscriptions
