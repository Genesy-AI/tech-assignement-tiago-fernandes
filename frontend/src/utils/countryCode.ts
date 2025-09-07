// ISO country code ISO 3166-1 alpha-2 2 letter code
import * as countryCodes from "country-codes-list";

/**
 * Generated key values pairs of country codes with a strings containing 
 * an emoji flag and its country code. The value string is used for presentation purposes.
 * e.g. { fo: "🇫🇴 FO" }
 */
export const countryCodesFlags: Record<string, string> = countryCodes.customList(
  "countryCode",
  "{flag} {countryCode}"
);

/**
 * Validates if a country code is valid
 * regardless of the casing 
 * e.g. "us" or "US" are valid
 * 
 * @param countryCode - The country code to validate
 * @returns true if the country code is valid, false otherwise
 */
export const isValidCountryCode = (countryCode: string): boolean => {
  const countryCodeUppered = countryCode.toUpperCase()
  return countryCodesFlags[countryCodeUppered] !== undefined
}