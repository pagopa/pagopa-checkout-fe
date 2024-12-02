import React, { useState } from 'react';
import { useTranslation } from "react-i18next";

const SkipToContent = () => {
    const { t } = useTranslation();
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const linkStyle: any = {
        position: 'absolute',
        top: 0,
        left: 0,
        background: '#000',
        color: '#fff',
        padding: '8px',
        zIndex: 10000,
        transform: isFocused ? 'translateY(0)' : 'translateY(-110%)',
        transition: 'transform 0.3s',
    };

    return (
        <a
            href="#main_content"
            style={linkStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            {t("mainPage.main.skipToContent")}
        </a>
    );
};

export default SkipToContent;