import React from 'react';
import { useTranslation } from "react-i18next";


interface DisclaimerFieldProps {
    terminiLink: string;
    privacyLink: string;
    pspNome?: String;
}

const DisclaimerField = (props: DisclaimerFieldProps) => {
    const { t } = useTranslation();
    const {
        terminiLink,
        privacyLink,
        pspNome
    } = props;

    const message = t('paymentCheckPage.disclaimer.psp', {
        terminiLink: terminiLink,
        privacyLink: privacyLink,
        pspNome: pspNome,
    });
    return <p dangerouslySetInnerHTML={{ __html: message }} />;
};

export default DisclaimerField;
