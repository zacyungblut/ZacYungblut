export interface CountryCode {
  name: string;
  dialCode: string;
  code: string;
  flag: string;
  numberLength?: number;
}

export const COUNTRY_CODES: CountryCode[] = [
  {
    name: "United States",
    dialCode: "+1",
    code: "US",
    flag: "🇺🇸",
    numberLength: 10,
  },
  {
    name: "Canada",
    dialCode: "+1",
    code: "CA",
    flag: "🇨🇦",
    numberLength: 10,
  },
  {
    name: "United Kingdom",
    dialCode: "+44",
    code: "GB",
    flag: "🇬🇧",
    numberLength: 10,
  },
  // Add more countries as needed
];

export const DEFAULT_COUNTRY: CountryCode = COUNTRY_CODES[0]; // US as default
