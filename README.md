# Nano

A minimalist music streaming desktop application built with Tauri 2.0 and Next.js 15. Upload, organize, and play your personal music collection with a clean, focused interface.

![Nano Screenshot](public/tauri-nextjs-template-2_screenshot.png)

## Features

- 🎵 **Personal Music Library** - Upload and manage your music collection
- 🎧 **Audio Player** - Built-in player with visualizations
- 🔐 **Authentication** - Secure login with email/password or OAuth (Google, GitHub)
- 📱 **Cross-Platform** - Runs on Windows, macOS, and Linux
- 🎨 **Modern UI** - Built with TailwindCSS 4 and Radix UI components
- 🌓 **Theme Support** - Light and dark mode
- 📊 **Audio Metadata** - Automatic extraction of track information and cover art
- 🚀 **Fast & Lightweight** - Native performance with a small footprint

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **TailwindCSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Desktop
- **Tauri 2.0** - Desktop application framework
- **Rust** - Backend runtime

### Backend & Services
- **Supabase** - Authentication and database
- **Supabase Storage** - File storage for audio files

### Audio & Media
- **react-h5-audio-player** - Audio player component
- **jsmediatags** - Audio metadata extraction
- **audiomotion-analyzer** - Audio visualizations
- **lofty** (Rust) - Audio metadata extraction on backend

