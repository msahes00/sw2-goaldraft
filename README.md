# sw2-GoalDraft
![Coverage](.github/badges/coverage.svg)

# Título del proyecto de aplicación web

Aplicación web basada en Deno, Oak, Vite y React que busca crear un lugar donde los fans del fútbol puedan demostrar sus conocimientos sobre el deporte compitiendo en ligas Fantasy, creando sus propios equipos en drafts y coleccionando a sus jugadores favoritos abriendo distintos tipos de sobres.

<!--
![Funcionamiento de la aplicación web](docs/overview.png)
-->


Un despliegue de la aplicación se puede encontrar en las siguientes direcciones:
* [http://sw2-project.ddns.net:3000/](http://sw2-project.ddns.net:3000/)
* [https://goaldraft.loca.lt/](https://goaldraft.loca.lt/)
  * Contraseña del tunnel: 35.223.234.183

> IMPORTANTE: ambos despliegues pueden no estar disponibles debido a diversos factores técnicos.
<!--
Credenciales para ambos despliegues:
* Administrador
  * Usuario: admin
  * Contraseña: admin
* Cliente:
  * Usuario: user
  * Contraseña: user
-->

## Tabla de contenidos

* [Introducción](#introducción)
  * [Tecnologías](#tecnologías)
* [Uso de la aplicación](#uso-de-la-aplicación)
  * [Estructura del proyecto](#estructura-del-proyecto)
  * [Instalación](#instalación)
  * [Configuración](#configuración)
  * [Ejecución](#ejecución)
  * [Desarrollo](#desarrollo)
* [Pruebas](#pruebas)
* [Despliegue](#despliegue)
* [Créditos](#créditos)

## Introducción

### Tecnologías

Este proyecto ha sido desarrollado utilizando:

* [Deno](https://deno.land/) - Runtime para JavaScript y TypeScript
* [Oak](https://oakserver.org/) - Framework API y web
* [Vite](https://vite.dev/) - Herramienta de construcción frontend
* [React](https://react.dev/) - Biblioteca de JavaScript para construir interfaces de usuario


## Uso de la aplicación

### Estructura del proyecto

```
.
├── .devcontainer/                  # Configuración de Codespaces y Dev Containers
├── .vscode/                        # Configuración de Visual Studio Code
├── .github/                        # Configuración de Github Actions
│   ├── badges/                     # Directorio para almacenar insignias de cobertura
│   │   └── *.svg
│   ├── scripts/
│   │   └── generate-badge.ts       # Script de ayuda para generar insignias de cobertura
│   └── workflows/
│       ├── build.yml               # Workflow para el desplieque con Docker
│       └── ci.yml                  # Workflow de tests para cada commit
├── backend/                        # Backend de la aplicación                
│   ├── controllers/                # Controladores
│   │   └── *.ts                    
│   ├── middlewares/                # Middlewares de la aplicación
│   │   └── *.ts                    
│   ├── models/                     # Modelos de datos
│   │   └── *.ts                    
│   ├── routes/                     # Rutas de la aplicación
│   │   └── *.ts                    
│   └── app.ts                      # Punto de entrada del backend
├── frontend/                       # Frontend de le aplicación
│   ├── public/                     # Archivos de acceso publico (manifiestos, iconos...)
│   │   └── *
│   ├── src/                        
│   │   ├── styles/                 # Directorio para almacenar los estilos css especificos
│   │   │   └── *.css
│   │   ├── assets/                 # Archivos estáticos (imágenes, SVGs, tipografias)
│   │   │   └── *
│   │   ├── components/             # Directorio para almacenar componentes reutilizables
│   │   │   └── *.tsx
│   │   ├── views/                  # Directorio para almacenar las distintas paginas
│   │   │   └── *.tsx
│   │   └── App.tsx                 # Vista principal de la aplicacion
│   ├── index.tsx                   # Punto de entrada para el frontend
│   ├── index.css                   # Estilos globales de la aplicacion
│   └── index.html
├── .gitignore                      # Archivos que no se van a subir al repositorio
├── .dockerignore                   # Archivos que no se van a utillizar en Docker
├── example.env                     # Archivo de ejemplo de configuracion de desplieque
├── docker-compose.yml              # Archivo de despliegue en Docker
├── Dockerfile                      # Archivo de construcción de imagen en Docker
├── vite.config.ts                  # Configuración de Vite
├── deno.lock                       # Configuración de Deno
└── deno.json                       # Configuración de Deno
```


### Instalación

Clonar o descargar este repositorio y ejecutar desde el directorio raíz el siguiente comando para instalar las dependencias:

```bash
$ deno install
```

Antes de desplegar la aplicación, es necesario generar el frontend.  
Este proceso se realiza de manera automática cada vez que se arranca la aplicación.  
No obstante, se puede generar el frontend manualmente con el siguiente comando:

```bash
$ deno run build
```

### Configuración

Para configurar la aplicación web, existen dos versiones: la version de producción y la version de desarrollo.  
Ambas versiones de la configuración se realizan a traves del fichero `.env` que se encuentra en el directorio raíz.  
Para la version de desarrollo basta con configurar las siguientes variables:

```bash
# Las credenciales para la base de datos
DB_NAME = "db"
DB_USER = "admin"
DB_PASS = "admin"
DB_PORT = 3306
DB_HOST = "127.0.0.1"

# El puerto en el que la aplicación estará escuchando
PORT = 3000
```

Para la version de producción, se proporciona un archivo `example.env` de ejemplo, con todas las variables necesarias para su correcto funcionamiento.  


### Ejecución

Para ejecutar la aplicación web, ejecutar el siguiente comando desde el directorio raíz:

```bash
# NOTA: de manera similar a la tarea dev, serve actualiza los cambios en directo (tanto frontend como backend).
$ deno run serve
```

> IMPORTANTE: [Véase despliegue](#despliegue)

### Desarrollo

Existen otras dos tareas adicionales para facilitar las labores de desarrollo. Estas son las siguientes:
```bash
# Para revertir el proceso de compilación de la aplicación
# NOTA: Solo funciona en entornos *nix
$ deno run clean

# Para ejecutar la aplicación, pudiendo ver los cambios en tiempo real
# NOTA: solo funciona para el frontend
$ deno run dev
```


## Pruebas

La aplicación incluye tests que permiten comprobar el correcto funcionamiento de la aplicación.  
Para ejecutarlos se debe ejecutar el siguiente comando desde el directorio raíz:

```bash
$ deno test
```

## Despliegue

La aplicación contiene los archivos necesarios para desplegar la aplicación en docker.  
La configuración de despliegue contiene una base de datos integrada y una interfaz web que permite interactuar con la base de datos.  
Para realizar el despliegue, basta con utilizar el siguiente comando:

```bash
$ docker-compose up -d
```

Para detener el despliegue, se debe ejecutar el siguiente comando:

```bash
$ docker-compose down
```

> Dependiendo de la instalación de Docker, el comando `docker-compose` puede ser sustituido por `docker compose`.


## Créditos

Este proyecto ha sido desarrollado por:

* Miguel Sahelices Sarmiento
* Daniel Alejandro Greciano Antón
* Guzmán Salas Flórez
* Francisco Carrera Martínez
