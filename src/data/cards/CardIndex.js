// Temporary compatibility layer for card data
// TODO: Migrate to Clean Architecture

import inscard1 from './inscard1.png';
import inscard2 from './inscard2.png';
import inscard3 from './inscard3.png';
import inscard4 from './inscard4.png';

export const cardData = [
  {
    id: 1,
    title: '영감 카드 1',
    description: '오늘의 영감을 얻어보세요',
    image: inscard1
  },
  {
    id: 2,
    title: '영감 카드 2',
    description: '새로운 아이디어를 발견하세요',
    image: inscard2
  },
  {
    id: 3,
    title: '영감 카드 3',
    description: '창의적인 생각을 키워보세요',
    image: inscard3
  },
  {
    id: 4,
    title: '영감 카드 4',
    description: '목표를 향해 나아가세요',
    image: inscard4
  }
];

export default cardData;