// Temporary compatibility layer for character data
// TODO: Migrate to Clean Architecture

export const characters = [
  {
    id: 1,
    name: '뿌꾸',
    image: '/images/char1.png',
    unlocked: true,
    price: null, // 가격이 없으면 해금됨
  },
  {
    id: 2,
    name: '찌비',
    image: '/images/char2.png', 
    unlocked: false,
    price: {
      fireJelly: 500,
      lightJelly: 300,
      heartJelly: 700
    },
  
  },
  {
    id: 3,
    name: '삐요',
    image: '/images/char3.png',
    unlocked: false,
    price: {
      fireJelly: 300,
      lightJelly: 0,
      heartJelly: 200
    },

  },
  {
    id: 4,
    name: '푸미',
    image: '/images/char4.png', 
    unlocked: false,
    price: {
      fireJelly: 500,
      lightJelly: 1000,
      heartJelly: 1500
    },

  }
];

export default characters;