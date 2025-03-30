# Documentación del Proyecto

Este proyecto es un **Marketplace** desarrollado con **NestJS** que integra funcionalidades para la gestión de usuarios, productos y la comunicación con el servicio de pagos **Wompi**. La aplicación utiliza **TypeORM** para la persistencia de datos, **bcrypt** para la encriptación de contraseñas y **Swagger** para la documentación de la API. Además, se cuenta con un conjunto de pruebas unitarias utilizando **Jest** para asegurar el correcto funcionamiento de cada módulo.

---

## Tabla de Contenidos

- [Instalación](#instalación)
- [Uso](#uso)
  - [Ejecución de la Aplicación](#ejecución-de-la-aplicación)
  - [Documentación de la API (Swagger)](#documentación-de-la-api-swagger)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints](#endpoints)
  - [Productos](#productos)
  - [Usuarios](#usuarios)
  - [Wompi](#wompi)
- [Configuración y Despliegue](#configuración-y-despliegue)
- [Pruebas Unitarias](#pruebas-unitarias)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## Instalación

1. **Clonar el repositorio:**

   ```bash
   git clone [https://github.com/jpbuelvas/backend-marketplace](https://github.com/jpbuelvas/backend-marketplace)
   cd backend-marketplace
2. **Instalar dependencias:**  
  npm install
3. **Configurar variables de entorno:**  
Crea un archivo .env en la raíz del proyecto con el siguiente contenido (ajusta los valores según tu entorno):
  # Configuración de la Base de Datos (Postgres)
  - DB_HOST=localhost
  - DB_PORT=5432
  - DB_USER=postgres
  - DB_PASS=123
  - DB_NAME=postgres

  # Configuración de Wompi
  - WOMPI_INTEGRITY_SECRET=
  - WOMPI_PRIVATE_KEY=

  # Configuración del Backend para el guardado de archivos
  BASE_URL=http://localhost:3000

  # Configuración de JWT
  - JWT_SECRET=
  - JWT_EXPIRATION=1h
  - JWT_REFRESH_SECRET=
  - JWT_REFRESH_EXPIRATION=

## Uso
  Ejecución de la Aplicación
  Para iniciar la aplicación en modo desarrollo, ejecuta:
  npm run start:dev
  La aplicación estará disponible en http://localhost:3000 (o el puerto configurado).
  Documentación de la API (Swagger)
  La documentación interactiva de la API se encuentra disponible en:
  [text](http://localhost:3000/api-docs#/) o Puedes visualizar la disponible en [text](https://backend-marketplace-production.up.railway.app/api-docs#/)
  Desde allí podrás explorar y probar cada uno de los endpoints definidos.

## Estructura del Proyecto
```
  src/
  ├── products/
  │   ├── product.controller.spec.ts
  │   ├── product.controller.ts
  │   ├── product.service.spec.ts
  │   ├── product.service.ts
  │   └── product.module.ts
  ├── users/
  │   ├── dto/
  │   │   └── create-user.dto.ts
  │   ├── user.controller.spec.ts
  │   ├── user.controller.ts
  │   ├── user.service.spec.ts
  │   ├── user.service.ts
  │   └── user.module.ts
  ├── wompi/
  │   ├── dto/
  │   │   └── wompi.dto.ts
  │   ├── wompi.controller.spec.ts
  │   ├── wompi.controller.ts
  │   ├── wompi.service.spec.ts
  │   ├── wompi.service.ts
  │   └── wompi.module.ts
  ├── app.controller.ts
  ├── app.service.ts
  ├── app.module.ts
  ```
  
Además, en la raíz del proyecto se encuentran archivos de configuración como .eslintrcjs, .prettierrc, jest.config.js, nest-cli.json, tsconfig.build.json, tsconfig.json, así como los archivos de dependencias (package.json, package-lock.json).
## Endpoints
Los endpoints para productos se definen en product.controller.ts. Algunos ejemplos (los tuyos pueden variar según la implementación):
- GET /products
Obtiene la lista de productos.

- POST /products/create-with-image
Crea un nuevo producto con imagen.

- PATCH /products/{id}
Actualiza un producto existente.

- DELETE /products/{id}
Elimina un producto por su ID.
## Usuarios
Los endpoints para usuarios se definen en user.controller.ts. Algunos ejemplos:

POST /user/register

Descripción: Registra un nuevo usuario en la aplicación.

Cuerpo de la solicitud: Objeto JSON conforme al DTO CreateUserDto que incluye:

  - email: Correo electrónico válido.

  - fullname: Se requiere en formato email debido al decorador @IsEmail (puedes ajustar esto si prefieres un nombre real).

  - password: Contraseña con un mínimo de 6 caracteres.

  - confirmPassword: Confirmación de la contraseña.

  - role: Rol del usuario (valor válido del enum UserRole).

  Respuesta: Retorna un mensaje confirmando el registro y el userId del usuario creado:
  {
  "message": "Usuario registrado correctamente",
  "userId": "abc123"
  }

## Wompi

  Los endpoints para Wompi se definen en wompi.controller.ts. Algunos ejemplos:

  - GET /wompi/transaction-status

    - Descripción: Consulta el estado de una transacción a través de Wompi.

    - Parámetros: Se espera un query parameter con la propiedad id del DTO TransactionIdDTO.

    - Respuesta: Retorna el estado de la transacción (por ejemplo, { status: 'APPROVED' }).

  - POST /wompi/integrity-signature

   - Descripción: Genera la firma de integridad utilizando los parámetros recibidos.

   - Cuerpo de la solicitud: Objeto JSON conforme al DTO IntegritySignatureDTO que incluye reference, amountInCents y currency.

   - Respuesta: Retorna la firma generada (por ejemplo, { signature: 'signatureValue' }).

##  Configuración y Despliegue
  La aplicación utiliza el módulo de configuración de NestJS para gestionar variables de entorno y fue desplegada en Railway. La base de datos es Postgres y su manejo se realizó con TypeORM.
  Asegúrate de tener un archivo .env con las configuraciones necesarias para:

  - Conexión a la base de datos.
  - Integración con el servicio de Wompi.
  - Otros parámetros que requiera la aplicación.

## Pruebas Unitarias
El proyecto utiliza Jest para la ejecución de pruebas unitarias. Se han creado test suites para:

- UserController y UserService: Validan el proceso de registro de usuarios y la lógica de negocio asociada.

- WompiController y WompiService: Verifican el correcto funcionamiento de los endpoints y la lógica de negocio para la integración con Wompi.

- ProductController y ProductService (según la implementación de productos).

- CreateUserDto: Comprueba la validación de datos mediante class-validator.

Para ejecutar las pruebas, utiliza el siguiente comando:


npm run test
El resultado esperado se verá similar a:


Test Suites: X passed, X total
Tests:       XX passed, XX total
Snapshots:   0 total
Time:        X s
Cada test suite y sus pruebas individuales se han comentado en el código para facilitar su mantenimiento y comprensión.

## Tecnologías Utilizadas

- NestJS: Framework para construir aplicaciones Node.js escalables y eficientes.

- TypeORM: ORM para la interacción con bases de datos relacionales.

- Postgres: Base de datos utilizada para el almacenamiento de datos.

- bcrypt: Para el hash de contraseñas.

- Jest: Framework de pruebas unitarias.

- Swagger: Para la documentación interactiva de la API.

- class-validator: Para la validación de datos en los DTOs.

- Railway: Plataforma utilizada para desplegar el backend y la base de datos.



## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
