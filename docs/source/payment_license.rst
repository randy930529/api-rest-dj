Pago de Licencias
=================

Gestiona el pago de las Licencias
---------------------------------

.. note:: 

    Para un usuario optener una licencia se crea una instancia de la entidad **LicenseUser** que guarda la relación del usuario y la licencia comprada, luego el usuario debe iniciar el proceso de pago utilizando la plataforma de pagos online ``Tranfermovil`` para activar el uso de la licencia.

1. Crear licencia de usuario
----------------------------

Utilícese este endpoint para iniciar la compra de una licencia.

.. note:: 

    A considerar: Si todo ha ido bien ``(status=201)`` recibirá una respuesta en formato ``json``, debemos tener en cuenta que en la `data` ``data:{tmBill, licenseKey, UrlResponse}`` aparecerán los datos de la factura (request payOrder -> ``tmBill``) y una llave segura de la licencia (ExternalId -> ``licenseKey``) a cargar en apk  `Trasfermovil` junto con la url del api (UrlResponse -> ``UrlResponse``) donde recibes la respuesta del pago.

**Default URL**: ``/license/user/``

+----------+-----------------------------------+------------------------------------+
| Method   |  Request                          | Response                           |
+==========+===================================+====================================+
| ``POST`` | * ``{ User.ID_FIELD }``           | ``HTTP_201_CREATED``               |
|          | * ``{ License.ID_FIELD }``        |                                    |
|          |                                   | * ``status: "success"``            |
|          |                                   | * ``error: null``                  |
|          |                                   | * ``data:``                        |
|          |                                   |       ``License.FIELDS,``          |
|          |                                   |       ``UrlResponse``              |
|          |                                   |                                    |
|          |                                   | ``HTTP_500_INTERNAL_SERVER_ERROR`` |
|          |                                   |                                    |
|          |                                   | * ``status: "fail"``               |
|          |                                   | * ``error: { message }``           |
|          |                                   | * ``data: null``                   |
|          |                                   |                                    |
+----------+-----------------------------------+------------------------------------+

2. Confirmación de la orden de pago
-----------------------------------

Utilícese este endpoint obtener una confirmación del pago de una licencia y sus posterior activación para el usuario correspondiente.

.. note:: 

    El proceso de compra de licencia sierra cuando se obtenga un ``HTTP_200_OK`` enviando un sms al usuario por parte del apk `Tranfermovil` confirmando el éxito de la operación, y activando el pago, estado de factura y uso de la licencia.


**Default URL**: ``/license/payment/notification/``

+----------+-----------------------------------+------------------------------------+
| Method   |  Request                          | Response                           |
+==========+===================================+====================================+
| ``POST`` | * ``{ TM.REQUEST_FIELDS }``       | ``HTTP_200_OK``                    |
|          |                                   |                                    |
|          |                                   | * ``Success: "true"``              |
|          |                                   | * ``Resultmsg: ""``                |
|          |                                   | * ``Status: "1"``                  |
|          |                                   |                                    |
|          |                                   | ``HTTP_500_INTERNAL_SERVER_ERROR`` |
|          |                                   |                                    |
|          |                                   | * ``status: "fail"``               |
|          |                                   | * ``error: { message }``           |
|          |                                   | * ``data: null``                   |
|          |                                   |                                    |
+----------+-----------------------------------+------------------------------------+
