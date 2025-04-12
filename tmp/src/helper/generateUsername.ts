/**
 * Helper function to generate a username based on user's name and email
 * This creates a unique username that can be used for authentication and identification
 */

import mongoose from "mongoose";

/**
 * Generates a deterministic username based on the user's name and email
 *
 * @param name - The user's full name
 * @param email - The user's email address
 * @returns A generated username string
 */
export const generateUsername = (name: string, email: string): string => {
  // Create a base username from the name (removing spaces and special characters)
  const baseUsername = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 10);

  // Take part of the email (before the @) to add uniqueness
  const emailPrefix = email.split("@")[0].replace(/[^a-z0-9]/g, "");

  // Generate a deterministic suffix using parts of the email and name
  // This avoids using Math.random() which causes hydration errors
  const nameSuffix = name.length > 0 ? 
    name.charCodeAt(0).toString().substring(0, 2) : '42';
  const emailSuffix = email.length > 0 ? 
    email.charCodeAt(0).toString().substring(0, 2) : '24';
  const deterministicSuffix = nameSuffix + emailSuffix;

  // Combine parts to create a deterministic username
  const username = `${baseUsername}${emailPrefix.substring(0, 5)}${deterministicSuffix}`;

  return username;
};

/**
 * Checks if a username already exists in the database
 *
 * @param User - The User model
 * @param username - The username to check
 * @returns Boolean indicating whether the username exists
 */
export const usernameExists = async (
  User: any,
  username: string
): Promise<boolean> => {
  try {
    const existingUser = await User.findOne({ username });
    return !!existingUser;
  } catch (error) {
    console.error("Error checking username existence:", error);
    return false;
  }
};

/**
 * Generates a guaranteed unique username by checking the database
 *
 * @param User - The User model
 * @param name - The user's full name
 * @param email - The user's email address
 * @returns A unique username string
 */
export const generateUniqueUsername = async (
  User: any,
  name: string,
  email: string
): Promise<string> => {
  let username = generateUsername(name, email);
  let counter = 0;

  // Keep checking and regenerating until we find a unique username
  while (await usernameExists(User, username)) {
    counter++;
    // Use a deterministic approach with counter instead of Math.random()
    username = `${username.substring(0, 15)}${counter}${name.length % 10}${email.length % 10}`;
  }

  return username;
};
