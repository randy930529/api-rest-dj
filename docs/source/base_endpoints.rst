Endpoints Bases
===============

Crear usuario
-------------

Utilícese este endpoint para registrar al nuevo usuario. Su controlador de entidades de usuario debe implementar el metodo `register` y requiere los campos ``email``, ``password`` y ``re_password``.

**Default URL**: ``/register/``

+----------+-----------------------------------+------------------------------------+
| Method   |  Request                          | Response                           |
+==========+===================================+====================================+
| ``POST`` | * ``{``                           | ``HTTP_201_CREATED``               |
|          | * `` email``                      |                                    |
|          | * `` password``                   | * ``status: "success"``            |
|          | * `` repeatPassword``             | * ``error: null``                  |
|          | * ``}``                           | * ``data:`` ``{``                  |
|          |                                   |              ``User.FIELDS,``      |
|          |                                   |              ``confirUrl,  ``      |
|          |                                   |              ``token       ``      |
|          |                                   |             ``}``                  |
|          |                                   | ```json                            |
|          |                                   |    {}                              |
|          |                                   | ```                                |
|          |                                   |                                    |
|          |                                   | ``HTTP_409_CONFLICT``              |
|          |                                   | ``HTTP_500_INTERNAL_SERVER_ERROR`` |
|          |                                   |                                    |
|          |                                   | * ``status: "fail"``               |
|          |                                   | * ``error: { message }``           |
|          |                                   | * ``data: null``                   |
|          |                                   |                                    |
+----------+-----------------------------------+------------------------------------+

Activar Usuario
---------------

Utiliza este endpoint para activar la cuenta de usuario. Este endpoint no es una URL que estará expuesto directamente a sus usuarios - usted debe proporcionar un sitio en su aplicación frontend (configurada por ACTIVATION_URL) que enviará una solicitud POST a este endpoint para activar. Se enviará la información del usuario en un token mediante la cabecera HTTP Authorization utilizando un `Authentication schemes <https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes>`_.

**Default URL**: ``/user/activation/``

+----------+--------------------------------------+------------------------------------+
| Method   | Request                              | Response                           |
+==========+======================================+====================================+
| ``POST`` | * ``Bearer``                         | ``HTTP_200_OK``                    |
|          | * ``token``                          |                                    |
|          |                                      | * ``message``                      |
|          |                                      |                                    |
|          |                                      |                                    |
|          |                                      | ``HTTP_500_INTERNAL_SERVER_ERROR`` |
|          |                                      |                                    |
|          |                                      | * ``status: "fail"``               |
|          |                                      | * ``error: { message }``           |
|          |                                      | * ``data: null``                   |
|          |                                      |                                    |
+----------+--------------------------------------+------------------------------------+

Reenvió de E-mail de activación de usuario
------------------------------------------

Utilícese este endpoint para volver a enviar el correo electrónico de activación. 
.. Tenga en cuenta que ningún correo electrónico ser enviado si el usuario ya está activo.

**Default URL**: ``/user/resend_activation/``

+----------+-----------------------------------+------------------------------------+
| Method   | Request                           | Response                           |
+==========+===================================+====================================+
| ``POST`` | * ``{ User.EMAIL_FIELD }``        | ``HTTP_201_CREATED``               |
|          |                                   |                                    |
|          |                                   | * ``status: "success"``            |
|          |                                   | * ``error: null``                  |
|          |                                   | * ``data: {                        |
|          |                                   |              ``User.FIELDS,``      |
|          |                                   |              ``confirUrl,``        |
|          |                                   |              ``token``             |
|          |                                   |    ``         }``                  |
|          |                                   |                                    |
|          |                                   | ``HTTP_409_CONFLICT``              |
|          |                                   | ``HTTP_500_INTERNAL_SERVER_ERROR`` |
|          |                                   |                                    |
|          |                                   | * ``status: "fail"``               |
|          |                                   | * ``error: { message }``           |
|          |                                   | * ``data: null``                   |
|          |                                   |                                    |
+----------+-----------------------------------+------------------------------------+

Usuario
-------

Utilice este endpoint para recuperar/actualizar al usuario autenticado.

**Default URL**: ``/user/me/``

