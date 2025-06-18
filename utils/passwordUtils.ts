import bcrypt from "bcryptjs";

/**
 * Hashes a password using bcrypt with a salt round of 12
 * @param password - The plain text password
 * @returns The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Hashes a password for transmission to the server
 * This creates a bcrypt hash that the server can verify
 * @param password - The plain text password
 * @returns The hashed password
 */
export const hashPasswordForTransmission = async (
  password: string
): Promise<string> => {
  return await hashPassword(password);
};

/**
 * Verifies a password against a stored hash
 * @param password - The plain text password to verify
 * @param storedHash - The stored hash from the database
 * @returns True if password matches, false otherwise
 */
export const verifyPassword = async (
  password: string,
  storedHash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, storedHash);
};

/**
 * Generates a random salt (bcrypt handles this internally, but keeping for compatibility)
 * @returns A random salt string
 */
export const generateSalt = (): string => {
  return bcrypt.genSaltSync(12);
};
