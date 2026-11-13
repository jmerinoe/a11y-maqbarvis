// registry.js — metadata for all 10 accessibility traps
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

  // --- Product detail ---
  {
    id: 'TR-09',
    screen: 'product-detail',
    wcag: 'SC 4.1.2 Name, Role, Value',
    description: {
      es: 'El selector de variantes ya es un grupo de radios ARIA (role="radio" + aria-checked) con <fieldset>/<legend>, pero la talla M mantiene el widget roto: un <div> con onclick, sin role ni nombre accesible. Es focuseable (tabindex) y seleccionable con Enter/Espacio, pero el lector la anuncia como un clickable genérico: no se identifica como opción del grupo.',
      en: 'The variant selector is now a proper ARIA radio group (role="radio" + aria-checked) with <fieldset>/<legend>, but the M size keeps the broken widget: a <div> with onclick, no role or accessible name. It is focusable (tabindex) and selectable via Enter/Space, but the screen reader announces it as a generic clickable: it is not identified as an option in the group.',
    },
    fix: '<fieldset>\n  <legend>Size</legend>\n  <div role="radiogroup" aria-label="Size">\n    <div role="radio" aria-checked="false" tabindex="0">M</div>\n  </div>\n</fieldset>',
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
