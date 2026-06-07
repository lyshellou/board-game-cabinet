import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gallery?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bg/95 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-page mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="font-heading text-xl tracking-wide text-white hover:text-accent transition-colors"
        >
          <span className="text-accent">&#9830;</span> Board Game Cabinet
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm tracking-wider uppercase transition-colors ${
              isActive('/') ? 'text-accent' : 'text-muted hover:text-white'
            }`}
          >
            首页
          </Link>
          <Link
            to="/gallery"
            className={`text-sm tracking-wider uppercase transition-colors ${
              isActive('/gallery') ? 'text-accent' : 'text-muted hover:text-white'
            }`}
          >
            全部桌游
          </Link>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-muted hover:text-white transition-colors"
            aria-label="搜索"
          >
            <Search size={18} />
          </button>
        </nav>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-muted hover:text-white transition-colors"
            aria-label="搜索"
          >
            <Search size={18} />
          </button>
          <Link to="/" className="text-xs text-muted hover:text-white uppercase tracking-wider">首页</Link>
          <Link to="/gallery" className="text-xs text-muted hover:text-white uppercase tracking-wider">桌游</Link>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-border bg-surface">
          <form onSubmit={handleSearch} className="max-w-page mx-auto px-6 py-3 flex items-center gap-3">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索桌游名称..."
              className="flex-1 bg-transparent text-white placeholder-muted text-sm outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="text-muted hover:text-white text-sm"
            >
              取消
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
