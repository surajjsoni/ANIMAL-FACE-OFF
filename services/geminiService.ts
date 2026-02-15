
import { GoogleGenAI, Type } from "@google/genai";
import { BattleResult, GroundingLink } from "../types";

const GIPHY_API_KEY = "p0GfBkqjdIMJ5KiHJpg7Ebgyj5Bj5rGT";

const fetchGiphy = async (query: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=1&rating=g`
    );
    const data = await response.json();
    return data.data?.[0]?.images?.original?.url || "";
  } catch (err) {
    console.error("Giphy fetch error:", err);
    return "";
  }
};

export const getRandomMatchup = async (): Promise<{ animal1: string; animal2: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const prompt = "Suggest two animals for a balanced hypothetical battle. Similar power bracket. Return JSON.";

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          animal1: { type: Type.STRING },
          animal2: { type: Type.STRING },
        },
        required: ["animal1", "animal2"],
      },
    },
  });

  if (!response.text) throw new Error("Failed to get random matchup");
  return JSON.parse(response.text.trim());
};

export const predictBattleOutcome = async (animal1: string, animal2: string): Promise<BattleResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const prompt = `Simulate a hypothetical battle between '${animal1}' and '${animal2}'. 
  1. Determine the winner and probability (0-100).
  2. Provide reasoning why this animal wins. STRICTOR RULE: The reasoning MUST NOT exceed 5 lines of text.
  3. Provide 5 comparative attributes (0-100) for both: Strength, Speed, Intelligence, Defense, and Agility.
  4. Use Google Search to ensure biological accuracy.
  Format output as JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          winner: { type: Type.STRING },
          loser: { type: Type.STRING },
          probability: { type: Type.NUMBER },
          reasoning: { type: Type.STRING, description: "Max 5 sentences/lines of reasoning." },
          stats: {
            type: Type.OBJECT,
            properties: {
              animal1Strength: { type: Type.NUMBER },
              animal1Speed: { type: Type.NUMBER },
              animal1Intelligence: { type: Type.NUMBER },
              animal1Defense: { type: Type.NUMBER },
              animal1Agility: { type: Type.NUMBER },
              animal2Strength: { type: Type.NUMBER },
              animal2Speed: { type: Type.NUMBER },
              animal2Intelligence: { type: Type.NUMBER },
              animal2Defense: { type: Type.NUMBER },
              animal2Agility: { type: Type.NUMBER },
            },
            required: [
              "animal1Strength", "animal1Speed", "animal1Intelligence", "animal1Defense", "animal1Agility",
              "animal2Strength", "animal2Speed", "animal2Intelligence", "animal2Defense", "animal2Agility"
            ],
          }
        },
        required: ["winner", "loser", "probability", "reasoning", "stats"],
      },
    },
  });

  if (!response.text) throw new Error("No response from AI");

  const resultData = JSON.parse(response.text.trim());
  const [winnerGifUrl, loserGifUrl] = await Promise.all([
    fetchGiphy(`${resultData.winner} animal`),
    fetchGiphy(`${resultData.loser} animal`)
  ]);
  
  const groundingLinks: GroundingLink[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        groundingLinks.push({ uri: chunk.web.uri, title: chunk.web.title });
      }
    });
  }

  return { ...resultData, winnerGifUrl, loserGifUrl, groundingLinks };
};
