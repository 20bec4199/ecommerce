import React from 'react';

const StepNavigation = ({ 
  currentStep, 
  onPrevious, 
  onNext, 
  onPlaceOrder,
  isProcessing,
  canProceed,
  isLastStep = false
}) => {
  return (
    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={onPrevious}
        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
      >
        {currentStep === 'address' ? 'Back to Cart' : 'Previous'}
      </button>
      
      <button
        onClick={isLastStep ? onPlaceOrder : onNext}
        disabled={!canProceed || isProcessing}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing 
          ? 'Processing...' 
          : isLastStep 
            ? 'Place Order' 
            : 'Continue'
        }
      </button>
    </div>
  );
};

export default StepNavigation;