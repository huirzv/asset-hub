import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, LogOut, Menu, Search, Upload, User } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { SearchCommand } from "./SearchCommand";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV_LINKS: { label: string; to: string; search?: Record<string, string> }[] =
  [
    { label: "Explore", to: "/explore" },
    { label: "3D Models", to: "/explore", search: { category: "3d-models" } },
    { label: "2D & UI", to: "/explore", search: { category: "ui-kits" } },
    { label: "Textures", to: "/explore", search: { category: "textures" } },
    { label: "Collections", to: "/collections" },
  ];

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { userId } = useAuth();
  const { data: profile } = useProfile(userId);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 sm:px-6">
          <Logo />

          <nav
            aria-label="Primary"
            className="ml-4 hidden items-center gap-1 lg:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                search={link.search ?? {}}
                className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                activeOptions={{ exact: false, includeSearch: true }}
                activeProps={{ className: "text-foreground bg-surface" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground sm:flex"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="ml-6 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setSearchOpen(true)}
              aria-label="Search assets"
            >
              <Search className="h-4 w-4" />
            </Button>

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
            >
              <Link to="/favorites" aria-label="Favorites">
                <Heart className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/upload">
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Upload
              </Link>
            </Button>

            {userId ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account menu">
                    <span className="grid h-6 w-6 place-items-center rounded-full border border-border-strong bg-surface text-[11px] font-medium uppercase">
                      {(profile?.display_name ?? "?").slice(0, 1)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {profile ? (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/creators/$username"
                        params={{ username: profile.username }}
                      >
                        <User className="mr-2 h-4 w-4" /> My profile
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem asChild>
                    <Link to="/favorites">
                      <Heart className="mr-2 h-4 w-4" /> Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/upload">
                      <Upload className="mr-2 h-4 w-4" /> Upload an asset
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={signOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <nav aria-label="Mobile" className="flex flex-col p-4 pt-12">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      search={link.search ?? {}}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="my-3 h-px bg-border" />
                  <Link
                    to="/favorites"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
                  >
                    Favorites
                  </Link>
                  <Link
                    to="/upload"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
                  >
                    Upload an asset
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

export function HeaderSpacer({ className }: { className?: string | undefined }) {
  return <div className={cn("h-14", className)} aria-hidden="true" />;
}
