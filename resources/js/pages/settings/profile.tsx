import SettingsLayout from '@/layouts/settings/layout';
import { Head, usePage } from '@inertiajs/react';

export default function Profile() {
    const { auth } = usePage().props as any;

    return (
        <SettingsLayout>
            <Head title="Profile" />
            
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Profile Information</h3>
                    <p className="text-sm text-muted-foreground">
                        Update your account's profile information and email address.
                    </p>
                </div>
                
                <div className="p-4 bg-white shadow sm:rounded-lg border">
                    <p><strong>Name:</strong> {auth.user.name}</p>
                    <p><strong>Email:</strong> {auth.user.email}</p>
                    <p className="text-xs text-gray-500 mt-2">(Form Edit Profile belum tersedia)</p>
                </div>
            </div>
        </SettingsLayout>
    );
}