import React from 'react';

interface CustomerSelectProps {
  customers: string[];
  selectedCustomer: string | null;
  onSelectCustomer: (customer: string | null) => void;
}

const CustomerSelect: React.FC<CustomerSelectProps> = ({ customers, selectedCustomer, onSelectCustomer }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onSelectCustomer(value === 'all' ? null : value);
  };

  return (
    <div className="w-full">
      <label htmlFor="customer-select" className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
      <select
        id="customer-select"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
        value={selectedCustomer || 'all'}
        onChange={handleChange}
      >
        <option value="all">All Customers</option>
        {customers.map((customer) => (
          <option key={customer} value={customer}>
            {customer}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CustomerSelect;
