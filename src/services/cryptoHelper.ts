import crypto from "crypto";

/**
 * Создает хеш sha256
 * 
 * @param inputString 
 * @returns 
 */
export function createSHA256Hash(inputString: string) {
  const hash = crypto.createHash("sha256");
  hash.update(inputString);
  return hash.digest("hex");
}

