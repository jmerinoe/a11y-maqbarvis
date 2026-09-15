// products.js — static product catalog (8 products, localized ES/EN)

export const products = [
  {
    id: 'p001',
    name: { es: 'Camiseta', en: 'T-shirt' },
    image: '/images/p001.jpg',
    price: 19.99,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['blue', 'black', 'white'],
    colorHex: { blue: '#3b82f6', black: '#1a1a1a', white: '#f5f5f5' },
    description: {
      es: 'Camiseta de algodón orgánico, corte regular.',
      en: 'Organic cotton t-shirt, regular fit.',
    },
  },
  {
    id: 'p002',
    name: { es: 'Camiseta de rayas', en: 'Striped t-shirt' },
    image: '/images/p002.jpg',
    price: 17.99,
    sizes: ['S', 'M', 'L'],
    colors: ['white', 'gray'],
    colorHex: { white: '#f5f5f5', gray: '#9ca3af' },
    description: {
      es: 'Camiseta básica de algodón, cuello redondo.',
      en: 'Basic cotton t-shirt, crew neck.',
    },
  },
  {
    id: 'p003',
    name: { es: 'Vaqueros slim', en: 'Slim jeans' },
    image: '/images/p003.jpg',
    price: 39.99,
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['blue', 'black'],
    colorHex: { blue: '#4b6587', black: '#1a1a1a' },
    description: {
      es: 'Vaqueros slim fit de algodón elástico.',
      en: 'Slim fit stretch cotton jeans.',
    },
  },
  {
    id: 'p004',
    name: { es: 'Sudadera gris', en: 'Gray hoodie' },
    image: '/images/p004.jpg',
    price: 34.99,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['gray', 'black', 'green'],
    colorHex: { gray: '#9ca3af', black: '#1a1a1a', green: '#22c55e' },
    description: {
      es: 'Sudadera con capucha, forro polar.',
      en: 'Hoodie with fleece lining.',
    },
  },
  {
    id: 'p005',
    name: { es: 'Chaqueta de cuero', en: 'Leather jacket' },
    image: '/images/p005.jpg',
    price: 89.99,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['black', 'brown'],
    colorHex: { black: '#1a1a1a', brown: '#8b4513' },
    description: {
      es: 'Chaqueta de cuero sintético, cremallera frontal.',
      en: 'Synthetic leather jacket, front zipper.',
    },
  },
  {
    id: 'p006',
    name: { es: 'Camisa a cuadros', en: 'Plaid shirt' },
    image: '/images/p006.jpg',
    price: 29.99,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['red', 'blue', 'green'],
    colorHex: { red: '#ef4444', blue: '#3b82f6', green: '#22c55e' },
    description: {
      es: 'Camisa de franela a cuadros, botones frontales.',
      en: 'Plaid flannel shirt, front buttons.',
    },
  },
  {
    id: 'p007',
    name: { es: 'Gorra negra', en: 'Black cap' },
    image: '/images/p007.jpg',
    price: 14.99,
    sizes: ['Única', 'One size'],
    colors: ['black', 'white', 'red'],
    colorHex: { black: '#1a1a1a', white: '#f5f5f5', red: '#ef4444' },
    description: {
      es: 'Gorra de béisbol ajustable, algodón.',
      en: 'Adjustable baseball cap, cotton.',
    },
  },
  {
    id: 'p008',
    name: { es: 'Bufanda de lana', en: 'Wool scarf' },
    image: '/images/p008.jpg',
    price: 22.99,
    sizes: ['Única', 'One size'],
    colors: ['gray', 'black', 'red'],
    colorHex: { gray: '#9ca3af', black: '#1a1a1a', red: '#ef4444' },
    description: {
      es: 'Bufanda de lana merino, tejido suave.',
      en: 'Merino wool scarf, soft weave.',
    },
  },
];

export function getProductById(id) {
  return products.find((p) => p.id === id);
}

export function getFilteredProducts(query, sizes, colors) {
  return products.filter((p) => {
    const lang = document.documentElement.lang || 'es';
    const name = p.name[lang] || p.name.es;
    const matchesQuery =
      !query || name.toLowerCase().includes(query.toLowerCase());
    const matchesSize = sizes.length === 0 || p.sizes.some((s) => sizes.includes(s));
    const matchesColor = colors.length === 0 || p.colors.some((c) => colors.includes(c));
    return matchesQuery && matchesSize && matchesColor;
  });
}
