# trabajo-grupal-integrador

## Actividad 1. Preparación del entorno

Se verificó que Node.js y npm están instalados. El backend se inicializó en `backend/` para mantener separadas las dependencias del servidor y las de la futura interfaz React.

### Comandos ejecutados

En PowerShell, desde la carpeta del proyecto:

```powershell
node --version
npm --version
Set-Location .\backend
npm init -y
npm install express
npm install mysql2 express dotenv
npm list --depth=0
```

### Evidencia

```text
node --version   -> v24.19.0
npm --version    -> 11.17.0

backend@1.0.0
+-- dotenv@18.0.8
+-- express@5.3.0
`-- mysql2@3.24.6
```

Las dos instalaciones de paquetes corresponden a los pasos solicitados: primero se agregó Express y después se instaló el conjunto de dependencias del servidor (`mysql2`, `express` y `dotenv`). npm conserva las versiones instaladas en `backend/package-lock.json`.

### Papel de `package.json`

`backend/package.json` es el manifiesto del proyecto Node.js. Identifica el paquete (nombre y versión), define metadatos y scripts, y enumera las dependencias que necesita el backend. Así, npm puede instalar las bibliotecas requeridas y otros integrantes pueden conocer y reproducir la configuración del proyecto. `backend/package-lock.json` registra el árbol y las versiones exactas resueltas para instalaciones reproducibles; `node_modules/` contiene los paquetes instalados y no se debe versionar.