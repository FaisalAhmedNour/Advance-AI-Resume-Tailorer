import React from 'react';

interface StepperProps {
    currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
    const steps = [
        "Parsing Resume & JD",
        "Analyzing Job Requirements",
        "Optimizing Experience Bullets",
        "Calculating ATS Metric Core",
        "Generating PDF Report"
    ];

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 -z-10"></div>
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-accent transition-all duration-500 ease-out -z-10"
                    style={{ width: `${(Math.min(currentStep, steps.length - 1) / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isActive = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <div key={index} className="flex flex-col items-center group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-colors duration-300 ${isActive ? 'bg-accent text-white' : 'bg-slate-200 text-slate-500'
                                }`}>
                                {isCurrent ? (
                                    <span className="animate-pulse">●</span>
                                ) : isActive ? '✓' : index + 1}
                            </div>
                            <span className={`absolute mt-10 text-xs text-center w-24 leading-tight font-medium transition-colors ${isActive ? 'text-prime' : 'text-slate-400'
                                }`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
