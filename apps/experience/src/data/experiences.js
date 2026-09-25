// experiences.js — registry of workshop experiences (extensible)
// Adding a new experience = a new entry; the flow stays generic.

export const experiences = [
  {
    id: 'screen-reader',
    name: {
      es: 'Experiencia con lectores de voz',
      en: 'Screen reader experience',
    },
    welcome: {
      es: 'Bienvenido a la experiencia de compra on-line con lector de voz.',
      en: 'Welcome to the online shopping experience with a screen reader.',
    },
    objective: {
      es: [
        'El objetivo de esta experiencia es ponerte, durante unos minutos, en la piel de una persona que utiliza un lector de voz para navegar por un producto digital.',
        'A través de un flujo de compra realizado con antifaz y cascos, podrás experimentar <strong>cómo cambia la forma de interactuar con una web cuando la información visual deja de estar disponible</strong> y la navegación depende de la información que proporciona el lector de voz.',
        'La experiencia pretende ayudarte a identificar las barreras que pueden aparecer durante una tarea aparentemente sencilla, como realizar una compra online, y reflexionar sobre cómo las decisiones del diseño y del desarrollo pueden facilitar o dificultar la interacción.',
        'No se trata de hacerlo perfecto ni de poner a prueba tus conocimientos. Se trata de <strong>experimentar, detectar dificultades y entender por qué una experiencia digital accesible debe poder ser utilizada por todas las personas</strong>.',
        'Eso sí, no vamos a negar que nos gusta un poco la competición… <strong>Al finalizar la mañana, quien consiga completar la experiencia en el menor tiempo se llevará un pequeño regalo</strong>. Así que disfruta, presta atención… ¡y que gane el más rápido!',
      ],
      en: [
        'The goal of this experience is to put you, for a few minutes, in the shoes of someone who uses a screen reader to navigate a digital product.',
        'Through a purchase flow completed blindfolded and wearing headphones, you will experience <strong>how interaction with a website changes when visual information is no longer available</strong> and navigation depends on what the screen reader provides.',
        'The experience aims to help you identify the barriers that can appear during an apparently simple task, such as making an online purchase, and to reflect on how design and development decisions can ease or hinder interaction.',
        'This is not about doing it perfectly or testing your knowledge. It is about <strong>experimenting, spotting difficulties, and understanding why an accessible digital experience must be usable by everyone</strong>.',
        'That said, we will not deny we enjoy a bit of competition… <strong>At the end of the morning, whoever completes the experience in the shortest time will get a small gift</strong>. So enjoy, pay attention… and may the fastest win!',
      ],
    },
    missionIntro: {
      es: [
        'Tu misión es completar una compra online utilizando únicamente la información que te proporcione el lector de voz.',
        'Para evitar tentaciones y que la experiencia sea lo más realista posible, realizarás el recorrido con un antifaz que impedirá que veas la pantalla. Además, utilizarás cascos para aislarte del ruido ambiental y poder concentrarte en la información que te proporciona el lector de voz.',
      ],
      en: [
        'Your mission is to complete an online purchase using only the information provided by the screen reader.',
        'To avoid temptation and keep the experience as realistic as possible, you will go through it wearing a blindfold that prevents you from seeing the screen. You will also wear headphones to block out ambient noise and focus on what the screen reader tells you.',
      ],
    },
    missionOutro: {
      es: [
        'El reto consiste en completar todo el flujo de compra: identificar correctamente el artículo, seleccionar la talla, añadirlo a la cesta y finalizar el pago. Cuando la compra se haya realizado correctamente, aparecerá un popup confirmando que la operación se ha completado con éxito.',
        'Durante todo el recorrido estarás acompañado/a por nosotros, por lo que podrás pedir ayuda en cualquier momento. Si al llegar al momento del pago necesitas que te recordemos el número de tarjeta, te lo facilitaremos sin problema. La idea es que puedas centrarte en la experiencia y en las dificultades que puedan aparecer durante el recorrido, no en memorizar datos.',
      ],
      en: [
        'The challenge is to complete the entire purchase flow: correctly identify the item, select the size, add it to the basket and finish the payment. When the purchase has been completed correctly, a popup will confirm that the operation finished successfully.',
        'We will accompany you throughout the whole journey, so you can ask for help at any time. If at payment time you need us to remind you of the card number, we will gladly provide it. The idea is that you focus on the experience and on the difficulties that may appear along the way, not on memorizing data.',
      ],
    },
    requiredItem: {
      productId: 'p001',
      size: 'M',
      color: 'blue',
      cardNumber: '4000056655665556',
      label: {
        es: 'Camiseta azul, sin rayas',
        en: 'Blue t-shirt, no stripes',
      },
    },
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
