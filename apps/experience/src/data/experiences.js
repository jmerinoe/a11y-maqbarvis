// experiences.js — registry of workshop experiences (extensible)
// Adding a new experience = a new entry; the flow stays generic.

export const experiences = [
  {
    id: 'screen-reader',
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
        'El objetivo de esta experiencia es ponerte, durante unos minutos, en la piel de una persona que utiliza un lector de pantalla para navegar por un producto digital que <strong>NO es accesible</strong>.',
        'A través de un flujo de compra realizado con antifaz y cascos, podrás experimentar <strong>cómo cambia la forma de interactuar con una web cuando la información visual deja de estar disponible</strong> y la navegación depende de la información que proporciona el lector de pantalla.',
        'La experiencia pretende ayudarte a identificar las barreras que pueden aparecer durante una tarea aparentemente sencilla, como realizar una compra online, y reflexionar sobre cómo las decisiones del diseño y del desarrollo pueden facilitar o dificultar la interacción.',
        'No se trata de hacerlo perfecto ni de poner a prueba tus conocimientos. Se trata de <strong>experimentar, detectar dificultades y entender por qué una experiencia digital accesible debe poder ser utilizada por todas las personas</strong>.',
        'Eso sí, no vamos a negar que nos gusta un poco la competición… <strong>Al finalizar la mañana, quien consiga completar la experiencia en el menor tiempo se llevará un pequeño regalo</strong>. Así que disfruta, presta atención… ¡y que gane el más rápido!',
      ],
      en: [
        'The goal of this experience is to put you, for a few minutes, in the shoes of someone who uses a screen reader to navigate a digital product that is <strong>NOT accessible</strong>.',
        'Through a purchase flow completed blindfolded and wearing headphones, you will experience <strong>how interaction with a website changes when visual information is no longer available</strong> and navigation depends on what the screen reader provides.',
        'The experience aims to help you identify the barriers that can appear during an apparently simple task, such as making an online purchase, and to reflect on how design and development decisions can ease or hinder interaction.',
        'This is not about doing it perfectly or testing your knowledge. It is about <strong>experimenting, spotting difficulties, and understanding why an accessible digital experience must be usable by everyone</strong>.',
        'That said, we will not deny we enjoy a bit of competition… <strong>At the end of the morning, whoever completes the experience in the shortest time will get a small gift</strong>. So enjoy, pay attention… and may the fastest win!',
      ],
    },
    missionIntro: {
      es: [
        'Tu misión es completar una compra online utilizando únicamente la información que te proporcione el lector de pantalla.',
        'Para evitar tentaciones y que la experiencia sea lo más realista posible, realizarás el recorrido con un antifaz que impedirá que veas la pantalla. Además, utilizarás cascos para aislarte del ruido ambiental y poder concentrarte en la información que te proporciona el lector de pantalla.',
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
        'El objetivo de esta experiencia es ponerte, durante unos minutos, en la piel de una persona que <strong>no percibe los colores</strong> cuando interactúa con un producto digital.',
        'La web que vas a utilizar se muestra íntegramente en blanco y negro: descubrirás <strong>qué ocurre cuando la información se transmite únicamente a través del color</strong> y diferenciar tonos se convierte en una barrera.',
        'La experiencia pretende ayudarte a identificar las barreras que aparecen cuando el diseño depende de una sola vía sensorial, y a reflexionar sobre por qué una experiencia digital accesible debe poder ser utilizada por todas las personas.',
        'Eso sí, no vamos a negar que nos gusta un poco la competición… <strong>Al finalizar la mañana, quien consiga completar la experiencia en el menor tiempo se llevará un pequeño regalo</strong>. Así que disfruta, presta atención… ¡y que gane el más rápido!',
      ],
      en: [
        'The goal of this experience is to put you, for a few minutes, in the shoes of someone who <strong>cannot perceive colors</strong> when interacting with a digital product.',
        'The website you will use is rendered entirely in black and white: you will discover <strong>what happens when information is conveyed only through color</strong> and telling tones apart becomes a barrier.',
        'The experience aims to help you spot the barriers that appear when design relies on a single sensory channel, and to reflect on why an accessible digital experience must be usable by everyone.',
        'That said, we will not deny we enjoy a bit of competition… <strong>At the end of the morning, whoever completes the experience in the shortest time will get a small gift</strong>. So enjoy, pay attention… and may the fastest win!',
      ],
    },
    missionIntro: {
      es: [
        'Tu misión es llegar de San Nicasio a Aeropuerto T4 <strong>en menos de 60 minutos</strong>: tienes que coger un vuelo y no puedes perderlo.',
        'La web de transportes te permite calcular el tiempo de un recorrido por <strong>tramos</strong>: cada tramo es un origen y un destino dentro de una misma línea de metro. Ve añadiendo tramos hasta completar la ruta y comprueba si llegas a tiempo — cualquier ruta de menos de 60 minutos vale.',
        'El tiempo se calcula por paradas: cada parada recorrida suma <strong>2 minutos</strong> al trayecto, y los transbordos entre líneas no añaden tiempo extra. En el ranking gana quien consiga el <strong>trayecto más corto</strong>; si hay empate en duración, gana quien lo haya completado antes.',
      ],
      en: [
        'Your mission is to get from San Nicasio to Aeropuerto T4 <strong>in under 60 minutes</strong>: you have a flight to catch and you cannot miss it.',
        'The transport website lets you compute a journey in <strong>legs</strong>: each leg is an origin and a destination on a single metro line. Add legs until the route is complete and check whether you make it on time — any route under 60 minutes counts.',
        'Time is counted per stop: each stop travelled adds <strong>2 minutes</strong> to the journey, and transfers between lines add no extra time. The ranking is won by the <strong>shortest journey</strong>; on a duration tie, whoever finished first wins.',
      ],
    },
    missionOutro: {
      es: [
        'Ten en cuenta el estado de la red: la <strong>línea 6 está interrumpida</strong>, la <strong>línea 4 tiene restricciones</strong> (sus metros tardan el triple de tiempo) y hay un <strong>corte en Alonso Martínez</strong>: no entran ni salen trenes en esa estación.',
        'Durante todo el recorrido estarás acompañado/a por nosotros, por lo que podrás pedir ayuda en cualquier momento. La idea es que puedas centrarte en la experiencia y en las dificultades que puedan aparecer durante el recorrido.',
      ],
      en: [
        'Mind the network status: <strong>line 6 is interrupted</strong>, <strong>line 4 is restricted</strong> (its trains take three times as long) and there is a <strong>cut at Alonso Martínez</strong>: no trains enter or leave that station.',
        'We will accompany you throughout the whole journey, so you can ask for help at any time. The idea is that you focus on the experience and on the difficulties that may appear along the way.',
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
        id: 'status',
        label: { es: 'Incidencias', en: 'Disruptions' },
        value: {
          es: 'Línea 6 interrumpida · Línea 4 con restricciones (los metros tardan el triple) · Alonso Martínez cortada (no entran ni salen trenes)',
          en: 'Line 6 interrupted · Line 4 restricted (trains take three times as long) · Alonso Martínez cut (no trains enter or leave)',
        },
      },
    ],
  },
  {
    id: 'comprehension',
    locked: true,
    homeRoute: '#/hospital',
    name: {
      es: 'Experiencia Comprensión',
      en: 'Comprehension experience',
    },
    welcome: {
      es: 'Bienvenido a la experiencia de comprensión.',
      en: 'Welcome to the comprehension experience.',
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
