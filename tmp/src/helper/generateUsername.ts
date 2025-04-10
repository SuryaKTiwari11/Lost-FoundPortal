/**
 * Helper function to generate a username based on user's name and email
 * This creates a unique username that can be used for authentication and identification
 */

import mongoose from "mongoose";

/**
 * Generates a unique username based on the user's name and email
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

  // Generate a short random suffix (4 characters)
  const randomSuffix = Math.random().toString(36).substring(2, 6);

  // Combine parts to create a unique username
  const username = `${baseUsername}${emailPrefix.substring(0, 5)}${randomSuffix}`;

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
    const randomSuffix = Math.random().toString(36).substring(2, 4);
    username = `${username.substring(0, 15)}${counter}${randomSuffix}`;
  }

  return username;
};
