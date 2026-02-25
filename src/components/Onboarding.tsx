import React, { useState, useEffect } from 'react';
import { Modal, Button } from './index';
import { HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import './Onboarding.css';

interface OnboardingProps {
    onComplete: () => void;
}

const steps = [
    {
        title: 'أهلاً بك في بيت ورد',
        description: 'هذا النظام مصمم لمساعدتك على إدارة مبيعاتك بسرعة وسهولة. سنأخذك في جولة سريعة.',
        icon: <HelpCircle size={48} className="onboarding-icon-main" />
    },
    {
        title: 'البحث عن المنتجات',
        description: 'يمكنك البحث عن المنتجات بالاسم أو مسح الباركود مباشرة لإضافتها للسلة. استخدم مفتاح F3 للوصول السريع للبحث.',
        icon: <ChevronRight size={48} className="onboarding-icon-main" />
    },
    {
        title: 'إدارة السلة والدفع',
        description: 'بعد إضافة المنتجات، يمكنك تعديل الكميات أو حذفها. اضغط على زر "دفع" لإتمام العملية وطباعة الإيصال.',
        icon: <CheckCircle2 size={48} className="onboarding-icon-main" />
    }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

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
            title="جولة إرشادية"
            footer={
                <div className="onboarding-footer">
                    <Button variant="ghost" onClick={handleComplete}>تخطي</Button>
                    <div className="onboarding-navigation">
                        {currentStep > 0 && (
                            <Button variant="outline" onClick={handleBack}>السابق</Button>
                        )}
                        <Button onClick={handleNext}>
                            {currentStep === steps.length - 1 ? 'ابدأ الاستخدام' : 'التالي'}
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
