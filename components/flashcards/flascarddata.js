// Flashcard data for cybersecurity course
export const cybersecurityFlashcards = [
  {
    "definition": "Malicious software designed to harm, exploit, or otherwise compromise computer systems.",
    "term": "Malware"
  },
  {
    "definition": "A fraudulent attempt to obtain sensitive information by disguising as a trustworthy entity.",
    "term": "Phishing"
  },
  {
    "definition": "The process of converting information into code to prevent unauthorized access.",
    "term": "Encryption"
  },
  {
    "definition": "A type of malicious software that encrypts files and demands a ransom for decryption.",
    "term": "Ransomware"
  },
  {
    "definition": "Manipulative tactics used to trick individuals into divulging confidential information.",
    "term": "Social Engineering"
  },
  {
    "definition": "The practice of protecting systems, networks, and programs from digital attacks.",
    "term": "Cybersecurity"
  },
  {
    "definition": "A security process that requires two different forms of identification to access an account.",
    "term": "Two-Factor Authentication"
  }
];

/**
 * @typedef {Object} FlashcardItem
 * @property {string} module_title
 * @property {string} term
 * @property {string} definition
 */

/**
 * Fetch flashcard data for a given topic.
 * This function now returns a promise that resolves with the API data.
 * @param {string=} topic
 * @returns {Promise<FlashcardItem[]>}
 */
export async function fetchFlashcardData(topic) {
  // This function is now a placeholder that will be replaced by the context
  // The actual data will come from the API response stored in ContentContext
  return Promise.resolve([]);
}
