import React, { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangeSelectorProps {
  startDate?: string;
  endDate?: string;
  onChange: (startDate: string, endDate: string) => void;
}

const serializeDate = (value?: Date | null) => (value ? value.toISOString().split('T')[0] : '');

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ startDate, endDate, onChange }) => {
  const [range, setRange] = useState<[Date | null, Date | null]>([
    startDate ? new Date(startDate) : null,
    endDate ? new Date(endDate) : null,
  ]);

  useEffect(() => {
    setRange([startDate ? new Date(startDate) : null, endDate ? new Date(endDate) : null]);
  }, [startDate, endDate]);

  const handleChange = (selected: [Date | null, Date | null]) => {
    setRange(selected);
    onChange(serializeDate(selected[0]), serializeDate(selected[1]));
  };

  return (
    <DatePicker
      selected={range[0]}
      startDate={range[0]}
      endDate={range[1]}
      selectsRange
      onChange={(updated) => handleChange(updated as [Date | null, Date | null])}
      isClearable
      placeholderText="Select date range"
      dateFormat="yyyy-MM-dd"
      className="border rounded-2xl px-3 py-2 text-sm w-56"
    />
  );
};

export default DateRangeSelector;

