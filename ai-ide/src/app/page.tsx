"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BundledLanguage } from "shiki";
import {
  type GroupImperativeHandle,
  type PanelImperativeHandle,
} from "react-resizable-panels";
import {
  buildOpenLayout,
  PANEL_DEFAULT,
  type PanelId,
} from "@/components/workspace-layout";
import {
  BellIcon,
  Blocks,
  CalculatorIcon,
  TrashIcon,
  CalendarIcon,
  ClipboardPasteIcon,
  CodeIcon,
  Command,
  CopyIcon,
  CreditCardIcon,
  FileTextIcon,
  Files,
  FolderIcon,
  FolderPlusIcon,
  GitBranch,
  HelpCircleIcon,
  HomeIcon,
  ImageIcon,
  InboxIcon,
  LayoutGridIcon,
  ListIcon,
  PlusIcon,
  ScissorsIcon,
  Search,
  SettingsIcon,
  Sparkles,
  UserIcon,
  X,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Command as CommandPrimitive,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/toast";

import { cn } from "@/lib/utils";
import { WorkspaceLayout } from "@/components/workspace-layout";

// Types
export interface MockFile {
  path: string;
  name: string;
  language: BundledLanguage;
  content: string;
}

// Mock file contents
const mockFiles: MockFile[] = [
  {
    content: `import { useState } from "react";
import { Button } from "./components/button";
import { Input } from "./components/input";
import { validateForm } from "./utils/helpers";

export function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = () => {
    const validation = validateForm({ name, email });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    console.log("Form submitted:", { name, email });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Contact Form</h1>
      <Input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.map((error) => (
        <p key={error} className="text-red-500">{error}</p>
      ))}
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}`,
    language: "tsx",
    name: "app.tsx",
    path: "src/app.tsx",
  },
  {
    content: `import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../utils/helpers";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium",
          "transition-colors focus-visible:outline-none focus-visible:ring-2",
          variant === "primary" && "bg-blue-500 text-white hover:bg-blue-600",
          variant === "secondary" && "bg-gray-200 text-gray-900 hover:bg-gray-300",
          variant === "ghost" && "hover:bg-gray-100",
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-10 px-4",
          size === "lg" && "h-12 px-6 text-lg",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";`,
    language: "tsx",
    name: "button.tsx",
    path: "src/components/button.tsx",
  },
  {
    content: `import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../utils/helpers";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border px-3 py-2 text-sm",
          "focus-visible:outline-none focus-visible:ring-2",
          error ? "border-red-500" : "border-gray-300",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";`,
    language: "tsx",
    name: "input.tsx",
    path: "src/components/input.tsx",
  },
  {
    content: `export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface FormData {
  name: string;
  email: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateForm(data: FormData): ValidationResult {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push("Name is required");
  }

  if (!data.email.trim()) {
    errors.push("Email is required");
  } else if (!isValidEmail(data.email)) {
    errors.push("Invalid email format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}`,
    language: "typescript",
    name: "helpers.ts",
    path: "src/utils/helpers.ts",
  },
  {
    content: `{
  "name": "my-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint src"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}`,
    language: "json",
    name: "package.json",
    path: "package.json",
  },
  {
    content: `# My App

A simple React application with form validation.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- Contact form with validation
- Reusable Button and Input components
- TypeScript support
`,
    language: "markdown",
    name: "README.md",
    path: "README.md",
  },
];

const LayoutLeftIcon = ({ active }: { active?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="size-3.5"
  >
    <rect
      x="1.5"
      y="2"
      width="13"
      height="12"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <line
      x1="5.5"
      y1="2"
      x2="5.5"
      y2="14"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    {active && (
      <rect
        x="2"
        y="2.5"
        width="3.2"
        height="11"
        fill="currentColor"
        opacity="0.45"
      />
    )}
  </svg>
);

const LayoutBottomIcon = ({ active }: { active?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="size-3.5"
  >
    <rect
      x="1.5"
      y="2"
      width="13"
      height="12"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <line
      x1="1.5"
      y1="10"
      x2="14.5"
      y2="10"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    {active && (
      <rect
        x="2"
        y="10.5"
        width="12"
        height="3"
        fill="currentColor"
        opacity="0.45"
      />
    )}
  </svg>
);

const LayoutRightIcon = ({ active }: { active?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="size-3.5"
  >
    <rect
      x="1.5"
      y="2"
      width="13"
      height="12"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <line
      x1="10.5"
      y1="2"
      x2="10.5"
      y2="14"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    {active && (
      <rect
        x="10.8"
        y="2.5"
        width="3.2"
        height="11"
        fill="currentColor"
        opacity="0.45"
      />
    )}
  </svg>
);

export default function Page() {
  // Layout panel open states. These mirror the actual panel sizes: dragging a
  // panel fully closed/open flips the matching toggle, and vice versa.
  const [openState, setOpenState] = useState<Record<PanelId, boolean>>(() => ({
    explorer: true,
    chat: true,
    artifact: true,
    terminal: false,
  }));
  const [activeActivityTab, setActiveActivityTab] = useState<string>("explorer");

  const isExplorerOpen = openState.explorer;
  const isChatPanelOpen = openState.chat;
  const isArtifactOpen = openState.artifact;
  const isTerminalOpen = openState.terminal;

  // Group refs (outer row + code/terminal column) and per-panel refs for toggles.
  const outerGroupRef = useRef<GroupImperativeHandle | null>(null);
  const codeGroupRef = useRef<GroupImperativeHandle | null>(null);
  const explorerPanelRef = useRef<PanelImperativeHandle | null>(null);
  const chatPanelRef = useRef<PanelImperativeHandle | null>(null);
  const codePanelRef = useRef<PanelImperativeHandle | null>(null);
  const terminalPanelRef = useRef<PanelImperativeHandle | null>(null);

  // Command Dropdown State (Direct anchored dropdown from centered top search bar)
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // File tree & editor state
  const [selectedPath, setSelectedPath] = useState<string>("src/app.tsx");
  const [openTabs, setOpenTabs] = useState<string[]>([
    "src/app.tsx",
    "src/components/button.tsx",
    "src/utils/helpers.ts",
  ]);
  const [currentFile, setCurrentFile] = useState<MockFile>(mockFiles[0]);

  // Status line state
  const [status, setStatus] = useState<"ready" | "streaming" | "submitted">(
    "ready"
  );

  // Keyboard shortcut listener for Windows Search Dropdown (Ctrl+Q & Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        (e.key === "q" || e.key === "Q" || e.key === "k" || e.key === "K") &&
        (e.ctrlKey || e.metaKey)
      ) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      } else if (e.key === "Escape" && isCommandOpen) {
        e.preventDefault();
        setIsCommandOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isCommandOpen]);

  // Handle file selection
  const handleFileSelect = useCallback((path: string) => {
    setSelectedPath(path);
    const file = mockFiles.find((f) => f.path === path);
    if (file) {
      setCurrentFile(file);
      setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
    }
  }, []);

  // Toggles: flip a panel's state. Closing collapses it; opening builds the row
  // afresh from current sizes via `buildOpenLayout`. Imperative panel calls run
  // in the event handler (never inside a setState updater, which React may
  // invoke during render).
  const togglePanel = useCallback(
    (panel: PanelId, ref: React.RefObject<PanelImperativeHandle | null>, onOpen?: () => void) => {
      const open = !openState[panel];
      if (open) onOpen?.();
      else ref.current?.collapse();
      setOpenState((s) => ({ ...s, [panel]: open }));
    },
    [openState]
  );

  const openHorizontalPanel = useCallback((panel: PanelId) => {
    const current = outerGroupRef.current?.getLayout();
    if (!current) return;
    outerGroupRef.current?.setLayout(
      buildOpenLayout(current, panel, PANEL_DEFAULT, ["explorer", "chat", "artifact"])
    );
  }, []);

  const handleToggleExplorer = useCallback(() => {
    togglePanel("explorer", explorerPanelRef, () => openHorizontalPanel("explorer"));
  }, [togglePanel, openHorizontalPanel]);

  const handleToggleChatPanel = useCallback(() => {
    togglePanel("chat", chatPanelRef, () => openHorizontalPanel("chat"));
  }, [togglePanel, openHorizontalPanel]);

  const handleToggleArtifact = useCallback(() => {
    togglePanel("artifact", codePanelRef, () => openHorizontalPanel("artifact"));
  }, [togglePanel, openHorizontalPanel]);

  const handleToggleTerminal = useCallback(() => {
    togglePanel("terminal", terminalPanelRef, () => terminalPanelRef.current?.expand());
  }, [togglePanel]);

  // Called by the layout when a drag (or release snap) opens/closes a panel.
  const handleOpenStateChange = useCallback((panel: PanelId, isOpen: boolean) => {
    setOpenState((s) => (s[panel] === isOpen ? s : { ...s, [panel]: isOpen }));
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground select-none">
      {/* 1. TOP HEADER BAR: 100% end-to-end full width, solid stationary framing */}
      <header className="relative flex h-9 w-full shrink-0 items-center justify-between border-b border-border/60 bg-muted/40 px-0 text-xs z-30">
        {/* Left: App Icon (Aligned exactly with 44px activity bar) + Stationary Solid File | Edit Framing */}
        <div className="flex items-center h-full">
          {/* Top Left Icon Container (Fixed 44px width, aligned with collapsed sidebar icon bar) */}
          <div className="flex w-11 shrink-0 h-full items-center justify-center border-r border-border/60 bg-muted/30">
            <div className="flex size-5 items-center justify-center rounded bg-primary text-primary-foreground font-mono text-[10px] font-bold shadow-2xs">
              AI
            </div>
          </div>

          {/* Stationary File | Edit Menus with solid framing & Windows shortcuts */}
          <div className="flex items-center h-full px-2 gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="h-6 rounded px-2 text-[11px] font-medium text-muted-foreground hover:bg-accent/80 hover:text-foreground transition-colors focus-visible:outline-none cursor-pointer"
                  >
                    File
                  </button>
                }
              />
              <DropdownMenuContent align="start" className="w-52 text-xs">
                <DropdownMenuItem
                  onClick={() =>
                    toast.add({
                      title: "New File created",
                      description: "untitled-1.tsx",
                    })
                  }
                >
                  New File
                  <DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    toast.add({
                      title: "Opening File Dialog...",
                    })
                  }
                >
                  Open File...
                  <DropdownMenuShortcut>Ctrl+O</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    toast.add({
                      title: "Saved",
                      description: selectedPath,
                    })
                  }
                >
                  Save
                  <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    toast.add({
                      title: "Saved All Files",
                    })
                  }
                >
                  Save All
                  <DropdownMenuShortcut>Ctrl+Shift+S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    const filtered = openTabs.filter((t) => t !== selectedPath);
                    setOpenTabs(filtered);
                    if (filtered.length > 0) {
                      const file = mockFiles.find(
                        (f) => f.path === filtered[filtered.length - 1]
                      );
                      if (file) {
                        setSelectedPath(file.path);
                        setCurrentFile(file);
                      }
                    }
                  }}
                >
                  Close Editor
                  <DropdownMenuShortcut>Ctrl+W</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-muted-foreground/30 text-[10px]">|</span>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="h-6 rounded px-2 text-[11px] font-medium text-muted-foreground hover:bg-accent/80 hover:text-foreground transition-colors focus-visible:outline-none cursor-pointer"
                  >
                    Edit
                  </button>
                }
              />
              <DropdownMenuContent align="start" className="w-52 text-xs">
                <DropdownMenuItem
                  onClick={() =>
                    toast.add({
                      title: "Undo action performed",
                    })
                  }
                >
                  Undo
                  <DropdownMenuShortcut>Ctrl+Z</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    toast.add({
                      title: "Redo action performed",
                    })
                  }
                >
                  Redo
                  <DropdownMenuShortcut>Ctrl+Y</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    toast.add({
                      title: "Cut to clipboard",
                    })
                  }
                >
                  Cut
                  <DropdownMenuShortcut>Ctrl+X</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(currentFile.content);
                    toast.add({
                      title: "Copied to clipboard",
                    });
                  }}
                >
                  Copy
                  <DropdownMenuShortcut>Ctrl+C</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    toast.add({
                      title: "Pasted from clipboard",
                    })
                  }
                >
                  Paste
                  <DropdownMenuShortcut>Ctrl+V</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    toast.add({
                      title: "Document formatted",
                    })
                  }
                >
                  Format Document
                  <DropdownMenuShortcut>Alt+Shift+F</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Center: True-Centered Command Palette / Search Dropdown (Drops down directly from the bar without screen blur) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-2 pointer-events-auto z-40">
          <button
            type="button"
            onClick={() => setIsCommandOpen((open) => !open)}
            className={cn(
              "flex h-6 w-full items-center justify-between rounded-md border border-border/70 bg-background/85 px-2.5 text-[11px] text-muted-foreground shadow-xs hover:border-border hover:bg-background transition-all cursor-pointer",
              isCommandOpen && "border-primary/60 ring-1 ring-primary/40 bg-background text-foreground"
            )}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Search className="size-3 shrink-0 text-muted-foreground" />
              <span className="truncate">Type a command or search files...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/80 bg-muted/60 px-1 font-mono text-[9px] text-muted-foreground font-semibold">
              Ctrl+Q
            </kbd>
          </button>

          {/* Direct Dropdown anchored right underneath the top search bar (No backdrop screen blur) */}
          {isCommandOpen && (
            <>
              {/* Clean click-outside dismisser without blurring screen */}
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setIsCommandOpen(false)}
              />

              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-lg border border-border/80 bg-popover text-popover-foreground shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                <CommandPrimitive className="w-full">
                  <CommandInput
                    autoFocus
                    placeholder="Type a command or search..."
                    className="h-8.5 text-xs"
                  />
                  <CommandList className="max-h-80 overflow-y-auto p-1 text-xs">
                    <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                      No results found.
                    </CommandEmpty>
                    <CommandGroup heading="Navigation">
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Navigated Home" });
                        }}
                      >
                        <HomeIcon className="mr-2 size-3.5" />
                        <span>Home</span>
                        <CommandShortcut>Ctrl+H</CommandShortcut>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Opened Inbox" });
                        }}
                      >
                        <InboxIcon className="mr-2 size-3.5" />
                        <span>Inbox</span>
                        <CommandShortcut>Ctrl+I</CommandShortcut>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Opened Documents" });
                        }}
                      >
                        <FileTextIcon className="mr-2 size-3.5" />
                        <span>Documents</span>
                        <CommandShortcut>Ctrl+D</CommandShortcut>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Opened Folders" });
                        }}
                      >
                        <FolderIcon className="mr-2 size-3.5" />
                        <span>Folders</span>
                        <CommandShortcut>Ctrl+F</CommandShortcut>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Actions">
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "New File Created" });
                        }}
                      >
                        <PlusIcon className="mr-2 size-3.5" />
                        <span>New File</span>
                        <CommandShortcut>Ctrl+N</CommandShortcut>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "New Folder Created" });
                        }}
                      >
                        <FolderPlusIcon className="mr-2 size-3.5" />
                        <span>New Folder</span>
                        <CommandShortcut>Ctrl+Shift+N</CommandShortcut>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          navigator.clipboard.writeText(currentFile.content);
                          toast.add({ title: "Copied" });
                        }}
                      >
                        <CopyIcon className="mr-2 size-3.5" />
                        <span>Copy</span>
                        <CommandShortcut>Ctrl+C</CommandShortcut>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Cut to Clipboard" });
                        }}
                      >
                        <ScissorsIcon className="mr-2 size-3.5" />
                        <span>Cut</span>
                        <CommandShortcut>Ctrl+X</CommandShortcut>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Pasted" });
                        }}
                      >
                        <ClipboardPasteIcon className="mr-2 size-3.5" />
                        <span>Paste</span>
                        <CommandShortcut>Ctrl+V</CommandShortcut>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Deleted Item" });
                        }}
                      >
                        <TrashIcon className="mr-2 size-3.5" />
                        <span>Delete</span>
                        <CommandShortcut>Del</CommandShortcut>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="View">
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Grid View toggled" });
                        }}
                      >
                        <LayoutGridIcon className="mr-2 size-3.5" />
                        <span>Grid View</span>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "List View toggled" });
                        }}
                      >
                        <ListIcon className="mr-2 size-3.5" />
                        <span>List View</span>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Zoomed In" });
                        }}
                      >
                        <ZoomInIcon className="mr-2 size-3.5" />
                        <span>Zoom In</span>
                        <CommandShortcut>Ctrl++</CommandShortcut>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Zoomed Out" });
                        }}
                      >
                        <ZoomOutIcon className="mr-2 size-3.5" />
                        <span>Zoom Out</span>
                        <CommandShortcut>Ctrl+-</CommandShortcut>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Account">
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Profile Opened" });
                        }}
                      >
                        <UserIcon className="mr-2 size-3.5" />
                        <span>Profile</span>
                        <CommandShortcut>Ctrl+P</CommandShortcut>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Billing Details" });
                        }}
                      >
                        <CreditCardIcon className="mr-2 size-3.5" />
                        <span>Billing</span>
                        <CommandShortcut>Ctrl+B</CommandShortcut>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Settings Opened" });
                        }}
                      >
                        <SettingsIcon className="mr-2 size-3.5" />
                        <span>Settings</span>
                        <CommandShortcut>Ctrl+,</CommandShortcut>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Notifications Opened" });
                        }}
                      >
                        <BellIcon className="mr-2 size-3.5" />
                        <span>Notifications</span>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Help & Support" });
                        }}
                      >
                        <HelpCircleIcon className="mr-2 size-3.5" />
                        <span>Help & Support</span>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Tools">
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Calculator Launched" });
                        }}
                      >
                        <CalculatorIcon className="mr-2 size-3.5" />
                        <span>Calculator</span>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Calendar Opened" });
                        }}
                      >
                        <CalendarIcon className="mr-2 size-3.5" />
                        <span>Calendar</span>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Image Editor Opened" });
                        }}
                      >
                        <ImageIcon className="mr-2 size-3.5" />
                        <span>Image Editor</span>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsCommandOpen(false);
                          toast.add({ title: "Code Editor Mode" });
                        }}
                      >
                        <CodeIcon className="mr-2 size-3.5" />
                        <span>Code Editor</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </CommandPrimitive>
              </div>
            </>
          )}
        </div>

        {/* Right: Layout Switcher Group */}
        <div className="flex items-center gap-2 pr-3 shrink-0">
          <div className="flex items-center rounded-md border border-border/70 bg-background/60 p-0.5 shadow-xs">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "size-5.5 rounded-sm p-0 text-muted-foreground hover:text-foreground hover:bg-accent",
                      isChatPanelOpen && "bg-accent/90 text-foreground"
                    )}
                    onClick={handleToggleChatPanel}
                  />
                }
              >
                <LayoutLeftIcon active={isChatPanelOpen} />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Toggle Chat Panel ({isChatPanelOpen ? "Visible" : "Collapsed"})
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "size-5.5 rounded-sm p-0 text-muted-foreground hover:text-foreground hover:bg-accent",
                      isTerminalOpen && "bg-accent/90 text-foreground"
                    )}
                    onClick={handleToggleTerminal}
                  />
                }
              >
                <LayoutBottomIcon active={isTerminalOpen} />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Toggle Terminal Panel
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "size-5.5 rounded-sm p-0 text-muted-foreground hover:text-foreground hover:bg-accent",
                      isArtifactOpen && "bg-accent/90 text-foreground"
                    )}
                    onClick={handleToggleArtifact}
                  />
                }
              >
                <LayoutRightIcon active={isArtifactOpen} />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Toggle Editor Panel
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* 2. MIDDLE WORKSPACE: Activity Bar + Resizable Workspace */}
      <div className="flex flex-1 w-full overflow-hidden min-h-0">
        {/* Left Activity Bar */}
        <div className="flex w-11 shrink-0 flex-col justify-between items-center border-r border-border/60 bg-muted/25 py-2 z-10">
          <div className="flex flex-col items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant={
                      isExplorerOpen && activeActivityTab === "explorer"
                        ? "secondary"
                        : "ghost"
                    }
                    size="icon"
                    className={cn(
                      "size-7.5 rounded-md relative text-muted-foreground hover:text-foreground",
                      isExplorerOpen &&
                        activeActivityTab === "explorer" &&
                        "text-foreground bg-accent/80 font-medium"
                    )}
                    onClick={() => setActiveActivityTab("explorer")}
                  />
                }
              >
                <Files className="size-4" />
                {isExplorerOpen && activeActivityTab === "explorer" && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-primary" />
                )}
              </TooltipTrigger>
              <TooltipContent side="right">Explorer</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant={
                      isChatPanelOpen && activeActivityTab === "search"
                        ? "secondary"
                        : "ghost"
                    }
                    size="icon"
                    className="size-7.5 rounded-md text-muted-foreground hover:text-foreground"
                    onClick={() => setActiveActivityTab("search")}
                  />
                }
              >
                <Search className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="right">Search</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant={
                      isChatPanelOpen && activeActivityTab === "git"
                        ? "secondary"
                        : "ghost"
                    }
                    size="icon"
                    className="size-7.5 rounded-md text-muted-foreground hover:text-foreground"
                    onClick={() => setActiveActivityTab("git")}
                  />
                }
              >
                <GitBranch className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="right">Source Control</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant={
                      isChatPanelOpen && activeActivityTab === "extensions"
                        ? "secondary"
                        : "ghost"
                    }
                    size="icon"
                    className="size-7.5 rounded-md text-muted-foreground hover:text-foreground"
                    onClick={() => setActiveActivityTab("extensions")}
                  />
                }
              >
                <Blocks className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="right">Extensions</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex flex-col items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7.5 rounded-full p-0 relative hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer"
                  >
                    <Avatar className="size-7">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="Avatar"
                      />
                      <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-semibold">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                  </Button>
                }
              />
              <DropdownMenuContent side="right" align="end" className="w-56 text-xs">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal py-1.5">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-xs font-medium leading-none text-foreground">
                        James Doe
                      </p>
                      <p className="text-[11px] leading-none text-muted-foreground">
                        james@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() =>
                      toast.add({
                        title: "Profile",
                        description: "Viewing profile settings",
                      })
                    }
                  >
                    <UserIcon className="size-3.5 mr-2 text-muted-foreground" />
                    Profile
                    <DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      toast.add({
                        title: "Billing",
                        description: "Pro Plan active",
                      })
                    }
                  >
                    <CreditCardIcon className="size-3.5 mr-2 text-muted-foreground" />
                    Billing
                    <DropdownMenuShortcut>Ctrl+B</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      toast.add({
                        title: "Settings",
                        description: "IDE preferences opened",
                      })
                    }
                  >
                    <SettingsIcon className="size-3.5 mr-2 text-muted-foreground" />
                    Settings
                    <DropdownMenuShortcut>Ctrl+,</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() =>
                      toast.add({
                        title: "Theme toggled",
                        description: "Current theme: Dark",
                      })
                    }
                  >
                    <Sparkles className="size-3.5 mr-2 text-muted-foreground" />
                    Theme Switcher
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsCommandOpen(true)}>
                    <Command className="size-3.5 mr-2 text-muted-foreground" />
                    Command Palette
                    <DropdownMenuShortcut>Ctrl+Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() =>
                      toast.add({
                        title: "Logged out",
                        description: "Session ended",
                      })
                    }
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden min-w-0 bg-background">
          <WorkspaceLayout
            activeActivityTab={activeActivityTab}
            files={mockFiles}
            currentFile={currentFile}
            selectedPath={selectedPath}
            setSelectedPath={handleFileSelect}
            openTabs={openTabs}
            setOpenTabs={setOpenTabs}
            outerGroupRef={outerGroupRef}
            codeGroupRef={codeGroupRef}
            openState={openState}
            onOpenStateChange={handleOpenStateChange}
            explorerPanelRef={explorerPanelRef}
            chatPanelRef={chatPanelRef}
            codePanelRef={codePanelRef}
            terminalPanelRef={terminalPanelRef}
            onToggleExplorer={handleToggleExplorer}
            onToggleChat={handleToggleChatPanel}
            onToggleArtifact={handleToggleArtifact}
            onToggleTerminal={handleToggleTerminal}
          />
        </div>
      </div>

      {/* 3. BOTTOM STATUS BAR */}
      <footer className="flex h-5.5 w-full shrink-0 items-center justify-between border-t border-border/60 bg-muted/60 px-2 text-[11px] text-muted-foreground z-30">
        {/* Left Status: Branch, Errors, Warnings */}
        <div className="flex items-center gap-3">
          <div
            onClick={() =>
              toast.add({
                title: "Git Repository",
                description: "Branch: main (up to date)",
              })
            }
            className="flex items-center gap-1 text-foreground hover:text-primary cursor-pointer transition-colors"
          >
            <GitBranch className="size-3 text-primary" />
            <span className="font-mono text-[10px]">main*</span>
          </div>
          <div
            onClick={() =>
              toast.add({
                title: "No Problems Detected",
                description: "0 errors, 0 warnings",
              })
            }
            className="flex items-center gap-1 hover:text-foreground cursor-pointer"
          >
            <X className="size-2.8 text-destructive" />
            <span>0</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-amber-500">0</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <Sparkles className="size-3 text-primary animate-pulse" />
            <span>AI: {status === "streaming" ? "Streaming..." : "Ready"}</span>
          </div>
        </div>

        {/* Right Status: Encoding, Language, Port */}
        <div className="flex items-center gap-3">
          <span className="hidden md:inline hover:text-foreground cursor-pointer">
            UTF-8
          </span>
          <span className="hidden md:inline hover:text-foreground cursor-pointer">
            LF
          </span>
          <span className="font-mono text-[10px] text-foreground hover:text-primary cursor-pointer">
            TypeScript React
          </span>
          <div className="flex items-center gap-1 text-emerald-500 font-mono text-[10px]">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Port: 3000</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
