import { ModeToggle } from "./theme-switcher";

export default function NavBar() {
  return (
    <nav className="w-full h-16 flex items-center px-8">
      <h1 className="text-lg text-center w-full  font-semibold">nano</h1>
      <ModeToggle />
    </nav>
  );
}