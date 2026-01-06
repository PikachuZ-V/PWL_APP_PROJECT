import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

// Komponen Heading Sederhana (Pengganti import eksternal)
const Heading = ({ title, description }: { title: string; description: string }) => (
    <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-gray-500">{description}</p>
    </div>
);

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { url } = usePage(); // Mengambil URL aktif

    // Daftar Menu Sidebar (Gunakan route() standar Laravel)
    const sidebarNavItems = [
        {
            title: 'Profile',
            href: route('profile.edit'), // Pastikan route ini ada di web.php
        },
        {
            title: 'Password',
            href: '#', // Placeholder jika belum ada route
        },
        {
            title: 'Appearance',
            href: '#',
        },
        {
            title: 'Two-Factor Auth',
            href: '#',
        },
    ];

    return (
        <div className="px-4 py-6 md:px-10 max-w-7xl mx-auto">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <hr className="my-6 border-gray-200" />

            <div className="flex flex-col lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 pl-4 lg:pl-0 overflow-x-auto">
                        {sidebarNavItems.map((item) => {
                            // Cek apakah menu ini sedang aktif
                            const isActive = url.startsWith(new URL(item.href, 'http://localhost').pathname);
                            
                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className={`
                                        justify-start text-left px-3 py-2 rounded-md text-sm font-medium transition-colors block
                                        ${isActive 
                                            ? 'bg-gray-100 text-gray-900 font-bold' 
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                                    `}
                                >
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className="flex-1 lg:max-w-2xl">
                    <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}