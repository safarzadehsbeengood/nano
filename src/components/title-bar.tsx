import { ModeToggle } from "./theme-switcher";

export default function TitleBar() {
  return (
    <div
      data-tauri-drag-region
      className="fixed top-0 left-0 right-0 h-8 bg-background border-b border-border flex items-center justify-end select-none px-2 z-50"
    >
      <ModeToggle />
    </div>
  );
}