import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button } from './index';
import { HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import './Onboarding.css';

interface OnboardingProps {
    onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const steps = [
        {
            title: t('onboarding.step1Title'),
            description: t('onboarding.step1Desc'),
            icon: <HelpCircle size={48} className="onboarding-icon-main" />
        },
        {
            title: t('onboarding.step2Title'),
            description: t('onboarding.step2Desc'),
            icon: <ChevronRight size={48} className="onboarding-icon-main" />
        },
        {
            title: t('onboarding.step3Title'),
            description: t('onboarding.step3Desc'),
            icon: <CheckCircle2 size={48} className="onboarding-icon-main" />
        }
    ];

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
            setIsOpen(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        setIsOpen(false);
        onComplete();
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleComplete}
            title={t('onboarding.step1Title')}
            footer={
                <div className="onboarding-footer">
                    <Button variant="ghost" onClick={handleComplete}>{t('onboarding.skip')}</Button>
                    <div className="onboarding-navigation">
                        {currentStep > 0 && (
                            <Button variant="outline" onClick={handleBack}>{t('onboarding.previous')}</Button>
                        )}
                        <Button onClick={handleNext}>
                            {currentStep === steps.length - 1 ? t('onboarding.startUsing') : t('onboarding.next')}
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="onboarding-content">
                <div className="onboarding-icon-wrapper">
                    {steps[currentStep].icon}
                </div>
                <h2 className="onboarding-title">{steps[currentStep].title}</h2>
                <p className="onboarding-description">{steps[currentStep].description}</p>
                <div className="onboarding-steps-indicator">
                    {steps.map((_, idx) => (
                        <div
                            key={idx}
                            className={`step-dot ${idx === currentStep ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default Onboarding;
