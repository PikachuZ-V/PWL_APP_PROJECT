import SettingsLayout from '@/layouts/settings/layout';
import { Head } from '@inertiajs/react';

export default function Password() {
    return (
        <SettingsLayout>
            <Head title="Password" />
            
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Update Password</h3>
                    <p className="text-sm text-muted-foreground">
                        Ensure your account is using a long, random password to stay secure.
                    </p>
                </div>

                <div className="p-4 bg-white shadow sm:rounded-lg border">
                    <p className="text-gray-500">Form Update Password akan dimuat di sini.</p>
                </div>
            </div>
        </SettingsLayout>
    );
}