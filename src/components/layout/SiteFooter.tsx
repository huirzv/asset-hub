import { Link } from "@tanstack/react-router";

import { LogoMark } from "@/components/brand/Logo";
import { BRAND } from "@/lib/brand";
import { CATEGORIES } from "@/lib/taxonomy";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2">
            <LogoMark className="h-5 w-5" />
            <span className="text-sm font-semibold">{BRAND.name}</span>
          </div>
          <p className="mt-2.5 text-sm text-muted-foreground">
            A free, community-driven library of game development assets. Every
            asset carries a clear, explicit license.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <nav aria-label="Categories">
            <h3 className="text-eyebrow">Browse</h3>
            <ul className="mt-3 space-y-2">
              {CATEGORIES.slice(0, 4).map((category) => (
                <li key={category.id}>
                  <Link
                    to="/explore"
                    search={{ category: category.id }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Library">
            <h3 className="text-eyebrow">Library</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  to="/explore"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Explore assets
                </Link>
              </li>
              <li>
                <Link
                  to="/collections"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  to="/upload"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Upload an asset
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <h3 className="text-eyebrow">Licensing</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>CC0 — no attribution needed</li>
              <li>CC BY 4.0 — credit the creator</li>
              <li>No paid assets, ever</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. Free assets for your next
            game.
          </p>
          <p>
            Uploads are held in review until validation and scanning complete.
          </p>
        </div>
      </div>
    </footer>
  );
}
