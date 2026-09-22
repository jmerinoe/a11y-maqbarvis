// experiences.js — registry of workshop experiences (extensible)
// Adding a new experience = a new entry; the flow stays generic.

export const experiences = [
  {
    id: 'screen-reader',
    name: {
      es: 'Experiencia con lectores de voz',
      en: 'Screen reader experience',
    },
    instructions: {
      es: 'Realiza un flujo de compra de una camiseta azul, talla M, utilizando la tarjeta 4000056655665556.',
      en: 'Complete a purchase of a blue t-shirt, size M, using card 4000056655665556.',
    },
    requiredItem: { productId: 'p001', size: 'M', color: 'blue' },
  },
];

export function getExperienceById(id) {
  return experiences.find((e) => e.id === id);
}

export function isRequiredItem(item, experience) {
  const r = experience.requiredItem;
  return (
    item.productId === r.productId && item.size === r.size && item.color === r.color
  );
}

// The order must be exactly the required item — extra items invalidate
// completion (owner decision).
export function isCompletedOrder(items, experience) {
  return items.length === 1 && isRequiredItem(items[0], experience);
}
