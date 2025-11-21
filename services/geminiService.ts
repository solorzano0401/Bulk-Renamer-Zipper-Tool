import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Converts a File object to a Base64 string.
 */
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Generates a list of creative filenames based on the image content using Gemini.
 */
export const generateFilenamesFromImage = async (file: File, count: number = 10): Promise<string[]> => {
  try {
    if (!API_KEY) {
      console.warn("API Key is missing. Skipping AI generation.");
      return ["API_KEY_MISSING_CHECK_ENV"];
    }

    const imagePart = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          imagePart,
          {
            text: `Analyze this image and generate a list of ${count} distinct, descriptive, and SEO-friendly filenames that would be suitable for this image. 
            Return ONLY the list of names (without file extensions).
            The names should use hyphens or underscores instead of spaces.
            Do not include numbering or bullet points.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonString = response.text;
    if (!jsonString) return [];

    const names = JSON.parse(jsonString);
    return Array.isArray(names) ? names : [];

  } catch (error) {
    console.error("Error generating filenames:", error);
    throw error;
  }
};
