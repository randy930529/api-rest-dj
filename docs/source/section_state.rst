Estado de sección
=================

Gestiona el estado de la sección
--------------------------------

Utilíce esta entidad para el control del estado de los elementos dentro de la  sección.

.. note:: 

    Un usuario solo tendrá una instancia de esta entidad para almacenar datos de estado (perfil actual, año fiscal actual). Solo los usuarios con rol de administrador pueden listar todas las instancias de secciones guardadas en la base de datos y eliminar alguna de ella, los usuarios normales solo pueden gestionar el estado de la sección que les pertenece.

**Default URL**: ``POST`` ``/section/``

**Default URL**: ``GET`` ``/sections/``

**Default URL**: ``GET`` ``/section/:id``

**Default URL**: ``PUT`` ``/section/``

**Default URL**: ``PATCH`` ``/section/``

**Default URL**: ``DELETE`` ``/section/``

+----------+-----------------------------------+------------------------------------+
| Method   |  Request                          | Response                           |
+==========+===================================+====================================+
| ``POST`` | ``Section.FIELDS``                | ``HTTP_201_CREATED``               |
| ``GET``  | ``Section.FIELD``                 | ``HTTP_200_OK``                    |
| ``PUT``  |                                   |                                    |
| ``PATCH``| * ``Bearer``                      |                                    |
|          | * ``token``                       | * ``status: "success"``            |
|          |                                   | * ``error: null``                  |
|          |                                   | * ``data:``                        |
|          |                                   |       ``Section.FIELDS,``          |
|          |                                   |                                    |
|          |                                   | ``HTTP_409_CONFLICT``              |
|          |                                   | ``HTTP_500_INTERNAL_SERVER_ERROR`` |
|          |                                   |                                    |
|          |                                   | * ``status: "fail"``               |
|          |                                   | * ``error: { message }``           |
|          |                                   | * ``data: null``                   |
|          |                                   |                                    |
+----------+-----------------------------------+------------------------------------+
