import {
  Archive,
  Code2,
  File,
  FileQuestion,
  FileText,
  Film,
  Image,
  Music,
  Package,
  PenTool,
  Presentation,
  Table2,
} from 'lucide-react';
import { CATEGORIES } from './categorization';

export const CATEGORY_ICONS = {
  [CATEGORIES.DOCUMENTS]: FileText,
  [CATEGORIES.IMAGES]: Image,
  [CATEGORIES.VIDEOS]: Film,
  [CATEGORIES.AUDIO]: Music,
  [CATEGORIES.DEVELOPMENT]: Code2,
  [CATEGORIES.DESIGN]: PenTool,
  [CATEGORIES.ARCHIVES]: Archive,
  [CATEGORIES.SPREADSHEETS]: Table2,
  [CATEGORIES.PRESENTATIONS]: Presentation,
  [CATEGORIES.INSTALLERS]: Package,
  [CATEGORIES.MISCELLANEOUS]: FileQuestion,
};

export const categoryIcon = (category) => CATEGORY_ICONS[category] || File;

export const fileExtensionLabel = (extension, fallback = 'FILE') => {
  if (!extension) return fallback;
  return String(extension).replace(/^\./, '').toUpperCase();
};
