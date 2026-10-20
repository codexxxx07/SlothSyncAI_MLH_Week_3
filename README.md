# SlothSync AI

**"You Relax. SlothSync Handles the Mess."**

A local-first, AI-powered desktop application that automatically helps you organize your files, clean up cluttered folders, identify duplicate files, and suggest meaningful filenames.

Built for the [Hacktoberfest 2026 Open-Source AI Challenge - Week 3: Slow and Steady](https://dev.to/challenges/hf26).

## The Problem

People accumulate hundreds or thousands of files in their Downloads, Desktop, and Documents folders but rarely have the time or motivation to organize them. Instead of manually opening files, renaming them, creating folders, and sorting everything, SlothSync AI lets you select a directory and prepare an organization plan automatically.

## Features

### 🔍 Smart Folder Scanner
- Select any directory through a native file picker
- Scan and analyze files using metadata (name, extension, size, timestamps)
- Display summary with total files, folders, storage size, and category distribution
- Support for large directories with asynchronous processing and progress indicators

### 🤖 AI-Powered File Classification
- Uses locally running Ollama models for intelligent file categorization
- Suggests appropriate categories: Documents, Images, Videos, Audio, Development, Design, Archives, Spreadsheets, Presentations, Installers, Miscellaneous
- AI validates responses before using them
- Graceful fallback to rule-based classification when AI is unavailable

### ✍️ Intelligent Filename Suggestions
- Identifies unclear filenames (e.g., `document_final2.pdf`, `IMG_20261015.jpg`)
- Suggests clearer, descriptive names using metadata and content when appropriate
- Preserves file extensions and important identifiers
- Detects filename collisions before execution
- Users can edit or reject each suggestion

### 📋 Visual Organization Plan
- Review the complete proposed organization before any changes
- Edit proposed destinations, change categories, or exclude individual files
- Clear preview showing original vs. proposed locations
- No file operations without explicit user approval

### 🛡️ Safe File Organizer
- Moves files only to approved destinations
- Creates missing folders only when necessary
- Checks for filename conflicts before execution
- Never silently overwrites files
- Handles permission errors and unavailable files
- Reports failed operations honestly
- Provides undo support for reversible operations

### 🔄 Duplicate File Detection
- Uses deterministic file hashing (SHA-256) rather than AI guesses
- Checks file size before computing hashes for efficiency
- Groups duplicates with filename, location, size, and modification date
- Provides options to open file locations for manual review
- Does not automatically delete duplicates

### 📜 Activity History and Undo
- Maintains local history of completed file operations
- Records operation type, paths, timestamps, and success status
- Chronological history screen for inspection
- Undo support for operations that can be safely reversed
- Validates file states before undoing

### ⚙️ AI Connection Settings
- Dedicated Settings page for Ollama configuration
- Configurable endpoint (default: `http://localhost:11434`)
- Configurable model name (default: `llama3.2`)
- Connection status and available model information
- Test Connection button with clear error messages
- Setup instructions for installing Ollama and pulling models

### 🌙 Privacy and Security
- All file operations performed locally
- AI inference runs through local Ollama by default
- No files uploaded to external servers without explicit consent
- Validates all filesystem paths and operations
- Prevents path traversal and unauthorized access
- Never executes AI-generated shell commands
- Keeps sensitive data out of application logs

## Technology Stack

- **Frontend**: React 19
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4
- **Desktop Framework**: Tauri 2
- **AI Runtime**: Ollama (local)
- **AI Model**: Configurable open-weight model (recommended: llama3.2)
- **File Operations**: Tauri desktop capabilities with permissioned filesystem APIs
- **Language**: Rust (Tauri backend), JavaScript (React frontend)
- **Version Control**: Git

## Prerequisites

### Required
- Node.js 18+ and npm
- Rust toolchain (for Tauri)

### Optional (for AI features)
- [Ollama](https://ollama.com) installed and running
- A compatible model pulled (e.g., `ollama pull llama3.2`)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SlothSyncAI.git
   cd SlothSyncAI
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install Tauri CLI**
   ```bash
   npm install -g @tauri-apps/cli
   ```

## Setting Up Ollama (for AI Features)

1. **Install Ollama**
   - Download from [ollama.com](https://ollama.com)
   - Follow the installation instructions for your operating system

2. **Pull a Model**
   ```bash
   ollama pull llama3.2
   ```
   Other compatible models: `mistral`, `gemma2`, `qwen2.5`

3. **Verify Ollama is Running**
   - Ollama typically starts automatically
   - Visit `http://localhost:11434` to verify
   - Or run: `ollama list`

4. **Configure in SlothSync AI**
   - Open the Settings page
   - Set the Ollama endpoint (default: `http://localhost:11434`)
   - Set the model name (default: `llama3.2`)
   - Click "Test Connection" to verify

## Development

### Run in Development Mode
```bash
npm run tauri:dev
```

This starts:
- Vite dev server for the React frontend
- Tauri development mode for the desktop application

### Build for Production
```bash
npm run tauri:build
```

This creates:
- Optimized frontend build
- Desktop application bundle for your platform

### Run Frontend Only (Web Mode)
```bash
npm run dev
```

Note: Some features (file system access) will not work in web mode.

## How to Use

1. **Scan a Folder**
   - Open "Organize Files" in the sidebar
   - Click "Choose folder" to select a directory
   - Click "Scan folder" to analyze files
   - Review the summary and category distribution

2. **Review and Apply the Plan**
   - Click "Review organization plan" to open the "Review & apply" step
   - (Optional) Click "Analyze with AI" for smart suggestions
   - Edit names, change categories and untick files you want to exclude
   - Click "Apply N changes" and confirm in the dialog
   - Nothing is moved until you confirm

3. **Find Duplicates**
   - Go to "Duplicate Finder"
   - Click "Find duplicates" to hash every scanned file (SHA-256)
   - Review duplicate groups, ordered by wasted space
   - The tool only reports - remove copies with the organize plan or your file manager

4. **View History**
   - Go to "Activity History"
   - Expand any operation to see every file involved
   - Use "Undo" to move files back to their original locations
   - Clear history only clears the log, never your files

5. **Configure Settings**
   - Go to "Settings"
   - Configure the Ollama endpoint and model, then "Save settings"
   - Test the connection and pick a model from the list
   - Toggle apply-confirmations and review privacy information

## Architecture

### Backend (Rust - Tauri)
- `src-tauri/src/lib.rs`: Core Tauri commands
  - `select_directory`: Native directory picker
  - `scan_directory`: Recursive file scanning with metadata extraction
  - `compute_file_hash`: SHA-256 hashing for duplicate detection
  - `find_duplicates`: Group files by hash
  - `move_file`: Safe file moving with validation
  - `rename_file`: Safe file renaming with collision detection

### Frontend (React)
- `src/services/`: Business logic and API calls
  - `fileScanner.js`: Directory scanning interface
  - `fileOrganizer.js`: File operations interface
  - `duplicateDetector.js`: Duplicate detection interface
  - `ollama.js`: AI service with batching and error handling
  - `operationHistory.js`: Local storage for operation history

- `src/utils/`: Utility functions
  - `categorization.js`: Extension-based categorization rules
  - `state.js`: Local storage helpers for scan results

- `src/pages/`: Application screens
  - `Overview.jsx`: Dashboard with real activity stats
  - `ScanFolders.jsx`: Folder selection and scanning
  - `OrganizationPlan.jsx`: Review and approve changes
  - `Duplicates.jsx`: Duplicate file detection
  - `ActivityHistory.jsx`: Operation history and undo
  - `Settings.jsx`: AI configuration and preferences

- `src/components/`: Reusable UI components
  - `layout/Sidebar.jsx`: Navigation sidebar
  - `layout/Header.jsx`: Header with theme toggle

### Data Flow
1. User selects directory → Tauri scans files → Returns metadata
2. Frontend categorizes files (rule-based) → Stores in localStorage
3. (Optional) Frontend sends batch to Ollama → Returns AI suggestions
4. User reviews plan → Approves changes → Tauri executes safe operations
5. Operations logged to localStorage → Available for undo

## Privacy Considerations

SlothSync AI is designed with privacy as a core requirement:

- **Local-First by Default**: All file operations happen on your computer
- **Local AI**: Ollama runs locally by default; file metadata stays on your machine
- **No External Uploads**: Files are never uploaded without explicit consent
- **Controlled Access**: Tauri permissions restrict filesystem access to user-selected locations
- **Path Validation**: All paths are validated before operations
- **No Remote Execution**: AI suggestions are never executed as shell commands
- **Minimal Logging**: Sensitive data is excluded from logs

If you configure a remote Ollama endpoint, file metadata (not contents) will be sent to that endpoint for classification. The application will indicate whether the configured endpoint is local or remote.

## Known Limitations

- File content inspection is limited; classification relies primarily on metadata
- AI suggestions are only as good as the configured model
- Large directories may take time to scan (asynchronous but not parallelized)
- Undo functionality does not work if files have been moved or deleted externally
- Windows, macOS, and Linux supported; mobile platforms not supported
- Requires Ollama for AI features; works without AI but with reduced intelligence

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

Areas for improvement:
- Parallel file scanning for large directories
- Content-based file type detection
- More sophisticated AI prompts for specific use cases
- Undo for additional operation types
- Custom category definitions
- Batch operations on duplicate groups

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built for [Hacktoberfest 2026](https://hacktoberfest.com)
- Theme: Week 3 - Slow and Steady (International Sloth Day)
- Inspired by the universal problem of digital clutter
- Powered by open-weight AI models through Ollama
- Built with Tauri, React, and Tailwind CSS

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the Settings page for AI setup instructions
- Review the README for configuration details

---

**SlothSync AI: Less manual work. Less digital clutter. More time to do what matters.** 🦥
