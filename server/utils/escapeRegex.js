/**
 * Escapes special regex characters in a string to prevent ReDoS attacks.
 * Use this before passing user input to MongoDB $regex queries.
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default escapeRegex;
