Parámetros de Consulta
======================

Utilícese los parámetros de consulta para optimizar los resultados que obtienes en las ``JSON Response``. Opten exactamente los datos que necesitas en un punto de tu aplicación y minimiza el tamaño de la repuesta, utilizando la ``url``.

Opciones de búsquedas
---------------------

**Default URL Param**: ``<METHOD>`` ``...?options={"option":<Entity.options>,...}``

Opciones
--------

+--------------+---------------------------------------------------------------------------------------------------+
| Find Options | Description                                                                                       |
+==============+===================================================================================================+
| relations    | * Las relaciones deben cargarse con la entidad principal. También se pueden cargar subrelaciones  |
+--------------+---------------------------------------------------------------------------------------------------+
| where        | * Condiciones simples por las cuales se debe consultar a la entidad.                              |
+--------------+---------------------------------------------------------------------------------------------------+
| order        | * Selection order ``ASC`` ``DESC``.                                                               |
+--------------+---------------------------------------------------------------------------------------------------+
| skip         | * Paginado desde donde se deben tomar las entidades.                                              |
+--------------+---------------------------------------------------------------------------------------------------+
| take         | * Paginado máximo de entidades que se deben tomar.                                                |
|              |                                                                                                   |
+--------------+---------------------------------------------------------------------------------------------------+