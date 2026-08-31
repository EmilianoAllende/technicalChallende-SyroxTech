# Explicación de Funcionalidades Principales - Proyecto ASTRA

Este documento tiene como objetivo servirte de guía durante tu presentación. Detalla las funcionalidades clave que se implementaron recientemente, los archivos involucrados y la lógica principal detrás de cada uno.

---

## 1. Integración de Pagos con Stripe (Checkout Sessions & Webhooks)

**Objetivo:** Permitir a los usuarios realizar pagos de forma segura sin que nuestra plataforma almacene datos sensibles de tarjetas de crédito.

### ¿Cómo funciona?
1. Cuando el usuario hace clic en "Comprar", el frontend envía los productos al backend.
2. El backend crea la venta con estado **Pendiente** y genera una "Sesión de Checkout" en los servidores de Stripe.
3. Se devuelve una URL segura de Stripe al frontend, y el navegador redirige al usuario allí.
4. El usuario paga en Stripe. Una vez concretado, Stripe redirige al usuario de vuelta a nuestra tienda (`/cart?success=true`).
5. Por detrás, Stripe envía un aviso invisible (Webhook) a nuestro backend avisando que el pago fue exitoso, y nuestro backend cambia el estado de la venta a **Pagado**.

### Archivos involucrados:

- **`frontend/src/app/(store)/cart/page.tsx`**
  - **Función principal:** `handleCheckout`.
  - **Explicación:** Se conecta a `/sales` enviando el detalle del carrito. Si la respuesta incluye un `url`, redirige directamente la ventana (`window.location.href = res.data.url`). Además, incluye un `useEffect` que detecta si la URL actual tiene `?success=true` para vaciar el carrito local y mostrar el mensaje de éxito.

- **`backend/src/payments/payments.service.ts`**
  - **Función principal:** `createCheckoutSession` y `handleWebhook`.
  - **Explicación:** 
    - `createCheckoutSession`: Instancia el SDK de Stripe y crea una orden en los servidores de Stripe pasando el detalle de los productos y sus precios (multiplicados por 100 porque Stripe usa centavos). *Nota: Aquí programamos el Modo Simulación en caso de usar la clave falsa "sk_test_123".*
    - `handleWebhook`: Escucha los eventos asíncronos de Stripe. Si recibe `checkout.session.completed`, usa `PrismaService` para buscar la venta por ID y cambiar su estado a "Pagado".

- **`backend/src/sales/sales.controller.ts`**
  - **Función principal:** `create`
  - **Explicación:** Fue modificado para inyectar el `PaymentsService`. Primero llama a `salesService.create` para guardar la orden, y luego a `paymentsService.createCheckoutSession` para obtener el link, retornando ambas cosas.

---

## 2. Imágenes de Productos Dinámicas (vía URL)

**Objetivo:** Mostrar los productos de una manera más atractiva en el catálogo y el carrito.

### ¿Cómo funciona?
Agregamos un nuevo campo opcional `imageUrl` a la tabla `Product` en la base de datos (PostgreSQL vía Prisma). Al crear o editar un producto desde el panel de administrador, el usuario puede pegar un link de internet.

### Archivos involucrados:

- **`backend/prisma/schema.prisma`**
  - **Explicación:** Se añadió la columna `imageUrl String?` al modelo `Product`. Luego se ejecutó `npx prisma db push` para sincronizar este cambio en la base de datos en la nube.

- **`frontend/src/app/(store)/products/page.tsx`**
  - **Explicación:** Se añadió el campo "URL de Imagen" al formulario de creación/edición. En la tabla principal (GenericTable), modificamos las columnas para renderizar un pequeño *thumbnail* (miniatura) usando la etiqueta `<img>` si la URL existe, o un cuadro gris con "S/I" (Sin Imagen) si no.

- **`frontend/src/components/shared/CartProvider.tsx`**
  - **Explicación:** Actualizamos la interfaz `CartItem` de TypeScript para que acepte el atributo `imageUrl`, de modo que cuando el usuario agregue el producto al carrito, la foto "viaje" con el producto hacia el `localStorage`.

---

## 3. Seguridad de Roles de Usuario y Panel Administrativo

**Objetivo:** Evitar accidentes críticos (como que el SuperAdmin se quite permisos a sí mismo) y restringir áreas de configuración solo a los empleados.

### ¿Cómo funciona?
La lógica se ejecuta puramente en el Frontend utilizando el objeto `user` guardado en el `localStorage` al momento de iniciar sesión.

### Archivos involucrados:

- **`frontend/src/components/shared/Sidebar.tsx`**
  - **Explicación:** Modificamos el renderizado de la barra lateral. Si el rol es `USER` o invitado, directamente **ocultamos** los botones de "Categorías", "Marcas", y "Usuarios". Esto se logra leyendo `user.role` y renderizando los *links* de forma condicional.

- **`frontend/src/app/(store)/users/page.tsx`**
  - **Explicación:** Implementamos un mecanismo de protección en el formulario de edición de usuarios. Comparamos el ID del usuario que se está editando (`formData.id`) con el ID del usuario actualmente logueado (`currentUserId`). Si son el mismo, le deshabilitamos el selector `disabled={true}` para que no pueda cambiar su propio nivel de acceso.

---

## 4. Filtrado Dinámico por Categorías

**Objetivo:** Permitir que los clientes de la tienda filtren la lista de productos visualmente sin necesidad de usar barras de búsqueda manuales.

### ¿Cómo funciona?
Al entrar al catálogo público, el frontend descarga la lista de categorías y las dibuja como "chips" o botones redondos encima de los productos. Al hacer clic en una, filtra la cuadrícula al instante.

### Archivos involucrados:

- **`frontend/src/app/(store)/page.tsx`**
  - **Explicación:** Agregamos el estado `selectedCategory`. Añadimos una barra superior que hace `.map()` sobre todas las categorías obtenidas del backend. Al renderizar la cuadrícula de productos, aplicamos un `.filter()` secundario: si hay una categoría seleccionada, solo mostramos los productos cuyo `categoryId` coincida con la selección. De lo contrario, se muestran todos.

---

**Tip para la presentación:** Puedes usar este archivo como guía (o tenerlo abierto en una segunda pantalla) para argumentar por qué tomaste ciertas decisiones técnicas (como delegar la carga de imágenes a URLs de internet en lugar de saturar el backend subiendo archivos binarios). ¡Mucho éxito!
