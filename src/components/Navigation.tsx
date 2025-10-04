import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Sword, Trophy, User, LogOut, Menu, X, Crown, Shield, FileAudio } from 'lucide-react';
import { apiService } from '@/lib/api';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('authToken');
  const isGuest = localStorage.getItem('authToken') === 'guest';

  useEffect(() => {
    const checkAdmin = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          const result = await apiService.checkUserAdminStatus(user.id);
          setIsAdmin(result.is_admin);
        } catch (error) {
          setIsAdmin(false);
        }
      }
    };

    if (isLoggedIn) {
      checkAdmin();
    }
  }, [isLoggedIn]);

  const navItems = [
    { path: '/dashboard', label: 'Battles', icon: Sword, allowGuest: true },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy, allowGuest: true },
    { path: '/tournament', label: 'Tournament', icon: Crown, allowGuest: true },
    { path: '/submit', label: 'Submit', icon: Mic, allowGuest: false },
    { path: '/my-submissions', label: 'My Submissions', icon: FileAudio, allowGuest: false },
    { path: '/profile', label: 'Profile', icon: User, allowGuest: false },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: Shield, allowGuest: false }] : []),
  ].filter(item => !isGuest || item.allowGuest);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Mic className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold neon-text uppercase tracking-wider">The Battle App</span>
          </Link>

          {/* Desktop Navigation */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'text-primary bg-primary/10 border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {isGuest ? (
                <Link to="/login">
                  <Button variant="battle" size="sm">
                    Login
                  </Button>
                </Link>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              )}
            </div>
          )}

          {!isLoggedIn && (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="battle">Join Battle</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <Card className="md:hidden mt-2 p-4 animate-slide-up">
            {isLoggedIn ? (
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                        isActive
                          ? 'text-primary bg-primary/10 border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                {isGuest ? (
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="battle" size="sm" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                ) : (
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full">Login</Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="battle" className="w-full">Join Battle</Button>
                </Link>
              </div>
            )}
          </Card>
        )}
      </div>
    </nav>
  );
};