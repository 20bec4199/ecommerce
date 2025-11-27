import React from 'react';

const AddressForm = ({
  addressForm,
  editingAddress,
  isProcessing,
  onFormChange,
  onSave,
  onCancel
}) => {
  const handleFieldChange = (field, value) => {
    onFormChange(field, value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          value={addressForm.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={addressForm.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone *
          </label>
          <input
            type="tel"
            value={addressForm.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Address Line 1 *
        </label>
        <input
          type="text"
          value={addressForm.address.line1}
          onChange={(e) => handleFieldChange('address.line1', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Address Line 2
        </label>
        <input
          type="text"
          value={addressForm.address.line2}
          onChange={(e) => handleFieldChange('address.line2', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City *
          </label>
          <input
            type="text"
            value={addressForm.address.city}
            onChange={(e) => handleFieldChange('address.city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            State *
          </label>
          <input
            type="text"
            value={addressForm.address.state}
            onChange={(e) => handleFieldChange('address.state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ZIP Code *
          </label>
          <input
            type="text"
            value={addressForm.address.zipCode}
            onChange={(e) => handleFieldChange('address.zipCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Country *
          </label>
          <input
            type="text"
            value={addressForm.address.country}
            onChange={(e) => handleFieldChange('address.country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={addressForm.isDefault}
          onChange={(e) => handleFieldChange('isDefault', e.target.checked)}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
        />
        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          Set as default address
        </label>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={onSave}
          disabled={isProcessing}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isProcessing ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddressForm;