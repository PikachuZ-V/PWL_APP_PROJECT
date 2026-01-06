import SettingsLayout from '@/layouts/settings/layout';
import { Head } from '@inertiajs/react';

export default function TwoFactor() {
    return (
        <SettingsLayout>
            <Head title="Two Factor Authentication" />
            
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Two Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                        Add additional security to your account using two factor authentication.
                    </p>
                </div>

                <div className="p-4 bg-white shadow sm:rounded-lg border">
                    <p className="text-gray-500">
                        Fitur 2FA belum diaktifkan. (Halaman ini hanya placeholder agar tidak error).
                    </p>
                </div>
            </div>
        </SettingsLayout>
    );
}