+----------+--------------------------------+------------------------------------+
| Method   |           Request              |           Response                 |
+==========+================================+====================================+
| ``GET``  | * ``Bearer``                   | ``HTTP_200_OK``                    |
|          | * ``token``                    |                                    |
|          |                                | * ``status: "success"``            |
|          |                                | * ``error: null``                  |
|          |                                | * ``data: {                        |
|          |                                |              ``User.FIELDS,``      |
|          |                                |              ``confirUrl,``        |
|          |                                |              ``token``             |
|          |                                |    ``         }``                  |
|          |                                |                                    |
|          |                                |                                    |
|          |                                | ``HTTP_500_INTERNAL_SERVER_ERROR`` |
|          |                                |                                    |
|          |                                | * ``status: "fail"``               |
|          |                                | * ``error: { message }``           |
|          |                                | * ``data: null``                   |
|          |                                |                                    |
+----------+--------------------------------+------------------------------------+
| ``PUT``  | * ``Bearer``                   | ``HTTP_200_OK``                    |
|          | * ``token``                    |                                    |
|          | * ``User.FIELDS``              |                                    |
|          |                                |                                    |
|          |                                | ``HTTP_500_INTERNAL_SERVER_ERROR`` |
|          |                                |                                    |
|          |                                | * ``status: "fail"``               |
|          |                                | * ``error: { message }``           |
|          |                                | * ``data: null``                   |
|          |                                |                                    |
+----------+--------------------------------+------------------------------------+
| ``PATCH``| * ``Bearer``                   | ``HTTP_200_OK``                    |
|          | * ``token``                    |                                    |
|          | * ``User.FIELDS``              |                                    |
|          |                                |                                    |
|          |                                | ``HTTP_500_INTERNAL_SERVER_ERROR`` |
|          |                                |                                    |
|          |                                | * ``status: "fail"``               |
|          |                                | * ``error: { message }``           |
|          |                                | * ``data: null``                   |
|          |                                |                                    |
+----------+--------------------------------+------------------------------------+

Eliminar Usuario
----------------

Utilice este endpoint para eliminar el usuario autenticado.Se enviará la información del usuario loguedo en un token mediante la cabecera HTTP Authorization utilizando un `Authentication schemes <https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes>`_.

**Default URL**: ``/user/<:uid>/``

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

Cambiar Contraseña
------------------

Utile este endpoint para cambiar la contraseña de usuario.

**Default URL**: ``/user/set_password/``

+----------+------------------------+-------------------------------------------+
| Method   | Request                | Response                                  |
+==========+========================+===========================================+
| ``POST`` | * ``Bearer``           | ``HTTP_400_BAD_REQUEST``                  |
|          | * ``token``            |                                           |
|          | * ``{``                |                                           |
|          | * `` password``        |                                           |
|          | * `` newPassword``     |                                           |
|          | * ``}``                |                                           |
|          |                        | ``HTTP_409_CONFLICT``                     |
|          |                        | ``HTTP_401_UNAUTHORIZED``                 |
|          |                        |                                           |
|          |                        | * ``status: "fail"``                      |
|          |                        | * ``error: { message }``                  |
|          |                        | * ``data: null``                          |
|          |                        |                                           |
+----------+------------------------+-------------------------------------------+

Restableser Contraseña
----------------------

Utilre este punto final para enviar correo electrónico al usuario con enlace de restablecimiento de contraseña.

**Default URL**: ``/user/reset_password/``

+----------+---------------------------------+------------------------------+
| Method   | Request                         | Response                     |
+==========+=================================+==============================+
| ``POST`` | * ``{ User.EMAIL_FIELD }``      | ``HTTP_204_NO_CONTENT``      |
|          |                                 |                              |
|          |                                 | ``HTTP_409_CONFLICT``        |
|          |                                 |                              |
|          |                                 | * ``status: "fail"``         |
|          |                                 | * ``error: { message }``     |
|          |                                 | * ``data: null``             |
+----------+---------------------------------+------------------------------+

Confirmar Restableser Contraseña
--------------------------------

Utilícese este punto final para el restablecimiento de la contraseña del usuario.

**Default URL**: ``/user/reset_password_confirm/``

+----------+----------------------------------+--------------------------------------+
| Method   | Request                          | Response                             |
+==========+==================================+======================================+
| ``POST`` |  * ``Bearer``                    | ``HTTP_204_NO_CONTENT``              |
|          |  * ``token``                     |                                      |
|          | * ``{``                          |                                      |
|          | * `` password``                  |                                      |
|          | * `` newPassword``               |                                      |
|          | * ``}``                          | ``HTTP_401_UNAUTHORIZED``            |
|          |                                  | ``HTTP_500_INTERNAL_SERVER_ERROR``   |
|          |                                  |                                      |
|          |                                  | * ``status: "fail"``                 |
|          |                                  | * ``error: { message }``             |
|          |                                  | * ``data: null``                     |
+----------+----------------------------------+--------------------------------------+

Refresh JWT
-----------

Utilícese este punto final para refrescar JWT.

**Default URL**: ``/refresh/token/``

+----------+---------------------------------+------------------------------------+
| Method   |           Request               |           Response                 |
+==========+=================================+====================================+
| ``POST`` | * ``token``                     | ``HTTP_200_OK``                    |
|          | * ``refreshToken``              |                                    |
|          |                                 | * ``status: "success"``            |
|          |                                 | * ``error: null``                  |
|          |                                 | * ``data: {                        |
|          |                                 |              User.FIELD,           |
|          |                                 |              token,                |
|          |                                 |              refreshToken          |
|          |                                 |             }                      |
|          |                                 |    ``                              |
|          |                                 |                                    |
|          |                                 | ``HTTP_500_INTERNAL_SERVER_ERROR`` |
|          |                                 |                                    |
|          |                                 | * ``status: "fail"``               |
|          |                                 | * ``error: { message }``           |
|          |                                 | * ``data: null``                   |
+----------+---------------------------------+------------------------------------+
