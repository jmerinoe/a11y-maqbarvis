// registry.js — metadata for all 17 accessibility traps
//
// Each trap entry:
//   id          — unique trap identifier (TR-XX)
//   screen      — screen where the trap appears
//   wcag        — WCAG 2.1 Success Criterion reference
//   description — { es, en } failure description
//   fix         — corrected HTML snippet (language-neutral code)
//   selector    — CSS selector to locate the trapped element

export const traps = [
  // --- Home ---
  {
    id: 'TR-01',
    screen: 'home',
    wcag: 'SC 2.4.1 Bypass Blocks',
    description: {
      es: 'No existe un enlace "Saltar al contenido". El usuario debe tabular por toda la cabecera y navegación antes de llegar al contenido principal.',
      en: 'No "skip to content" link exists. The user must tab through the entire header and navigation before reaching main content.',
    },
    fix: '<a href="#main-content" class="skip-link">Skip to content</a>',
    selector: '[data-trap="TR-01"]',
  },
  {
    id: 'TR-02',
    screen: 'home',
    wcag: 'SC 1.1.1 Non-text Content',
    description: {
      es: 'El logo es una imagen sin atributo alt. El lector de pantalla anuncia "imagen" sin transmitir que es el logo de Faro.',
      en: 'The logo is an image without an alt attribute. The screen reader announces "image" without conveying it is the Faro logo.',
    },
    fix: '<img src="logo.png" alt="Faro — Home" />',
    selector: '[data-trap="TR-02"]',
  },
  // --- Search ---
  {
    id: 'TR-04',
    screen: 'home',
    wcag: 'SC 4.1.2 Name, Role, Value',
    description: {
      es: 'El botón de búsqueda es un <div> con onclick. No tiene role de botón ni nombre accesible, y no se puede activar con Enter o Espacio.',
      en: 'The search button is a <div> with onclick. It has no button role or accessible name, and cannot be activated with Enter or Space.',
    },
    fix: '<button type="submit" aria-label="Search">🔍</button>',
    selector: '[data-trap="TR-04"]',
  },
  {
    id: 'TR-05',
    screen: 'home',
    wcag: 'SC 1.3.1 Info and Relationships / SC 3.3.2 Labels or Instructions',
    description: {
      es: 'El campo de búsqueda solo tiene placeholder, sin <label> asociado. El lector de pantalla no anuncia un nombre significativo para el campo.',
      en: 'The search field has only a placeholder, no associated <label>. The screen reader does not announce a meaningful name for the field.',
    },
    fix: '<label for="search-input">Search products</label>\n<input id="search-input" type="text" placeholder="Search..." />',
    selector: '[data-trap="TR-05"]',
  },

  // --- Product listing ---
  {
    id: 'TR-06',
    screen: 'products',
    wcag: 'SC 1.3.1 Info and Relationships / SC 3.3.2 Labels or Instructions',
    description: {
      es: 'Los filtros son checkboxes sin <label> asociada. El lector de pantalla anuncia "casilla de verificación" sin indicar qué filtro es.',
      en: 'Filters are checkboxes without an associated <label>. The screen reader announces "checkbox" without indicating which filter it is.',
    },
    fix: '<input type="checkbox" id="filter-size-m" />\n<label for="filter-size-m">Size M</label>',
    selector: '[data-trap="TR-06"]',
  },
  {
    id: 'TR-07',
    screen: 'products',
    wcag: 'SC 2.4.4 Link Purpose (In Context)',
    description: {
      es: 'Todas las tarjetas de producto tienen un enlace "Comprar" idéntico. El lector de pantalla lee "Comprar" repetido sin saber a qué producto corresponde cada uno.',
      en: 'All product cards have an identical "Buy" link. The screen reader reads "Buy" repeatedly without knowing which product each refers to.',
    },
    fix: '<a href="#/product/p001">Buy — Blue t-shirt</a>',
    selector: '[data-trap="TR-07"]',
  },
  {
    id: 'TR-08',
    screen: 'products',
    wcag: 'SC 1.3.2 Meaningful Sequence / SC 2.4.3 Focus Order',
    description: {
      es: 'El orden de tabulación está roto por valores tabindex positivos. El foco salta ilógicamente por la página en lugar de seguir el orden visual.',
      en: 'Tab order is broken by positive tabindex values. Focus jumps illogically across the page instead of following visual order.',
    },
    fix: '<!-- Remove positive tabindex; let DOM order define tab sequence -->',
    selector: '[data-trap="TR-08"]',
  },

  // --- Product detail ---
  {
    id: 'TR-09',
    screen: 'product-detail',
    wcag: 'SC 4.1.2 Name, Role, Value',
    description: {
      es: 'El selector de talla es un widget personalizado con <div> y onclick, sin role ni nombre accesible. El lector de pantalla no lo anuncia como control ni permite seleccionar una talla.',
      en: 'The size selector is a custom widget with <div> and onclick, no role or accessible name. The screen reader does not announce it as a control or allow selecting a size.',
    },
    fix: '<fieldset>\n  <legend>Size</legend>\n  <label><input type="radio" name="size" value="M" /> M</label>\n</fieldset>',
    selector: '[data-trap="TR-09"]',
  },
  {
    id: 'TR-10',
    screen: 'product-detail',
    wcag: 'SC 1.3.1 Info and Relationships',
    description: {
      es: 'El precio está en una región del DOM separada del nombre del producto. El lector de pantalla los lee desconectados: el usuario no puede asociar el precio con el producto.',
      en: 'The price is in a separate DOM region from the product name. The screen reader reads them disconnected: the user cannot associate the price with the product.',
    },
    fix: '<article>\n  <h1>Blue t-shirt</h1>\n  <p class="price">€19.99</p>\n</article>',
    selector: '[data-trap="TR-10"]',
  },

  // --- Cart ---
  {
    id: 'TR-12',
    screen: 'cart',
    wcag: 'SC 2.4.3 Focus Order',
    description: {
      es: 'El carrito se abre como un modal sin gestión de foco. El foco no se mueve al modal ni se atrapa dentro: el usuario no puede entrar ni salir de forma predecible.',
      en: 'The cart opens as a modal with no focus management. Focus is not moved to the modal or trapped inside: the user cannot enter or exit predictably.',
    },
    fix: '<div role="dialog" aria-modal="true" aria-label="Cart">\n  <!-- Move focus to dialog on open; trap focus; return focus on close -->\n</div>',
    selector: '[data-trap="TR-12"]',
  },
  {
    id: 'TR-13',
    screen: 'cart',
    wcag: 'SC 1.1.1 Non-text Content / SC 4.1.2 Name, Role, Value',
    description: {
      es: 'El botón de eliminar es solo un icono sin texto ni aria-label. El lector de pantalla anuncia "botón" a secas: el usuario no sabe que elimina un producto.',
      en: 'The remove button is an icon-only button with no text or aria-label. The screen reader announces "button" alone: the user does not know it removes a product.',
    },
    fix: '<button aria-label="Remove Blue t-shirt from cart">🗑</button>',
    selector: '[data-trap="TR-13"]',
  },
  {
    id: 'TR-14',
    screen: 'cart',
    wcag: 'SC 4.1.3 Status Messages',
    description: {
      es: 'Al cambiar la cantidad del carrito, el nuevo total no se anuncia. El usuario cambia la cantidad pero nunca escucha el total actualizado.',
      en: 'When changing the cart quantity, the new total is not announced. The user changes the quantity but never hears the updated total.',
    },
    fix: '<p role="status" aria-live="polite">Total: €39.98</p>',
    selector: '[data-trap="TR-14"]',
  },

  // --- Checkout ---
  {
    id: 'TR-15',
    screen: 'checkout',
    wcag: 'SC 1.4.1 Use of Color',
    description: {
      es: 'Los errores de validación se indican solo con un borde rojo. Los usuarios con lector de pantalla o daltonismo no pueden percibir el error.',
      en: 'Validation errors are indicated only by a red border. Screen reader or colorblind users cannot perceive the error.',
    },
    fix: '<input class="error" aria-invalid="true" />\n<span class="error-text">This field is required</span>',
    selector: '[data-trap="TR-15"]',
  },
  {
    id: 'TR-16',
    screen: 'checkout',
    wcag: 'SC 1.3.1 Info and Relationships / SC 3.3.2 Labels or Instructions',
    description: {
      es: 'Los campos del formulario no tienen <label>, solo placeholder. El lector de pantalla anuncia los campos sin un nombre significativo.',
      en: 'Form fields have no <label>, only placeholder. The screen reader announces fields without a meaningful name.',
    },
    fix: '<label for="checkout-name">Full name</label>\n<input id="checkout-name" type="text" />',
    selector: '[data-trap="TR-16"]',
  },
  {
    id: 'TR-17',
    screen: 'checkout',
    wcag: 'SC 3.3.1 Error Identification / SC 4.1.3 Status Messages',
    description: {
      es: 'El mensaje de error no está asociado al campo con aria-describedby. El lector de pantalla anuncia que hay un error pero no a qué campo pertenece.',
      en: 'The error message is not associated with the field via aria-describedby. The screen reader announces an error exists but not which field it belongs to.',
    },
    fix: '<input aria-describedby="name-error" aria-invalid="true" />\n<span id="name-error">This field is required</span>',
    selector: '[data-trap="TR-17"]',
  },
  {
    id: 'TR-18',
    screen: 'checkout',
    wcag: 'SC 2.4.3 Focus Order / SC 3.3.1 Error Identification',
    description: {
      es: 'Tras validar con errores, el foco no se mueve al primer campo inválido. El usuario envía el formulario, recibe errores, pero el foco se queda en el botón de envío.',
      en: 'After validating with errors, focus is not moved to the first invalid field. The user submits the form, gets errors, but focus stays on the submit button.',
    },
    fix: '// On validation failure:\nfirstInvalidField.focus();',
    selector: '[data-trap="TR-18"]',
  },

  // --- Confirmation ---
  {
    id: 'TR-19',
    screen: 'confirmation',
    wcag: 'SC 4.1.3 Status Messages',
    description: {
      es: 'El mensaje "Pedido confirmado" no tiene role="status". El lector de pantalla no lo anuncia: el usuario no sabe que el pedido se completó.',
      en: 'The "Order confirmed" message has no role="status". The screen reader does not announce it: the user does not know the order was completed.',
    },
    fix: '<p role="status">Order confirmed! Thank you for your purchase.</p>',
    selector: '[data-trap="TR-19"]',
  },
];

export function getTrapById(id) {
  return traps.find((t) => t.id === id);
}

export function getTrapsForScreen(screenName) {
  return traps.filter((t) => t.screen === screenName);
}
