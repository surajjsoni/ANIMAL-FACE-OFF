
export interface GroundingLink {
  uri: string;
  title: string;
}

export interface BattleResult {
  winner: string;
  loser: string;
  probability: number;
  reasoning: string;
  winnerGifUrl: string;
  loserGifUrl: string;
  groundingLinks: GroundingLink[];
  stats: {
    animal1Strength: number;
    animal1Speed: number;
    animal1Intelligence: number;
    animal1Defense: number;
    animal1Agility: number;
    animal2Strength: number;
    animal2Speed: number;
    animal2Intelligence: number;
    animal2Defense: number;
    animal2Agility: number;
  };
}

export interface BattleInput {
  animal1: string;
  animal2: string;
}
