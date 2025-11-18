import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  tips?: string[];
}

interface InteractiveDemoProps {
  title: string;
  steps: Step[];
  onComplete?: () => void;
}

const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ title, steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      setCompletedSteps(prev => [...prev, currentStep]);
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-blue-100">
            {currentStep + 1} / {steps.length} 단계
          </span>
          <div className="text-blue-100">
            {Math.round(((completedSteps.length) / steps.length) * 100)}% 완료
          </div>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="bg-gray-200 h-2">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* 스텝 네비게이션 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex space-x-2 overflow-x-auto">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                index === currentStep
                  ? 'bg-blue-500 text-white shadow-lg'
                  : completedSteps.includes(index)
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center space-x-2">
                {completedSteps.includes(index) && (
                  <span className="text-green-600">✓</span>
                )}
                <span>{index + 1}. {step.title}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 현재 스텝 컨텐츠 */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {steps[currentStep].title}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {steps[currentStep].description}
              </p>
            </div>

            {/* 인터랙티브 컴포넌트 */}
            <div className="mb-6 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              {steps[currentStep].component}
            </div>

            {/* 팁 섹션 */}
            {steps[currentStep].tips && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  도움말
                </h5>
                <ul className="space-y-1">
                  {steps[currentStep].tips!.map((tip, index) => (
                    <li key={index} className="text-blue-800 text-sm flex items-start">
                      <span className="mr-2 text-blue-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← 이전
          </button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-blue-500'
                    : completedSteps.includes(index)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            {currentStep === steps.length - 1 ? '완료' : '다음 →'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveDemo;