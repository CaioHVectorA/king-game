// Deterministic Seeded PRNG (Mulberry32)
export class PRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed ? seed >>> 0 : Math.floor(Math.random() * 0xffffffff);
  }

  // Returns pseudo-random float [0, 1)
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Returns integer in range [min, max] inclusive
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Pick random element with weights
  pickWeighted<T extends { weight?: number }>(items: T[]): T | null {
    if (items.length === 0) return null;
    const totalWeight = items.reduce((sum, item) => sum + (item.weight ?? 1), 0);
    if (totalWeight <= 0) return items[0];

    let random = this.next() * totalWeight;
    for (const item of items) {
      random -= item.weight ?? 1;
      if (random <= 0) return item;
    }
    return items[items.length - 1];
  }

  getSeed(): number {
    return this.state;
  }
}
