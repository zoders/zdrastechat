import { cn } from '../utils/cn';

export const iconButton = {
  base: 'tap-target inline-flex items-center justify-center shrink-0 rounded-2xl transition',
  ghost: 'text-gray-200 hover:text-white hover:bg-gray-800',
  subtle: 'bg-gray-800 hover:bg-gray-700',
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
};

export const input = {
  base: 'min-w-0 bg-gray-800 text-white px-4 focus:outline-none',
  rounded: 'rounded-2xl',
  pill: 'rounded-3xl',
};

export const chatLayout = {
  shell: 'app-shell flex bg-gray-950 text-white overflow-hidden',
  sidebar: (isOpen: boolean) => cn(
    'border-r border-gray-800 flex flex-col transition-all duration-300',
    isOpen ? 'w-[86vw] max-w-80 md:w-80' : 'w-0 md:w-80 overflow-hidden',
    'md:relative fixed inset-y-0 left-0 z-50 bg-gray-900 md:bg-transparent',
  ),
  sidebarHeader: 'mobile-safe-top p-3 border-b border-gray-800 flex items-center justify-between gap-3 bg-gray-900',
  brand: 'min-w-0 flex items-center gap-3',
  main: 'flex-1 flex flex-col min-w-0 relative',
  empty: 'flex-1 flex items-center justify-center text-gray-500 flex-col px-6 text-center',
  mobileOverlay: 'fixed inset-0 bg-black/60 z-40 md:hidden',
};

export const chatList = {
  root: 'flex-1 flex flex-col overflow-hidden',
  searchPanel: 'p-3 border-b border-gray-800',
  searchRow: 'flex gap-2',
  foundUser: 'mt-3 p-3 bg-gray-800 rounded-2xl flex justify-between items-center gap-3',
  list: 'flex-1 overflow-auto overscroll-contain p-2.5 space-y-2',
  item: (isSelected: boolean) => cn(
    'min-h-16 p-3.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3',
    isSelected ? 'bg-blue-600' : 'hover:bg-gray-800',
  ),
  itemBody: 'min-w-0 flex-1',
};

export const chatWindow = {
  root: 'flex-1 flex flex-col h-full min-h-0',
  header: 'mobile-safe-top min-h-14 border-b border-gray-800 flex items-center px-3 bg-gray-900 z-10',
  user: 'min-w-0 flex items-center gap-3 ml-2',
  avatar: 'shrink-0 w-9 h-9',
  messages: 'flex-1 min-h-0 overflow-auto overscroll-contain p-3 sm:p-4 space-y-4 sm:space-y-6 bg-gray-950',
  status: 'text-center text-xs text-gray-500',
  historyStart: 'text-center text-xs text-gray-600',
  initialLoading: 'text-center text-sm text-gray-500 mt-10',
  composer: 'mobile-safe-bottom p-3 sm:p-4 border-t border-gray-800 flex gap-2 sm:gap-3 bg-gray-900',
  messageRow: (isOwn: boolean) => cn('flex', isOwn ? 'justify-end' : 'justify-start'),
  messageBubble: (isOwn: boolean) => cn(
    'chat-bubble',
    isOwn ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white',
  ),
};
