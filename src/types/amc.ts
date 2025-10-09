// src/types/amc.ts

export type AmcStatus = 'Active' | 'Expired' | 'Extension';
export type AmcMonth =
  | 'JAN' | 'FEB' | 'MAR' | 'APR'
  | 'MAY' | 'JUN' | 'JUL' | 'AUG'
  | 'SEP' | 'OCT' | 'NOV' | 'DEC';

// Type for Dealer/Customer dropdown data
export type EntityOption = { id: string; name: string };

// Core data structure for the table
export interface AmcInfo {
  id: string;
  dealerName: string; 
  customerName: string; 
  description: string;
  status: AmcStatus;
  amcFrom: string; // ISO Date (e.g., '2024-01-01')
  amcTo: string; // ISO Date
  amcMonth: AmcMonth;
}

// Data structure for the form submission (uses IDs or 'new')
export interface AmcFormValues {
  dealer: string; // Entity ID or 'new'
  customer: string; // Entity ID or 'new'
  newDealerName?: string; // Conditional new name
  newCustomerName?: string; // Conditional new name
  description: string;
  status: AmcStatus;
  amcFrom: string;
  amcTo: string;
  amcMonth: AmcMonth;
}

// Mock Data for Dropdowns (NOTE: 'new' must be the last item)
export const MOCK_AMC_MONTHS: AmcMonth[] = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

export const MOCK_DEALERS: EntityOption[] = [
  { id: 'd1', name: 'Alpha Auto' },
  { id: 'd2', name: 'Beta Motors' },
  { id: 'new', name: '[+ New Entry]' }, // Identifier for new creation
];

export const MOCK_CUSTOMERS: EntityOption[] = [
  { id: 'c1', name: 'John Doe' },
  { id: 'c2', name: 'Jane Smith' },
  { id: 'new', name: '[+ New Entry]' }, // Identifier for new creation
];

// Initial mock data for the table
export const MOCK_DATA: AmcInfo[] = [
  {
    id: 'a1',
    dealerName: 'Alpha Auto',
    customerName: 'John Doe',
    description: 'Standard 1-year maintenance contract.',
    status: 'Active',
    amcFrom: '2024-06-01',
    amcTo: '2025-05-31',
    amcMonth: 'JUN',
  },
  {
    id: 'a2',
    dealerName: 'Beta Motors',
    customerName: 'Jane Smith',
    description: 'Extension granted due to low usage.',
    status: 'Extension',
    amcFrom: '2023-01-01',
    amcTo: '2024-12-31',
    amcMonth: 'JAN',
  },
];