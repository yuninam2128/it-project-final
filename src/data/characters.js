// Temporary compatibility layer for character data
// TODO: Migrate to Clean Architecture

export const characters = [
  {
    id: 1,
    name: '기본 캐릭터',
    image: '/images/character1.png',
    unlocked: true,
    unlockCost: { A: 0, B: 0, C: 0, D: 0 }
  },
  {
    id: 2,
    name: '프리미엄 캐릭터',
    image: '/images/character2.png', 
    unlocked: false,
    unlockCost: { A: 5, B: 3, C: 2, D: 1 }
  }
];

export default characters;