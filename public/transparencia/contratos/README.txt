Portal de Transparencia — Carpeta de contratos publicados
==========================================================

Esta carpeta almacena los PDF reales de los contratos de colaboración
gratuita publicados en el Portal de Transparencia.

Ubicación pública servida por Next.js:

  /transparencia/contratos/<nombre-del-archivo>.pdf

Cómo publicar un nuevo contrato (proceso manual):

  1. Colocar el archivo PDF en esta carpeta.
     Nombre recomendado en kebab-case sin acentos ni espacios:
     nombre-del-contrato.pdf

  2. Abrir src/content/transparencia/contratos.ts y añadir una entrada al
     arreglo contratosTransparencia con la forma:

       {
         fecha: "YYYY-MM-DD",
         colaboracion: "Nombre de la entidad colaboradora",
         tipo: "Identidad visual",
         documento: "/transparencia/contratos/nombre-del-contrato.pdf",
         estado: "Publicado",
       }

  3. Guardar y reconstruir el sitio. La tabla del Portal de Transparencia
     mostrará la nueva fila con el enlace "Ver contrato".

No subir contratos ficticios. No subir documentos con datos personales que
no deban ser públicos. Cuando un acuerdo contenga información sensible,
publicar una versión preparada para consulta pública.
