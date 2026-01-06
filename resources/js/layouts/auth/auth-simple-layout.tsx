import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <Link href="/" className="flex flex-col items-center gap-2 font-medium">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                {/* Icon App */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" /></svg>
                            </div>
                            <span className="sr-only">App Name</span>
                        </Link>
                        <h1 className="text-xl font-bold">{title}</h1>
                        <p className="text-center text-sm text-muted-foreground">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}