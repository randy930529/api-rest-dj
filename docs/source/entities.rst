Entidades
=========

Descripción de definiciones de las entidades.

Perfil
------

**Profile**

.. code-block:: JSON

    {
    "nombre": "string",
    "last_name": "string",
    "ci": "string",
    "nit": "string",
    "address": "string"
    }

Persona contratada
------------------

**HiredPerson**

.. code-block:: JSON

    {
    "name": "string",
    "last_name": "string",
    "ci": "string",
    "profile": "Profile",
    "address": "Address"
    }

Licensias
---------

**License**

.. code-block:: JSON

    {
    "name": "string",
    "days": "number",
    "max_profiles": "number",
    "active": "boolean", //opcional
    "public": "boolean", //opcional
    "import": "number"
    }

Perfil para una persona contratada
----------------------------------

.. note::

   Gestiona los perfiles para una persona contratada agregando o eliminando una entidad **ProfileHiredPerson**.

**ProfileHiredPerson**

.. code-block:: JSON

    {
    "date_start": "Date",
    "date_end": "Date",
    "import": "number",
    "profile": "Profile",
    "hiredPerson": "HiredPerson"
    }

Licensias para usuario
----------------------

.. note::

   Gestiona las licensia para un usuario determinado agregando o eliminando una entidad **LicenseUser**.

**LicenseUser**

.. code-block:: JSON

    {
    "user": "User",
    "license": "License",
    "tmbill": "TMBill",
    "licenseKey": "string", //opcional
    "is_paid": "boolean", //opcional
    "expirationDate": "date", //opcional
    }

Periodo fiscal
--------------

**FiscalYear**

.. code-block:: JSON

    {
    "year": "number",
    "date": "Date",
    "general_scheme": "boolean", //opcional
    "profile": "Profile"
    }

Elemento de gastos o ingresos
-----------------------------

**Element**

.. code-block:: JSON

    {
    "description": "string",
    "type": "string",
    "profile": "Profile",
    "active": "boolean", //opcional
    "is_general": "boolean", //opcional
    "profile": "Profile", //opcional
    "account": "Account"
    }

Documento de soporte
--------------------

**SupportDocument**

.. code-block:: JSON

    {
    "description": "string",
    "document": "string", //opcional
    "amount": "number",
    "date": "Date",
    "type_document": "string",
    "is_bank": "boolean", //opcional
    "element": "Element",
    "fiscalYear": "FiscalYear",
    }

Comprobante
-----------

**Voucher**

.. code-block:: JSON

    {
    "number": "number",
    "date": "Date",
    "description": "string",
    "supportDocument": "SupportDocument"
    }

Detalles del comprobante
------------------------

**VoucherDetail**

.. code-block:: JSON

    {
    "debe": "number",
    "haber": "number",
    "voucher": "Voucher",
    "account": "Account"
    }

Cuenta
------

**Account**

.. code-block:: JSON

    {
    "code": "string",
    "description": "string",
    "moneda": "string",
    "profile": "Profile"
    }

Factura TranferMovil
--------------------

.. note::

   Entidad contratada de manera interna por el servidor api.

**TMBill**

.. code-block:: JSON

    {
    "import": "number",
    "currency": "string",
    "description": "string",
    "orderIdTM": "string",
    "bankId": "number",
    "bank": "string",
    "phone": "string",
    "refundId": "number",
    "referenceRefund": "number",
    "referenceRefundTM": "number",
    }

Estado de Factura TranferMovil
------------------------------

.. note::

   Entidad contratada de manera interna por el servidor api.

**StateTMBill**

.. code-block:: JSON

    {
    "success": "boolean", //opcional
    "description": "string",
    "tmBill": "TMBill",
    }