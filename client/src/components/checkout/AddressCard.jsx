import React from 'react';

const AddressCard = ({ 
  address, 
  isSelected, 
  onSelect, 
  onEdit,
  showEditButton = true,
  type = 'shipping'
}) => {
  const addressLine1 = address.address?.line1 || address.line1;
  const addressLine2 = address.address?.line2 || address.line2;
  const city = address.address?.city || address.city;
  const state = address.address?.state || address.state;
  const zipCode = address.address?.zipCode || address.zipCode || address.postalCode;
  const country = address.address?.country || address.country;

  return (
    <div
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 dark:border-purple-400'
          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {address.name || 'No Name'}
            {address.isDefault && type === 'shipping' && (
              <span className="ml-2 text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-2 py-1 rounded">
                Default
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {address.phone || 'No Phone'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {addressLine1}
            {addressLine2 && `, ${addressLine2}`}<br />
            {city}, {state} - {zipCode}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {country}
          </p>
        </div>
        {showEditButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(address);
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm ml-2"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default AddressCard;