import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, Crown, LogIn, UserPlus, LogOut, BookOpen, FileText, Shield, Home, ChevronDown, Settings, User, Search, CreditCard, Sparkles, MessageSquare, Download, Video, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/NotificationBell";
import SearchDialog from "@/components/SearchDialog";
import PremiumBadge from "@/components/PremiumBadge";

const navigation: Array<
  { name: string; href: string; separator?: never } | { separator: true; name?: never; href?: never }
> = [
  { name: "Home", href: "/" },
  { name: "The Vision", href: "/vision" },
  { name: "Covenant Walk", href: "/new-covenant-intro" },
  { separator: true },
  { name: "Lawful Money", href: "/lawful-money" },
  { name: "Trust & Assets", href: "/trust-assets" },
  { name: "BAS Token", href: "/bas" },
  { name: "State Passport", href: "/state-passport" },
  { separator: true },
  { name: "The Mandate", href: "/mandate" },
  { name: "Courses", href: "/courses" },
  { name: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [location, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isPremium, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const initials = user
    ? `${(user.firstName || "")[0] || ""}${(user.lastName || "")[0] || ""}`.toUpperCase()
    : "";

  return (
    <nav className="bg-white dark:bg-royal-navy shadow-lg fixed w-full top-0 z-50 border-b-2 border-royal-gold/30">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center group shrink-0">
            <div className="relative">
              <Crown className="text-royal-gold w-8 h-8 mr-3 transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 text-royal-gold opacity-50 blur-sm">
                <Crown className="w-8 h-8 mr-3" />
              </div>
            </div>
            <span className="font-cinzel-decorative font-bold text-base sm:text-xl text-royal-navy dark:text-royal-gold whitespace-nowrap">
              Ecclesia Basilikos
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-2 lg:space-x-4">
            {navigation.map((item, i) =>
              item.separator ? (
                <span key={`sep-${i}`} className="w-px h-4 bg-royal-gold/40" />
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={location === item.href ? "page" : undefined}
                  className={`transition-colors font-medium font-cinzel text-xs whitespace-nowrap ${
                    location === item.href
                      ? "text-royal-gold"
                      : "text-royal-navy dark:text-gray-300 hover:text-royal-gold"
                  }`}
                >
                  {item.name}
                </Link>
              )
            )}

            {/* Search & Notifications (desktop) */}
            <SearchDialog />
            {isAuthenticated && <NotificationBell />}

            {/* Auth buttons (desktop) */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 ml-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-royal-navy text-white text-xs font-cinzel">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {isPremium && <PremiumBadge />}
                    <span className="font-cinzel text-xs text-royal-navy dark:text-gray-300 hidden 2xl:inline">
                      {user?.firstName}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <Home className="w-4 h-4 mr-2" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/courses")}>
                    <BookOpen className="w-4 h-4 mr-2" /> Courses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/downloads")}>
                    <Download className="w-4 h-4 mr-2" /> Downloads
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/videos")}>
                    <Video className="w-4 h-4 mr-2" /> Videos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/resources")}>
                    <FileText className="w-4 h-4 mr-2" /> Resources
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/proof-vault")}>
                    <Shield className="w-4 h-4 mr-2" /> Proof Vault
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/billing")}>
                    <CreditCard className="w-4 h-4 mr-2" /> Membership
                  </DropdownMenuItem>
                  {!isPremium && (
                    <DropdownMenuItem onClick={() => navigate("/pricing")} className="text-royal-gold focus:text-royal-gold">
                      <Sparkles className="w-4 h-4 mr-2" /> Covenantal Membership
                    </DropdownMenuItem>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Settings className="w-4 h-4 mr-2" /> Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-cinzel text-xs">
                    <LogIn className="w-4 h-4 mr-1" /> Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel text-xs font-bold">
                    <UserPlus className="w-4 h-4 mr-1" /> Join
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col h-full">
                  {/* User info at top (if logged in) */}
                  {isAuthenticated && user && (
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-royal-navy text-white text-sm font-cinzel">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-cinzel font-bold text-royal-navy text-sm flex items-center gap-2">
                          {user.firstName} {user.lastName}
                          {isPremium && <PremiumBadge />}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Nav links */}
                  <div className="flex flex-col space-y-4 mt-2 flex-1">
                    {navigation.map((item, i) =>
                      item.separator ? (
                        <div key={`sep-${i}`} className="border-t border-royal-gold/30" />
                      ) : (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          aria-current={location === item.href ? "page" : undefined}
                          className={`text-left py-2 transition-colors font-cinzel ${
                            location === item.href
                              ? "text-royal-gold"
                              : "text-royal-navy dark:text-gray-300 hover:text-royal-gold"
                          }`}
                        >
                          {item.name}
                        </Link>
                      )
                    )}

                    {isAuthenticated && (
                      <>
                        <div className="border-t pt-4 mt-2">
                          <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 text-royal-navy font-cinzel hover:text-royal-gold">
                            <Home className="w-4 h-4" /> Dashboard
                          </Link>
                          <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 text-royal-navy font-cinzel hover:text-royal-gold">
                            <User className="w-4 h-4" /> Profile
                          </Link>
                          <Link href="/courses" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 text-royal-navy font-cinzel hover:text-royal-gold">
                            <BookOpen className="w-4 h-4" /> Courses
                          </Link>
                          <Link href="/forum" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 text-royal-navy font-cinzel hover:text-royal-gold">
                            <MessageSquare className="w-4 h-4" /> Forum
                          </Link>
                          <Link href="/downloads" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 text-royal-navy font-cinzel hover:text-royal-gold">
                            <Download className="w-4 h-4" /> Downloads
                          </Link>
                          <Link href="/videos" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 text-royal-navy font-cinzel hover:text-royal-gold">
                            <Video className="w-4 h-4" /> Videos
                          </Link>
                          <Link href="/resources" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 text-royal-navy font-cinzel hover:text-royal-gold">
                            <FileText className="w-4 h-4" /> Resources
                          </Link>
                          <Link href="/nation" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 text-royal-navy font-cinzel hover:text-royal-gold">
                            <Crown className="w-4 h-4" /> Ecclesia Nation
                          </Link>
                          <Link href="/proof-vault" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 text-royal-navy font-cinzel hover:text-royal-gold">
                            <Shield className="w-4 h-4" /> Proof Vault
                          </Link>
                          <Link href="/billing" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 text-royal-navy font-cinzel hover:text-royal-gold">
                            <CreditCard className="w-4 h-4" /> Membership
                          </Link>
                          {user?.role === 'admin' && (
                            <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 text-royal-navy font-cinzel hover:text-royal-gold">
                              <Settings className="w-4 h-4" /> Admin Panel
                            </Link>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Auth buttons at bottom */}
                  <div className="border-t pt-4 mt-auto">
                    {isAuthenticated ? (
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => { handleLogout(); setIsOpen(false); }}
                      >
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full font-cinzel">
                            <LogIn className="w-4 h-4 mr-2" /> Sign In
                          </Button>
                        </Link>
                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                          <Button className="w-full bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold">
                            <UserPlus className="w-4 h-4 mr-2" /> Join
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
