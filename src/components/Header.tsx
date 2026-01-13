import { Search, MapPin, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg md:text-xl">B</span>
            </div>
            <span className="text-foreground font-bold text-xl md:text-2xl hidden sm:block">
              Book<span className="text-primary">My</span>Show
            </span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for Movies, Events, Plays, Sports..."
                className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Location & Sign In - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <button className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Mumbai</span>
            </button>
            <Button variant="default" size="sm">
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search movies, events..."
                className="pl-10 bg-card border-border text-foreground"
              />
            </div>
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-1 text-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Mumbai</span>
              </button>
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="hidden md:block bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-8 h-12">
            {["Movies", "Stream", "Events", "Plays", "Sports", "Activities"].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
