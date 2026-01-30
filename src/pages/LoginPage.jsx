// src/pages/LoginPage.jsx
import LanguageSwitch from '../components/LanguageSwitch';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
            <div className="absolute top-6 right-6">
                <LanguageSwitch />
            </div>
            <LoginForm />
            <div className="absolute bottom-4 text-gray-500 text-sm">
                QC-P 0.9.3
            </div>
        </div>
    );
}
