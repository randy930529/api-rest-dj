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
| order        | * Orden de selección ``ASC`` ``DESC``.                                                               |
+--------------+---------------------------------------------------------------------------------------------------+
| skip         | * Paginado desde donde se deben tomar las entidades.                                              |
+--------------+---------------------------------------------------------------------------------------------------+
| take         | * Paginado máximo de entidades que se deben tomar.                                                |
|              |                                                                                                   |
+--------------+---------------------------------------------------------------------------------------------------+

Uso de las Opciones
-------------------

.. note::

    Para espesificar los parametros de consulta en las ``url`` utilice la sintaxis para formatos ``JSON``.

* ``relations`` - espesifique las relaciones.

.. code-block:: bash

    "relations":{"relacion1": true,"relacion2": true}

* ``where`` - indique las condiciones simples para la consulta.

.. code-block:: bash

    "where":{"firstName": "Carlos", "lastName": "Perez"}

* ``order`` - orden por propiedad en que se optienen los resultados.

.. code-block:: bash

    "order":{"name": "ASC", "id": "DESC"}

* ``skip`` - para paginar los resultados, valor desde donde se deben tomar las entidades.

.. code-block:: bash

    "skip":{"skip": number}
    "skip":{"skip": 5}

* ``take`` - para especificar el límite de elementos por paginado.

.. code-block:: bash

    "take":{"take": number}
    "take":{"take": 10,}
