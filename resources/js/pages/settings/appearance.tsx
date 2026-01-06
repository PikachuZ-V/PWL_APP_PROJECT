import SettingsLayout from '@/layouts/settings/layout';
import { Head } from '@inertiajs/react';

export default function Appearance() {
    return (
        <SettingsLayout>
            <Head title="Appearance" />
            
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Appearance</h3>
                    <p className="text-sm text-muted-foreground">
                        Customize the look and feel of the application.
                    </p>
                </div>

                <div className="p-4 bg-white shadow sm:rounded-lg border">
                    <p className="text-gray-500">Pengaturan tema (Dark/Light Mode) akan ada di sini.</p>
                </div>
            </div>
        </SettingsLayout>
    );
}