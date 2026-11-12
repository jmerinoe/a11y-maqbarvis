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
        '¡Tienes que llegar de San Nicasio a Aeropuerto T4 <strong>en menos de 60 minutos</strong>! Tienes un vuelo que coger y no puedes perderlo.',
        'Para calcular el trayecto, tendrás que ir añadiendo tramos, indicando un origen y un destino dentro de una misma línea de metro, hasta completar la ruta.',
        'Ten en cuenta estas reglas e incidencias:',
      ],
      en: [
        'You have to get from San Nicasio to Aeropuerto T4 <strong>in under 60 minutes</strong>! You have a flight to catch and you cannot miss it.',
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
        value: { es: 'Menos de 60 minutos', en: 'Under 60 minutes' },
      },
      {
        id: 'rules',
        label: { es: 'Reglas', en: 'Rules' },
        items: {
          es: [
            'El origen debe partir siempre desde el tramo de destino que fue previamente seleccionado.',
            'Cada parada recorrida suma 2 minutos al trayecto.',
            'Los transbordos entre líneas no añaden tiempo.',
            'Cualquier ruta inferior a 60 minutos es válida.',
            'Gana quien consiga el trayecto más corto. En caso de empate, ganará quien lo complete antes.',
          ],
          en: [
            'The origin of each leg must always start from the destination of the previously selected leg.',
            'Each stop travelled adds 2 minutes to the journey.',
            'Transfers between lines add no extra time.',
            'Any route under 60 minutes is valid.',
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
        'El objetivo de esta experiencia es ponerte, durante unos minutos, en la piel de una persona que se enfrenta a un producto digital escrito en <strong>un lenguaje innecesariamente complejo</strong>.',
        'La web que vas a utilizar está redactada en un castellano burocrático y enrevesado: descubrirás <strong>qué ocurre cuando entender cada botón, cada menú y cada mensaje se convierte en un ejercicio de interpretación</strong>.',
        'La experiencia pretende ayudarte a identificar las barreras que aparecen cuando el contenido exige descifrarlo constantemente, y a reflexionar sobre por qué el lenguaje claro es una parte esencial de la accesibilidad digital.',
        'Eso sí, no vamos a negar que nos gusta un poco la competición… <strong>Al finalizar la mañana, quien consiga completar la experiencia en el menor tiempo se llevará un pequeño regalo</strong>. Así que disfruta, presta atención… ¡y que gane el más rápido!',
      ],
      en: [
        'The goal of this experience is to put you, for a few minutes, in the shoes of someone facing a digital product written in <strong>needlessly complex language</strong>.',
        'The website you will use is written in convoluted, bureaucratic Spanish: you will discover <strong>what happens when understanding every button, menu and message becomes an exercise in interpretation</strong>.',
        'The experience aims to help you identify the barriers that appear when content must be constantly decoded, and to reflect on why plain language is an essential part of digital accessibility.',
        'That said, we will not deny we enjoy a bit of competition… <strong>At the end of the morning, whoever completes the experience in the shortest time will get a small gift</strong>. So enjoy, pay attention… and may the fastest win!',
      ],
    },
    missionIntro: {
      es: [
        'Tienes un dolor que no sabes explicar y necesitas que te atienda un <strong>especialista en dolor</strong>.',
        'Solo puedes acudir al hospital <strong>por la tarde</strong> y necesitas que la cita sea durante <strong>la segunda quincena de octubre</strong>, en el <strong>Hospital más cercano a tu casa</strong>.',
        'Tu misión es, por tanto, conseguir <strong>la cita médica más próxima posible</strong> en un Hospital concreto. Gana quien consiga la cita más cercana; <strong>a igual fecha y hora de cita, gana quien la haya conseguido en menos tiempo</strong>.',
      ],
      en: [
        'You have a pain you cannot explain and need to see a <strong>pain specialist</strong>.',
        'You can only go to the hospital <strong>in the afternoon</strong>, and you need the appointment during <strong>the second half of October</strong>, at the <strong>hospital closest to your home</strong>.',
        'Your mission is therefore to get the <strong>closest possible appointment</strong> at a specific hospital. Whoever books the nearest slot wins; <strong>on a date and time tie, whoever got it faster wins</strong>.',
      ],
    },
    missionOutro: {
      es: [
        'Durante todo el recorrido estarás acompañado/a por nosotros, por lo que podrás pedir ayuda en cualquier momento. La idea es que puedas centrarte en la experiencia y en las dificultades que puedan aparecer durante el recorrido.',
      ],
      en: [
        'We will accompany you throughout the whole journey, so you can ask for help at any time. The idea is that you focus on the experience and on the difficulties that may appear along the way.',
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
        label: { es: 'Consulta', en: 'Clinic' },
        value: { es: 'Consulta del Dolor', en: 'Pain Clinic' },
      },
      {
        id: 'center',
        label: { es: 'Centro', en: 'Center' },
        value: { es: 'Hospital Vega Norte', en: 'Hospital Vega Norte' },
      },
      {
        id: 'window',
        label: { es: 'Franja', en: 'Time window' },
        value: { es: '16–31 de octubre, por la tarde (15:00–20:00)', en: 'October 16–31, afternoon (15:00–20:00)' },
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
