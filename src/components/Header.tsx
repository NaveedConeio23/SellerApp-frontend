'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Upload, CheckCircle, LogOut } from 'lucide-react';

// Define the navigation items
const navItems = [
  { name: 'Status', href: '/status', icon: CheckCircle },
  { name: 'Upload Docs', href: '/upload', icon: Upload },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Clear localStorage tokens or user data
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    // Redirect to login page
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#5fb8b6] to-[#256d70] text-white shadow-lg transition-all duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src="/icons/coneio.png"
            alt="Coneio Logo"
            width={40}
            height={40}
            priority
            className="rounded-md"
          />
          <span className="text-md font-semibold tracking-wide hidden sm:block">
            Seller Portal
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-2 sm:space-x-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center text-sm font-medium px-3 py-2 rounded-full transition-all duration-200
                  ${isActive
                    ? 'bg-amber-500 text-slate-900 shadow-lg hover:bg-amber-400'
                    : 'text-slate-100 hover:bg-slate-700 hover:text-amber-300'}
                `}
              >
                <item.icon className="h-4 w-4 mr-2 hidden sm:inline-block" />
                {item.name}
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center text-sm font-medium px-3 py-2 rounded-full
                       bg-amber-500 text-slate-900 hover:bg-amber-400 hover:shadow-xl
                       transition-all duration-200 shadow-lg"
          >
            <LogOut className="h-4 w-4 mr-2 hidden sm:inline-block" />
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
