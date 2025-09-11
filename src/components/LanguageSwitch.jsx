// src/components/LanguageSwitch.jsx
import { Switch } from 'antd';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitch() {
    const { i18n } = useTranslation();

    const onToggle = (checked) => i18n.changeLanguage(checked ? 'en' : 'de');

    return (
        <Switch
            checked={i18n.language === 'en'}
            onChange={onToggle}
            checkedChildren="EN"
            unCheckedChildren="DE"
        />
    );
}
