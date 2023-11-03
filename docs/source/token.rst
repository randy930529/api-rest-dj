Token Endpoint
==============

Crear token
-----------

Utilice este endpoint para obtener el token de autenticación de usuario y un token de refresco.

**Default URL**: ``/login``

+----------+-----------------------------------+----------------------------------+
| Method   |  Request                          | Response                         |
+==========+===================================+==================================+
| ``POST`` | * ``{ User.USERNAME_FIELD }``     | ``HTTP_200_OK``                  |
|          | * ``password``                    |                                  |
|          |                                   | * ``status: "success"``          |
|          |                                   | * ``data:``                      |
|          |                                   |       ``token,``                 |
|          |                                   |       ``refreshToken,``          |
|          |                                   |                                  |
+----------+-----------------------------------+----------------------------------+
