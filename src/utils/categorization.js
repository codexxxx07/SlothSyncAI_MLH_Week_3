export const CATEGORIES = {
  DOCUMENTS: 'Documents',
  IMAGES: 'Images',
  VIDEOS: 'Videos',
  AUDIO: 'Audio',
  DEVELOPMENT: 'Programming and Development',
  DESIGN: 'Design and Creative Assets',
  ARCHIVES: 'Archives',
  SPREADSHEETS: 'Spreadsheets and Data',
  PRESENTATIONS: 'Presentations',
  INSTALLERS: 'Installers',
  MISCELLANEOUS: 'Miscellaneous',
};

export const CATEGORY_MAP = {
  [CATEGORIES.DOCUMENTS]: [
    'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages', 'epub', 'mobi',
    'tex', 'md', 'markdown', 'csv', 'log',
  ],
  [CATEGORIES.IMAGES]: [
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff',
    'heic', 'raw', 'cr2', 'nef', 'arw',
  ],
  [CATEGORIES.VIDEOS]: [
    'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'mpeg',
    '3gp', 'ogv',
  ],
  [CATEGORIES.AUDIO]: [
    'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus', 'aiff',
  ],
  [CATEGORIES.DEVELOPMENT]: [
    'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp',
    'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'rust',
    'html', 'css', 'scss', 'sass', 'less', 'json', 'xml', 'yaml', 'yml',
    'sql', 'sh', 'bash', 'ps1', 'dart', 'lua', 'r', 'm', 'pl', 'vue',
    'svelte', 'ex', 'exs', 'erl', 'hs', 'nim', 'zig', 'jl', 'fs', 'fsx',
  ],
  [CATEGORIES.DESIGN]: [
    'psd', 'ai', 'sketch', 'fig', 'xd', 'indd', 'ae', 'prproj', 'blend',
    'c4d', 'obj', 'fbx', 'stl', 'gltf', 'glb',
  ],
  [CATEGORIES.ARCHIVES]: [
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'dmg', 'pkg',
    'deb', 'rpm', 'apk', 'ipa', 'jar', 'war', 'ear',
  ],
  [CATEGORIES.SPREADSHEETS]: [
    'xls', 'xlsx', 'ods', 'numbers', 'tsv',
  ],
  [CATEGORIES.PRESENTATIONS]: [
    'ppt', 'pptx', 'odp', 'key',
  ],
  [CATEGORIES.INSTALLERS]: [
    'exe', 'msi', 'app', 'dmg', 'deb', 'rpm', 'sh', 'bat', 'cmd',
  ],
};

export const categorizeByExtension = (extension) => {
  const ext = extension.toLowerCase();

  for (const [category, extensions] of Object.entries(CATEGORY_MAP)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }

  return CATEGORIES.MISCELLANEOUS;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown';

  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
