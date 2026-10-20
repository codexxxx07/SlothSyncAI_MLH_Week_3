import { Copy, FolderOpen, History, LayoutDashboard, Settings } from 'lucide-react';

export const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    to: '/',
    icon: LayoutDashboard,
    match: (pathname) => pathname === '/',
  },
  {
    key: 'organize',
    label: 'Organize Files',
    to: '/scan',
    icon: FolderOpen,
    match: (pathname) => pathname === '/scan' || pathname === '/plan',
  },
  {
    key: 'duplicates',
    label: 'Duplicate Finder',
    to: '/duplicates',
    icon: Copy,
    match: (pathname) => pathname === '/duplicates',
  },
  {
    key: 'history',
    label: 'Activity History',
    to: '/history',
    icon: History,
    match: (pathname) => pathname === '/history',
  },
  {
    key: 'settings',
    label: 'Settings',
    to: '/settings',
    icon: Settings,
    match: (pathname) => pathname === '/settings',
  },
];

export const PAGE_META = {
  '/': {
    title: 'Dashboard',
    crumbs: [{ label: 'Dashboard' }],
  },
  '/scan': {
    title: 'Organize Files',
    crumbs: [
      { label: 'Organize Files', to: '/scan' },
      { label: 'Choose & scan' },
    ],
  },
  '/plan': {
    title: 'Review & apply',
    crumbs: [
      { label: 'Organize Files', to: '/scan' },
      { label: 'Review & apply' },
    ],
  },
  '/duplicates': {
    title: 'Duplicate Finder',
    crumbs: [{ label: 'Duplicate Finder' }],
  },
  '/history': {
    title: 'Activity History',
    crumbs: [{ label: 'Activity History' }],
  },
  '/settings': {
    title: 'Settings',
    crumbs: [{ label: 'Settings' }],
  },
};
