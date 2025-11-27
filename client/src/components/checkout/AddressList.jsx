import React from 'react';
import AddressCard from './AddressCard';

const AddressList = ({
  addresses,
  selectedAddress,
  onAddressSelect,
  onEditAddress,
  type = 'shipping',
  emptyMessage = "No addresses found. Please add an address to continue."
}) => {
  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-300">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((address) => (
        <AddressCard
          key={address._id}
          address={address}
          isSelected={selectedAddress?._id === address._id}
          onSelect={() => onAddressSelect(address)}
          onEdit={onEditAddress}
          type={type}
        />
      ))}
    </div>
  );
};

export default AddressList;