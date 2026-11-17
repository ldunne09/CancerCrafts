'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AccountMenu from './AccountMenu';

const navItems = [
  { label: 'CARE', href: '/care' },
  { label: 'EARN', href: '/earn' },
  { label: 'HELP', href: '/help' },
  { label: 'PROFILE', href: '/profile' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label="CancerCrafts home">
          <div className="brand-mark">C</div>
          <span>CancerCrafts</span>
        </Link>

        <nav className="nav" aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive =
              item.href === '/care'
                ? pathname === '/care' || pathname.startsWith('/care/')
                : item.href === '/earn'
                  ? pathname === '/earn' || pathname.startsWith('/earn/')
                  : item.href === '/help'
                    ? pathname === '/help' || pathname.startsWith('/help/')
                    : pathname === '/profile' || pathname.startsWith('/profile/');

            return (
              <Link key={item.href} href={item.href} className={isActive ? 'active' : ''}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <AccountMenu />
      </div>
    </header>
  );
}
