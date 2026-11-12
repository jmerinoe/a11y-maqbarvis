// experiences.js — registry of workshop experiences (extensible)
// Adding a new experience = a new entry; the flow stays generic.

export const experiences = [
  {
    id: 'screen-reader',
    codename: 'BLIND BUY',
    name: {
      es: 'Experiencia con lectores de pantalla',
      en: 'Screen reader experience',
    },
    welcome: {
      es: 'Bienvenido a la experiencia de compra on-line con lector de pantalla.',
      en: 'Welcome to the online shopping experience with a screen reader.',
    },
    objective: {
      es: [
        'El objetivo de esta experiencia es realizar una compra online utilizando únicamente la información que te proporcione el lector de pantalla. Para ello, llevarás un antifaz y unos cascos, de forma que no puedas ver la pantalla y puedas concentrarte en las indicaciones de voz.',
      ],
      en: [
        'The goal of this experience is to make an online purchase using only the information provided by the screen reader. To do so, you will wear a blindfold and headphones, so you cannot see the screen and can focus on the voice cues.',
      ],
    },
    missionIntro: {
      es: ['Completa el proceso de compra siguiendo estas indicaciones:'],
      en: ['Complete the purchase process following these instructions:'],
    },
    missionOutro: {
      es: [
        'Deberás localizar el producto, seleccionar la talla, añadirlo a la cesta y completar el pago. Sabrás que lo has conseguido cuando aparezca el mensaje de confirmación de compra.',
        '¡No estarás solo/a! Durante toda la experiencia estaremos a tu lado para ayudarte. Si necesitas que te recordemos algún dato, como el número de tarjeta, solo tienes que pedirlo.',
        'No se trata de hacerlo perfecto, sino de <strong>experimentar las dificultades que puede encontrar una persona que utiliza un lector de pantalla cuando una web no es accesible</strong>.',
        'Y, como nos gusta un poco la competición, <strong>quien consiga completar la experiencia en el menor tiempo se llevará un pequeño regalo</strong>. Así que disfruta, presta atención… ¡y que gane el más rápido!',
        '¡Ponte los cascos, ajusta el antifaz y que empiece el reto!',
      ],
      en: [
        'You must find the product, select the size, add it to the basket and complete the payment. You will know you made it when the purchase confirmation message appears.',
        'You will not be alone! We will be by your side throughout the experience to help you. If you need us to remind you of any detail, like the card number, just ask.',
        'This is not about doing it perfectly — it is about <strong>experiencing the difficulties a screen reader user faces when a website is not accessible</strong>.',
        'And since we enjoy a bit of competition, <strong>whoever completes the experience in the shortest time will get a small gift</strong>. So enjoy, pay attention… and may the fastest win!',
        'Put your headphones on, adjust your blindfold — let the challenge begin!',
      ],
    },
    homeRoute: '#/home',
    requiredItem: {
      productId: 'p001',
      size: 'M',
      color: 'blue',
      quantity: 1,
      cardNumber: '4000056655665556',
      label: {
        es: 'Camiseta azul, sin rayas',
        en: 'Blue t-shirt, no stripes',
      },
    },
    missionCard: [
      {
        id: 'product',
        label: { es: 'Producto', en: 'Product' },
        value: { es: 'Camiseta azul, sin rayas', en: 'Blue t-shirt, no stripes' },
      },
      {
        id: 'size',
        label: { es: 'Talla', en: 'Size' },
        value: { es: 'M', en: 'M' },
      },
      {
        id: 'card',
        label: { es: 'Tarjeta', en: 'Card' },
        value: { es: '4000056655665556', en: '4000056655665556' },
        copyable: true,
      },
      {
        id: 'expiry',
        label: { es: 'Caducidad', en: 'Expiry date' },
        value: { es: 'Cualquier fecha futura', en: 'Any future date' },
      },
      {
        id: 'cvv',
        label: { es: 'CVV', en: 'CVV' },
        value: { es: '3 dígitos cualesquiera', en: 'Any 3 digits' },
      },
    ],
  },
  {
    id: 'chromatic',
    codename: 'COLOR TRAP',
    homeRoute: '#/metro',
    name: {
      es: 'Experiencia cromática',
      en: 'Chromatic experience',
    },
    welcome: {
      es: 'Bienvenido a la experiencia cromática.',
      en: 'Welcome to the chromatic experience.',
    },
    objective: {
      es: [
        'Tu objetivo es completar un recorrido en transporte público utilizando una web que se muestra íntegramente en blanco y negro. Tendrás que planificar la ruta sin poder distinguir los colores que habitualmente ayudan a identificar las líneas y sus recorridos.',
      ],
      en: [
        'Your goal is to complete a public transport journey using a website rendered entirely in black and white. You will have to plan the route without being able to tell apart the colors that usually help identify the lines and their paths.',
      ],
    },
    missionIntro: {
      es: [
        '¡Tienes que llegar de San Nicasio a Aeropuerto T4 <strong>en 60 minutos o menos</strong>! Tienes un vuelo que coger y no puedes perderlo.',
        'Para calcular el trayecto, tendrás que ir añadiendo tramos, indicando un origen y un destino dentro de una misma línea de metro, hasta completar la ruta.',
        'Ten en cuenta estas reglas e incidencias:',
      ],
      en: [
        'You have to get from San Nicasio to Aeropuerto T4 <strong>in 60 minutes or less</strong>! You have a flight to catch and you cannot miss it.',
        'To compute the journey you will add legs, picking an origin and a destination within the same metro line, until the route is complete.',
        'Keep these rules and disruptions in mind:',
      ],
    },
    missionOutro: {
      es: [
        '¡No estarás solo/a! Durante toda la experiencia estaremos a tu lado para ayudarte si lo necesitas.',
        'El reto consiste en descubrir <strong>las dificultades que pueden aparecer cuando una web utiliza únicamente el color para transmitir información</strong>. ¡Planifica bien tu ruta y <strong>que gane el más rápido</strong>!',
      ],
      en: [
        'You will not be alone! We will be by your side throughout the experience to help you if needed.',
        'The challenge is to discover <strong>the difficulties that can appear when a website conveys information only through color</strong>. Plan your route well — and <strong>may the fastest win</strong>!',
      ],
    },
    mission: {
      origin: 'San Nicasio',
      destination: 'Aeropuerto T4',
      maxMinutes: 60,
    },
    missionCard: [
      {
        id: 'origin',
        label: { es: 'Origen', en: 'Origin' },
        value: { es: 'San Nicasio', en: 'San Nicasio' },
      },
      {
        id: 'destination',
        label: { es: 'Destino', en: 'Destination' },
        value: { es: 'Aeropuerto T4', en: 'Aeropuerto T4' },
      },
      {
        id: 'limit',
        label: { es: 'Límite', en: 'Time limit' },
        value: { es: '60 minutos o menos', en: '60 minutes or less' },
      },
      {
        id: 'rules',
        label: { es: 'Reglas', en: 'Rules' },
        items: {
          es: [
            'El origen debe partir siempre desde el tramo de destino que fue previamente seleccionado.',
            'Cada parada recorrida suma 2 minutos al trayecto.',
            'Los transbordos entre líneas no añaden tiempo.',
            'Cualquier ruta de 60 minutos o menos es válida.',
            'Gana quien consiga el trayecto más corto. En caso de empate, ganará quien lo complete antes.',
          ],
          en: [
            'The origin of each leg must always start from the destination of the previously selected leg.',
            'Each stop travelled adds 2 minutes to the journey.',
            'Transfers between lines add no extra time.',
            'Any route of 60 minutes or less is valid.',
            'The shortest journey wins; on a tie, whoever completed it first wins.',
          ],
        },
      },
      {
        id: 'status',
        label: { es: 'Incidencias', en: 'Disruptions' },
        items: {
          es: [
            'Línea 6: interrumpida.',
            'Línea 4: los trenes tardan el triple de tiempo.',
            'Alonso Martínez: estación cortada; no entran ni salen trenes.',
          ],
          en: [
            'Line 6: interrupted.',
            'Line 4: trains take three times as long.',
            'Alonso Martínez: station closed; no trains enter or leave.',
          ],
        },
      },
    ],
  },
  {
    id: 'comprehension',
    codename: 'DECIPHER MODE',
    homeRoute: '#/hospital',
    name: {
      es: 'Experiencia cognitiva',
      en: 'Cognitive experience',
    },
    welcome: {
      es: 'Bienvenido a la experiencia cognitiva.',
      en: 'Welcome to the cognitive experience.',
    },
    objective: {
      es: [
        'Tu objetivo es conseguir una cita médica navegando por una web cuyo contenido está redactado en un lenguaje burocrático y complicado. Tendrás que descifrar menús, opciones y mensajes para encontrar lo que necesitas.',
      ],
      en: [
        'Your goal is to get a medical appointment by navigating a website whose content is written in bureaucratic, convoluted language. You will have to decipher menus, options and messages to find what you need.',
      ],
    },
    missionIntro: {
      es: [
        'Tienes un dolor que no sabes explicar y necesitas que te atienda un <strong>especialista en dolor</strong>. Para conseguirlo, debes encontrar una cita que cumpla todas estas condiciones:',
      ],
      en: [
        'You have a pain you cannot explain and need a <strong>pain specialist</strong> to see you. To get it, you must find an appointment that meets all these conditions:',
      ],
    },
    missionOutro: {
      es: [
        'Tu objetivo es conseguir <strong>la cita más próxima posible</strong> que cumpla todos estos requisitos.',
        '<strong>Gana quien consiga la cita más cercana</strong>. Si hay empate en la fecha y hora, ganará quien haya completado la reserva en menos tiempo.',
        '¡No estarás solo/a! Durante todo el recorrido estaremos a tu lado para ayudarte si lo necesitas.',
        'El reto consiste en descubrir <strong>las dificultades que puede generar un lenguaje innecesariamente complejo</strong> y comprobar cómo influye en una tarea tan cotidiana como pedir una cita médica.',
        '¡Descifra el lenguaje, encuentra tu cita y <strong>que gane el más rápido</strong>!',
      ],
      en: [
        'Your goal is to get <strong>the closest possible appointment</strong> that meets all these requirements.',
        '<strong>Whoever gets the nearest appointment wins</strong>. On a date and time tie, whoever completed the booking in less time wins.',
        'You will not be alone! We will be by your side throughout the journey to help you if needed.',
        'The challenge is to discover <strong>the difficulties that needlessly complex language can create</strong> and see how it affects such an everyday task as booking a medical appointment.',
        'Decipher the language, find your appointment — and <strong>may the fastest win</strong>!',
      ],
    },
    mission: {
      specialty: 'Algología',
      center: 'Hospital Vega Norte',
      afternoonStart: 15,
      afternoonEnd: 20,
      month: 10,
      dayMin: 16,
      dayMax: 31,
    },
    missionCard: [
      {
        id: 'specialty',
        label: { es: 'Especialidad', en: 'Specialty' },
        value: { es: 'Consulta del Dolor', en: 'Pain Clinic' },
      },
      {
        id: 'center',
        label: { es: 'Centro', en: 'Center' },
        value: {
          es: 'Hospital Vega Norte (el más cercano a tu casa)',
          en: 'Hospital Vega Norte (the closest to your home)',
        },
      },
      {
        id: 'date',
        label: { es: 'Fecha', en: 'Date' },
        value: { es: 'Entre el 16 y el 31 de octubre', en: 'October 16–31' },
      },
      {
        id: 'hours',
        label: { es: 'Horario', en: 'Hours' },
        value: {
          es: 'Por la tarde, entre las 15:00 y las 20:00',
          en: 'Afternoon, 15:00–20:00',
        },
      },
    ],
  },
];

export function getExperienceById(id) {
  return experiences.find((e) => e.id === id);
}

export function isRequiredItem(item, experience) {
  const r = experience.requiredItem;
  return (
    item.productId === r.productId &&
    item.size === r.size &&
    item.color === r.color &&
    item.quantity === (r.quantity ?? 1)
  );
}

// The order must be exactly the required item — extra items invalidate
// completion (owner decision).
export function isCompletedOrder(items, experience) {
  return items.length === 1 && isRequiredItem(items[0], experience);
}
