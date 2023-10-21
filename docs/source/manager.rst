Endpoints CRUD
==============

Utilícese los siguientes endpoint para invocar los métodos del CRUD: ``create``, ``one``, ``update`` y ``delete``.

Entidad Métodos
---------------

Utilícese estos endpoint para gestionar los datos de los modelos de la base de datos.

.. note::

   Ejemplo de uso: En este primer ejemplo nos basamos en la entidad `Profile <https://api-rest-dj.readthedocs.io/es/latest/entities.html#Perfil>`_, para utilizar sus endpoint ( **URLs de las Entidades** ) remplasamos cada ``<Entity.route>`` por la ruta de la entidad correspondiente en la table **Rutas por entidad** para este caso tendriamos ``profile``: ( **Default URL Profile**: ``POST`` ``/profile/`` ). Para las Request ``Entity.FIELDS`` ver capítulo `Entidades <https://api-rest-dj.readthedocs.io/es/latest/entities.html>`_, para **Profile**, por tanto, tendremos que enviar en la request los campos: ``nombre``, ``last_name``, ``ci``, ``nit`` y ``address``.

**URLs de las Entidades**

**Default URL**: ``POST`` ``/<Entity.route>/``
**Default URL**: ``GET`` ``/<Entity.route>s/``
**Default URL**: ``GET`` ``/<Entity.route>/:id``
**Default URL**: ``PUT`` ``/<Entity.route>/``
**Default URL**: ``PATCH`` ``/<Entity.route>/``

Rutas por entidad
-----------------

+--------------------+----------------+--------------------+-----------------------------+---------------+--------------------+
| Default URL/Entity |  Profile       | HiredPerson        | ProfileHiredPerson          | License       | LicenseUser        |
+====================+================+====================+=============================+====================================+
| Entity route       | * ``profile``  | * ``hired/person`` | * ``profile/hired/persons`` | * ``license`` | * ``license/user`` |
|                    |                |                    |                             |               |                    |
+--------------------+----------------+--------------------+-----------------------------+---------------+--------------------+


+----------+-----------------------------------+------------------------------------+
| Method   |  Request                          | Response                           |
+==========+===================================+====================================+
| ``POST`` | ``Entity.FIELDS``                 | ``HTTP_201_CREATED``               |
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