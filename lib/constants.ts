export const GHANA_CATEGORIES = [
  { name: 'Food', color: '#FF6B6B', examples: ['Waakye', 'Banku', 'Cafeteria', 'Jollof'] },
  { name: 'Transport', color: '#4ECDC4', examples: ['Trotro', 'Uber', 'Taxi', 'Kejetia bus'] },
  { name: 'Airtime/Data', color: '#4988C4', examples: ['MTN', 'Vodafone', 'AirtelTigo'] },
  { name: 'Books/Stationery', color: '#96CEB4', examples: ['Textbooks', 'Printing', 'Photocopy'] },
  { name: 'Entertainment', color: '#FFEAA7', examples: ['Cinema', 'Events', 'Sports', 'Streaming'] },
  { name: 'Rent/Hostel', color: '#DDA0DD', examples: ['Hostel fees', 'Apartment', 'Utilities'] },
  { name: 'Groceries', color: '#98D8C8', examples: ['Market', 'Melcom', 'Palace Mall'] },
  { name: 'Health', color: '#F8BBD9', examples: ['Pharmacy', 'Clinic', 'NHIS'] },
  { name: 'Miscellaneous', color: '#F0E68C', examples: ['Other expenses'] },
] as const

export type CategoryName = (typeof GHANA_CATEGORIES)[number]['name']

export const UNIVERSITIES = [
  'University of Ghana (UG)',
  'Kwame Nkrumah University of Science and Technology (KNUST)',
  'University of Cape Coast (UCC)',
  'Ghana Institute of Management and Public Administration (GIMPA)',
  'University of Professional Studies (UPSA)',
  'Ashesi University',
  'Central University',
  'Wisconsin International University College',
  'Valley View University',
  'University for Development Studies (UDS)',
  'Other',
] as const

export const INCOME_SOURCES = [
  { value: 'family', label: 'Family Allowance' },
  { value: 'scholarship', label: 'Scholarship / Bursary' },
  { value: 'work', label: 'Part-time Work' },
  { value: 'mixed', label: 'Multiple Sources' },
] as const

export const TRANSPORT_MODES = [
  { value: 'trotro', label: 'Trotro / Bus' },
  { value: 'walking', label: 'Walking' },
  { value: 'bike', label: 'Bicycle / Motorbike' },
  { value: 'taxi', label: 'Taxi / Uber' },
  { value: 'own_vehicle', label: 'Own Vehicle' },
] as const

export const CURRENCY_OPTIONS = [
  { value: 'GHS', label: 'GHS — Ghana Cedi (₵)' },
  { value: 'USD', label: 'USD — US Dollar ($)' },
] as const

export const BUDGET_PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'semester', label: 'Per Semester' },
] as const

export const CURRENCY_SYMBOL: Record<string, string> = {
  GHS: '₵',
  USD: '$',
}
