Endpoints CRUD
==============

Utilícese los siguientes endpoint para invocar los métodos del CRUD: ``create``, ``one``, ``update`` y ``delete``.

Crear
-----

Utilícese estos endpoint para gestionar los datos de los modelos de la base de datos.

**Default URL**: ``/profile/``

+----------+-----------------------------------+------------------------------------+
| Method   |  Request                          | Response                           |
+==========+===================================+====================================+
| ``POST`` | ``Entity.FIELDS``User.FIELDS      | ``HTTP_201_CREATED``               |
| ``GET``  | ``Entity.FIELD``                  | ``HTTP_200_OK``                    |
| ``PUT``  |                                   | ``HTTP_204_NO_CONTENT``            |
| ``PATCH``| * ``Bearer``                      |                                    |
|          | * ``token``                       | * ``status: "success"``            |
|          |                                   | * ``error: null``                  |
|          |                                   | * ``data:``                        |
|          |                                   |       ``User.FIELDS,``             |
|          |                                   |       ``confirUrl,``               |
|          |                                   |       ``token``                    |
|          |                                   |                                    |
|          |                                   | ``HTTP_409_CONFLICT``              |
|          |                                   | ``HTTP_500_INTERNAL_SERVER_ERROR`` |
|          |                                   |                                    |
|          |                                   | * ``status: "fail"``               |
|          |                                   | * ``error: { message }``           |
|          |                                   | * ``data: null``                   |
|          |                                   |                                    |
+----------+-----------------------------------+------------------------------------+

Eliminar
--------

Utilice este endpoint para eliminar la entidad deceada. Se enviará la información del usuario loguedo en un token mediante la cabecera HTTP Authorization utilizando un `Authentication schemes <https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes>`_.

**Default URL**: ``/profile/<:uid>/``
**Default URL**: ``/hired/person/<:uid>/``
**Default URL**: ``/profile/hired/person/<:uid>/``
**Default URL**: ``/license/<:uid>/``
**Default URL**: ``/license/user/<:uid>/``

+------------+---------------------------------+----------------------------------+
| Method     |  Request                        | Response                         |
+============+=================================+==================================+
| ``DELETE`` | * ``Bearer``                    | ``HTTP_204_NO_CONTENT``          |
|            | * ``token``                     |                                  |
|            |                                 | ``HTTP_400_BAD_REQUEST``         |
|            |                                 |                                  |
|            |                                 | * ``status: "fail"``             |
|            |                                 | * ``error: { message }``         |
|            |                                 | * ``data: null``                 |
|            |                                 |                                  |
+------------+---------------------------------+----------------------------------+

Entidades
---------

Descripción de las entidades que definen los modelos de la base de datos.

**Entidad**