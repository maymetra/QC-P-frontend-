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
        </div>
    );
}