### Development Tools
- **Biome** - Fast formatter and linter
- **ESLint** - Additional linting rules
- **Vitest** - Unit testing framework
- **pnpm** - Package manager

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** - Install via `npm install -g pnpm` or [see pnpm docs](https://pnpm.io/installation)
- **Rust** (latest stable) - [Install Rust](https://www.rust-lang.org/tools/install)
- **System Dependencies** for Tauri:
  - **Linux**: `libwebkit2gtk-4.0-dev`, `build-essential`, `curl`, `wget`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Microsoft Visual Studio C++ Build Tools

### Installing System Dependencies

#### Linux (Debian/Ubuntu)
```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

#### macOS
```bash
xcode-select --install
```

#### Windows
Install [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

## Configuration

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nano
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Supabase

Nano requires a Supabase project for authentication and file storage. Follow these steps:

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **API** in your Supabase dashboard
3. Copy your **Project URL** and **anon/public key**

4. Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local  # If .env.example exists, or create manually
```

5. Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Supabase Database

This project includes database migrations in the `supabase/migrations/` directory. You can apply them using either the Supabase CLI or manually via the SQL Editor.

#### Option A: Using Supabase CLI (Recommended)

If you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed:

1. Link your local project to your Supabase project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   You can find your project ref in your Supabase dashboard URL: `https://supabase.com/dashboard/project/<project-ref>`

2. Apply the migrations:
   ```bash
   supabase db push
   ```

This will apply all migrations in the `supabase/migrations/` directory to your remote Supabase project.

#### Option B: Manual Application via SQL Editor

If you prefer to apply migrations manually:

1. Go to **SQL Editor** in your Supabase dashboard
2. Open the migration file: `supabase/migrations/20251119043555_remote_schema.sql`
3. Copy the entire contents of the file
4. Paste it into the SQL Editor
5. Click **Run** to execute the migration

The migration includes:
- `audio_files` table - Stores your music tracks
- `playlists` table - User-created playlists
- `playlist_tracks` table - Junction table for playlist-track relationships
- Row Level Security (RLS) policies for all tables
- Indexes for optimal query performance
- Foreign key constraints

### 5. Configure Supabase Storage

Nano requires two storage buckets: one for audio files and one for cover art.

#### Create Audio Files Bucket

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket named `audio-files`
3. Make it **Private** (not public)
4. Update the bucket policies to allow authenticated users access to their own top-level folder:

```sql
-- Allow authenticated users to upload audio files
CREATE POLICY "Authenticated users can upload audio files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'audio-files');
```

#### Create Cover Art Bucket

1. Create another bucket named `cover-art`
2. Make it **Public** (so cover art images can be displayed)
3. Update the bucket policies:

For audio files bucket:
```sql
CREATE POLICY "Authenticated users can upload audio files to their own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'audio-files' and (select auth.uid()::text) = (storage.foldername(name))[1]);

  CREATE POLICY "Authenticated users can update audio files in their own folder"
  ON storage.objects FOR UPDATE
  TO authenticated
  WITH CHECK (bucket_id = 'audio-files' and (select auth.uid()::text) = (storage.foldername(name))[1]);

  CREATE POLICY "Authenticated users can delete audio files in their own folder"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'audio-files' and (select auth.uid()::text) = (storage.foldername(name))[1]);

  CREATE POLICY "Authenticated users can read audio files in their own folder"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'audio-files' and (select auth.uid()::text) = (storage.foldername(name))[1]);
```

For cover art bucket:
```sql
-- Allow authenticated users to upload cover art
CREATE POLICY "Authenticated users can upload cover art"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cover-art');

-- Allow public read access for cover art
CREATE POLICY "Public can read cover art"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'cover-art');

-- Allow users to delete their own cover art
CREATE POLICY "Users can delete their own cover art"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'cover-art');
```

**Note**: If you use different bucket names, update them in `src/app/upload/page.tsx`.

### 6. Configure Tauri App Identifier

Before building for production, update the app identifier in `src-tauri/tauri.conf.json`:

```json
{
  "identifier": "com.yourcompany.nano"
}
```

Replace `com.yourcompany.nano` with your own unique identifier (e.g., `com.yourname.nano`).

## Development

### Running the Development Server

To run the app in development mode with hot reload:

```bash
pnpm tauri dev
```

This command will:
- Start the Next.js development server on `http://localhost:3000`
- Launch a Tauri window with the app
- Enable hot module replacement (HMR) for both frontend and backend changes

**Note**: The first run may take longer as it compiles the Rust backend.

### Running Next.js Only (Web Development)

If you want to develop the web interface without Tauri:

```bash
pnpm dev
```

This starts only the Next.js development server. Note that Tauri-specific features (like file system access) won't work in this mode.

### Opening Developer Tools

In the Tauri window, press:
- **Windows/Linux**: `Ctrl + Shift + I`
- **macOS**: `Cmd + Option + I`

## Building

### Building for Production

To build the application for your current platform:

```bash
pnpm tauri build
```

This will:
1. Build the Next.js frontend as a static export
2. Compile the Rust backend
3. Bundle everything into a native application
4. Output the installer/bundle in `src-tauri/target/release/bundle/`

### Building for Specific Platforms

#### Linux

You can use the provided build script:

```bash
./build_linux.sh
```

Or build manually:

```bash
pnpm tauri build --target x86_64-unknown-linux-gnu
```

#### macOS

```bash
pnpm tauri build --target aarch64-apple-darwin  # Apple Silicon
pnpm tauri build --target x86_64-apple-darwin   # Intel
```

#### Windows

```bash
pnpm tauri build --target x86_64-pc-windows-msvc
```

**Note**: Cross-platform building requires additional setup. See [Tauri's documentation](https://v2.tauri.app/guides/building/cross-platform) for details.

## Project Structure

```
nano/
├── src/                      # Next.js frontend source
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Home page
│   │   ├── login/            # Login page
│   │   ├── library/          # Music library page
│   │   ├── upload/           # Upload page
│   │   └── settings/         # Settings page
│   ├── components/           # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── audio-player.tsx  # Audio player component
│   │   ├── auth-guard.tsx    # Authentication guard
│   │   └── ...
│   ├── contexts/             # React contexts
│   │   ├── auth-context.tsx  # Authentication context
│   │   └── player-context.tsx # Audio player context
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   │   ├── supabase.ts       # Supabase client
│   │   └── utils.ts          # Utility functions
│   └── styles/               # Global styles
├── src-tauri/                # Tauri backend (Rust)
│   ├── src/                  # Rust source files
│   ├── Cargo.toml            # Rust dependencies
│   ├── tauri.conf.json       # Tauri configuration
│   └── icons/                # Application icons
├── public/                   # Static assets
├── dist/                     # Next.js build output (generated)
├── package.json              # Node.js dependencies and scripts
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── biome.json                # Biome linter/formatter config
└── README.md                 # This file
```

## Available Scripts

- `pnpm dev` - Start Next.js development server (web only)
- `pnpm tauri dev` - Start development with Tauri window
- `pnpm build` - Build Next.js frontend for production
- `pnpm tauri build` - Build complete Tauri application
- `pnpm start` - Start production Next.js server (web only)
- `pnpm lint` - Run Biome and ESLint
- `pnpm fix` - Auto-fix linting issues
- `pnpm test` - Run Vitest tests
- `pnpm tauri` - Run Tauri CLI commands

## Code Quality

This project uses:

- **Biome** - Fast formatter and linter for TypeScript/JavaScript
- **ESLint** - Additional Next.js-specific linting rules
- **rustfmt** - Rust code formatter (runs automatically)
- **clippy** - Rust linter (runs automatically)

### Formatting Code

```bash
pnpm fix
```

This will automatically format and fix linting issues in your code.

## Testing

Run tests with:

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test --watch
```

## Troubleshooting

### Common Issues

#### "Supabase URL and Anon Key must be set"

Make sure you've created a `.env.local` file with your Supabase credentials. See the [Configuration](#configuration) section.

#### "ReferenceError: window is not defined"

This occurs when Tauri APIs are used in server-side code. Ensure Tauri imports are:
- Inside client components (`"use client"` directive)
- Dynamically imported when needed
- Used only in browser contexts

#### Build fails on Linux

Ensure all system dependencies are installed. See [Prerequisites](#prerequisites).

#### Audio files not uploading

Check:
1. Supabase Storage bucket exists and is properly configured
2. Storage policies allow authenticated users to upload
3. File size limits in Supabase Storage settings

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting and tests (`pnpm lint && pnpm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

See [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Tauri](https://tauri.app/) and [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/) and [ShadCN](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Note**: This is a personal music streaming application. Make sure you have the rights to upload and stream the music files you use with this application.
