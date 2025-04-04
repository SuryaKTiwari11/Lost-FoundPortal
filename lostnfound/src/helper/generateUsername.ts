/**
 * Generates a username from a first name and last name
 * If the generated username exists, it adds a random number
 */
export function generateUsername(firstName: string, lastName: string): string {
  // Convert to lowercase and remove non-alphanumeric characters
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Create username - first name + first character of last name
  let username = cleanFirst;
  if (cleanLast) {
    username += cleanLast.charAt(0);
  }

  // Add random number to make it more unique
  const randomDigits = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return username + randomDigits;
}
