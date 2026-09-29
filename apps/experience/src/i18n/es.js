// es.js — Spanish string table

export const es = {
  // Header / nav
  'nav.home': 'Inicio',
  'nav.products': 'Productos',
  'nav.cart': 'Carrito',
  'lang.toggle': 'EN',

  // Home
  'home.title': 'Home',
  'home.hero.title': 'Faro — Moda que te guía',
  'home.hero.subtitle': 'Encuentra tu estilo',
  'home.featured': 'Productos destacados',
  'home.carousel.prev': 'Anterior',
  'home.carousel.next': 'Siguiente',

  // Search
  'search.placeholder': 'Buscar productos...',
  'search.button': 'Buscar',

  // Products listing
  'products.title': 'Productos',
  'products.filters': 'Filtros',
  'products.filters.size': 'Talla',
  'products.filters.color': 'Color',
  'products.noResults': 'No se encontraron productos',
  'products.buy': 'Comprar',
  'products.buyNamed': 'Comprar — {name}',
  'products.results': 'productos encontrados',

  // Product detail
  'detail.size': 'Talla',
  'detail.color': 'Color',
  'detail.price': 'Precio',
  'detail.addToCart': 'Añadir al carrito',
  'detail.back': 'Volver a productos',
  'detail.validationMissing': 'Selecciona {attrs} para añadir el producto al carrito.',
  'detail.addedToCart': '{name} añadido al carrito.',

  // Variant options
  'variant.size.one-size': 'Talla única',
  'variant.color.blue': 'Azul',
  'variant.color.black': 'Negro',
  'variant.color.white': 'Blanco',
  'variant.color.gray': 'Gris',
  'variant.color.green': 'Verde',
  'variant.color.red': 'Rojo',
  'variant.color.brown': 'Marrón',

  // Cart
  'cart.title': 'Carrito',
  'cart.empty': 'Tu carrito está vacío',
  'cart.product': 'Producto',
  'cart.quantity': 'Cantidad',
  'cart.price': 'Precio',
  'cart.total': 'Total',
  'cart.remove': 'Eliminar',
  'cart.checkout': 'Finalizar compra',
  'cart.close': 'Cerrar carrito',
  'cart.continueShopping': 'Seguir comprando',

  // Checkout
  'checkout.title': 'Datos y Pago',
  'checkout.fullName': 'Nombre completo',
  'checkout.email': 'Correo electrónico',
  'checkout.address': 'Dirección de envío',
  'checkout.cardNumber': 'Número de tarjeta',
  'checkout.cardExpiry': 'Fecha de caducidad (MM/AA)',
  'checkout.cardCvv': 'CVV',
  'checkout.submit': 'Realizar pedido',
  'checkout.error.required': 'Este campo es obligatorio',
  'checkout.error.email': 'Correo electrónico no válido',
  'checkout.error.card': 'Número de tarjeta no válido',

  // Confirmation
  'confirmation.title': 'Confirmación',
  'confirmation.message': '¡Pedido confirmado! Gracias por tu compra.',
  'confirmation.orderNumber': 'Número de pedido',
  'confirmation.total': 'Total pagado',
  'confirmation.backHome': 'Volver al inicio',

  // Moderator
  'moderator.badge': 'Modo moderador: ACTIVO',
  'moderator.wcag': 'WCAG',
  'moderator.fix': 'Solución',

  // Workshop session
  'session.pageTitle.login': 'A11y Experience Center - Login',
  'session.pageTitle.experiences': 'A11y Experience Center - Selección Experiencia',
  'session.pageTitle.instructions': 'A11y Experience Center - Lector Voz - Instrucciones',
  'session.username': 'Nombre de usuario',
  'session.continue': 'Continuar',
  'session.errorRequired': 'El nombre de usuario es obligatorio',
  'session.errorGeneric': 'No se ha podido completar el registro. Inténtalo de nuevo.',
  'session.errorDuplicate': 'Este nombre de usuario ya está registrado en esta experiencia. Introduce otro nombre.',

  // Experience
  'experience.selectTitle': 'Selecciona una experiencia',

  // Instructions
  'instructions.objectiveTitle': 'Objetivo',
  'instructions.missionTitle': 'Tu misión en esta experiencia',
  'instructions.productLabel': 'Producto',
  'instructions.sizeLabel': 'Talla',
  'instructions.cardLabel': 'Tarjeta',
  'instructions.copyCard': 'Copiar',
  'instructions.copyCardLabel': 'Copiar número de tarjeta',
  'instructions.copied': 'Número copiado',
  'instructions.copyError': 'No se pudo copiar',
  'instructions.continue': 'Continuar',
  'instructions.keysTitle': 'Teclas para navegar',
  'instructions.key.tab': 'Ir al elemento siguiente',
  'instructions.key.shiftTab': 'Volver al elemento anterior',
  'instructions.key.enter': 'Activar enlace o botón',
  'instructions.key.space': 'Marcar o activar una opción',
  'instructions.key.arrows': 'Moverse entre opciones de una lista',
  'instructions.key.spaceName': 'Espacio',

  // Session timer
  'timer.label': 'Tiempo de experiencia',

  // Congrats dialog
  'congrats.title': '¡Enhorabuena!',
  'congrats.message': 'Has completado correctamente la experiencia.',
  'congrats.time': 'Tiempo empleado',
  'congrats.prevTime': 'Tiempo anterior',
  'congrats.newTime': 'Tiempo segunda pasada',
  'congrats.diff': 'Diferencia',
  'congrats.close': 'Ver ranking',

  // Mission failed dialog
  'failed.title': 'Misión no completada',
  'failed.message': 'Has finalizado la compra, pero el pedido no cumple la misión: el producto, la talla, el color, o el carrito contenía más artículos.',
  'failed.hint': 'El tiempo sigue corriendo. Vuelve a empezar y repite la compra con el artículo correcto.',
  'failed.retry': 'Volver a empezar',

  // Ranking
  'ranking.title': 'Mejores tiempos',
  'ranking.position': 'Posición',
  'ranking.user': 'Usuario',
  'ranking.time': 'Tiempo',
  'ranking.empty': 'Todavía no hay tiempos registrados.',
  'experience.locked': 'En desarrollo — requiere PIN de administrador',
  'experience.pinPrompt': 'Esta experiencia está en desarrollo. Introduce el PIN de administrador:',
  'experience.pinSubmit': 'Acceder',
  'experience.pinCancel': 'Cancelar',
  'experience.pinDenied': 'PIN incorrecto',
  'experience.pinUnavailable': 'No se puede verificar el PIN ahora mismo. Inténtalo de nuevo.',

  'ranking.retry': 'Repetir misión y comprobar barreras',
  'ranking.newParticipant': 'Nuevo participante',
  'ranking.you': '— tu posición',

  // Chromatic experience — metro web
  'session.pageTitle.metro': 'A11y Experience Center - Experiencia Cromática',
  'session.pageTitle.metroDesign': 'A11y Experience Center - Diseñador de hotspots',
  'metroDesign.title': 'Diseñador de hotspots del plano',
  'metroDesign.inspector': 'Inspector',
  'metroDesign.name': 'Estación',
  'metroDesign.rename': 'Renombrar estación',
  'metroDesign.add': 'Nueva estación',
  'metroDesign.showTags': 'Mostrar nombres',
  'metroDesign.newName': 'Nueva estación',
  'metroDesign.delete': 'Eliminar {name}',
  'metroDesign.orphan': 'Este nombre no existe en el modelo de líneas.',
  'metroDesign.revert': 'Restaurar',
  'metroDesign.copy': 'Copiar JSON',
  'metroDesign.copied': '¡Copiado!',
  'metroDesign.download': 'Descargar .js',
  'metroDesign.integrate': 'Integrar cambios',
  'metroDesign.integrated': '¡Integrado! metro-map-data.js actualizado.',
  'metroDesign.integrateError': 'Integrar solo funciona con el servidor de desarrollo (npm run dev).',
  'metroDesign.hint': 'Arrastra una caja para moverla; su esquina para redimensionar. Flechas mueven, Mayús+flechas redimensiona.',
  'metro.title': 'Metro de Madrid — Estado de la red',
  'metro.mapTitle': 'Plano de la red',
  'metro.mapAlt': 'Plano oficial interactivo del metro de Madrid',
  'metro.legendTitle': 'Estado de las líneas',
  'metro.status.operative': 'Operativa',
  'metro.status.restricted': 'Restricciones (los metros tardan el triple)',
  'metro.status.interrupted': 'Interrumpida',
  'metro.hintOrigin': 'haz clic en la estación de origen del tramo',
  'metro.hintDest': 'origen: {station} — haz clic en la estación de destino',
  'metro.tramosTitle': 'Tu recorrido',
  'metro.removeTramo': 'Eliminar tramo {leg}',
  'metro.tramosEmpty': 'Todavía no has añadido ningún tramo.',
  'metro.total': 'Tiempo total',
  'metro.minutes': 'min',
  'metro.checkRoute': 'Comprobar ruta',
  'metro.zoomIn': 'Acercar plano',
  'metro.zoomOut': 'Alejar plano',
  'metro.dialog.ok': 'Entendido',
  'metro.dialog.sameLineTitle': 'Tramo no válido',
  'metro.dialog.sameLineMsg': 'Debes seleccionar tramos de la misma línea: origen y destino deben pertenecer a una única línea.',
  'metro.dialog.interruptedTitle': 'Línea interrumpida',
  'metro.dialog.interruptedMsg': 'Esta línea está interrumpida. No puedes añadir tramos que circulen por ella.',
  'metro.dialog.invalidTitle': 'Ruta incompleta',
  'metro.dialog.invalidMsg': 'La ruta no es válida: debe comenzar en San Nicasio, cada tramo debe continuar donde acabó el anterior, y debe terminar en Barajas.',
  'metro.dialog.fasterTitle': 'Hay rutas más rápidas',
  'metro.dialog.fasterMsg': 'Esta ruta llega a Barajas, pero existe una más rápida. Aún no has completado la misión: el tiempo sigue corriendo.',
  'metro.dialog.choiceTitle': 'Elige la línea',
  'metro.dialog.choiceMsg': 'El trayecto {from} → {to} puede hacerse por más de una línea. ¿Qué línea quieres usar?',
  'metro.dialog.cancel': 'Cancelar',

  // Panel branding
  'panel.logoAlt': 'Panel',
};
