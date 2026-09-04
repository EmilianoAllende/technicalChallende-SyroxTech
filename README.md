# ASTRA - Plataforma E-Commerce & Admin Panel

ASTRA es una plataforma de comercio electrónico dinámica y moderna con una interfaz de administración completa. Este proyecto incluye un backend desarrollado en NestJS y un frontend en Next.js, utilizando bases de datos PostgreSQL para garantizar alta escalabilidad y un rendimiento óptimo.

## 🚀 Características Principales

- **Tienda Pública (Storefront):**
  - Catálogo de productos accesible para visitantes no registrados.
  - Carrito de compras persistente a nivel local (`localStorage`) que preserva la selección incluso después de iniciar sesión.
  - Interfaz de validación de pago que exige inicio de sesión para concretar ventas, resguardando la integridad del carrito.
  - Historial de compras personalizado ("Mis Compras") con seguimiento de fechas, número de orden y desglose de unidades.

- **Gestión Completa de Catálogo (CRUD):**
  - **Categorías:** Filtro dinámico en el catálogo principal mediante botones (chips). Panel de administración exclusivo para gestionar categorías y marcas, reservado únicamente para roles de administrador.
  - **Productos:** Gestión de artículos del inventario con atributos expandidos como nombre, precio, marca, género e integración de **imágenes por URL**, ofreciendo una experiencia premium en el catálogo y carrito.

- **Gestión de Ventas e Inventario:**
  - **Control de Stock Atómico:** Validación estricta del inventario mediante transacciones de base de datos (`$transaction`). Impide ventas fantasma reservando el stock exacto en milisegundos.
  - Registro de ventas detallado, conectando a los usuarios con las ventas y guardando cada artículo vendido mediante el modelo `SaleItem`.
  - Visualización del listado completo de pedidos, órdenes e ingresos generados.
  - **Edición Manual de Ventas:** Los administradores pueden abrir el detalle de cualquier orden y actualizar manualmente los estados financieros (Pendiente, Pagado, Rechazado) y los logísticos (En Preparación, Enviado, Completado).
  - **Panel de Estadísticas (Dashboard):** Vista gráfica en tiempo real (con librería *Recharts*) para monitorear el flujo de dinero, ingresos netos y la distribución física de la logística.
  - **Feature Flags (Configuración Dinámica):** La plataforma permite encender o apagar sistemas complejos mediante variables de entorno (`ENABLE_STOCK_MANAGEMENT`, `ENABLE_PAYMENT_GATEWAYS`). Si se configuran en `false`, el sistema se comporta como un CRUD puro simplificado, adaptándose a los requerimientos base de pruebas técnicas sin sacrificar escalabilidad.

- **Sistema de Autenticación y Control de Acceso Basado en Roles (RBAC):**
  - Cuentas de usuario protegidas por encriptación fuerte (`bcrypt`).
  - Registro de cuentas nativo e inicio de sesión con correo y contraseña.
  - Integración de Inicio de Sesión y Registro con **Google OAuth (SSO)** para un acceso rápido y seguro.
  - Roles definidos: `USER`, `ADMIN` y `SUPERADMIN`.
  - Diferenciación de accesos en la interfaz:
    - **Visitantes (Guest) / `USER`**: Solo acceden al catálogo público, a su carrito de compras y a su historial de ventas personal.
    - **`ADMIN` y `SUPERADMIN`**: Acceden a la vista de "Estadísticas" y a la gestión del inventario global y todas las ventas.
  - **Gestión de Perfil de Usuario (Cuenta):** Panel dedicado donde cada usuario administra su información personal (Nombres, Fecha de Nacimiento, Avatar y Nombre de Usuario dinámico).
  - Panel exclusivo de administración de credenciales y cuentas de usuario para el `SUPERADMIN`, con poder para crear nuevos súper-usuarios. Además, cuenta con un bloqueo de seguridad que impide que el superadministrador activo degrade su propio rol por accidente.
  - Mecanismo seguro de auto-eliminación de cuentas ubicado en la "Zona de Peligro" de la sección de Cuenta, protegido con retrasos modales para prevención de accidentes.

- **Integración de Pagos (Stripe y MercadoPago):**
  - Implementación de Checkout Sessions (Stripe) y Checkout Pro (MercadoPago) para múltiples métodos de pago seguros.
  - Sincronización asíncrona de estado de ventas mediante Webhooks (IPN) para ambas pasarelas.
  - "Modo Simulación" programado para entornos de demostración y pruebas locales.

- **Diseño Moderno y Responsivo:**
  - Tema Oscuro (Dark Mode) y Claro, adaptando automáticamente los logos de la marca.
  - Componentes de interfaz de usuario de alta calidad utilizando Shadcn UI y TailwindCSS, enfocados en microinteracciones agradables y diseño premium.

## 🛠 Tecnologías Utilizadas

### Frontend
- **Framework:** Next.js (React) - App Router
- **Estilos:** TailwindCSS, Shadcn UI
- **Temas:** `next-themes` (Soporte nativo para Dark Mode)
- **Iconografía:** Lucide React
- **Peticiones HTTP:** Axios

### Backend
- **Framework:** NestJS
- **Base de Datos:** PostgreSQL (Alojado en Supabase)
- **ORM:** Prisma
- **Pagos:** Stripe SDK (Integración con Checkout Sessions y Webhooks)
- **Seguridad:** Encriptación de contraseñas con bcrypt

## 📂 Estructura del Proyecto

El proyecto está diseñado como un **Monorepo** y se compone de dos carpetas principales:

- `/frontend`: Contiene la aplicación web Next.js orientada tanto a los administradores como a la visualización de los clientes (Storefront).
- `/backend`: Contiene la API REST desarrollada en NestJS que sirve toda la lógica de negocios e interactúa con la base de datos PostgreSQL.

## ⚙️ Requisitos y Configuración Local

1. Instalar dependencias en ambas carpetas (`npm install`).
2. Configurar variables de entorno `.env` en el backend (URL de Supabase/PostgreSQL y claves secretas).
3. Configurar variables de entorno `.env.local` en el frontend si es necesario para el acceso a la API (Ej: `NEXT_PUBLIC_API_URL=http://localhost:3001`).
4. Sincronizar esquema y generar datos de prueba en el backend: `npx prisma db push` y luego `npx prisma db seed` (esto creará 3 usuarios predeterminados de cada rol, 4 categorías y 12 productos).
5. Iniciar ambos servidores con `npm run start:dev` (Backend) y `npm run dev` (Frontend).
