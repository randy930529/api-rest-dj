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
    "profile": "Profile"
    }

Licensias
---------

**License**

.. code-block:: JSON

    {
    "days": "number",
    "max_profiles": "number",
    "active": "boolean",
    "import": "number"
    }

Perfil para una persona contratada
----------------------------------

.. note::

   Gestiona los perfiles para una persona contratada agregando o eliminando una entidad **ProfileHiredPerson**.

**ProfileHiredPerson**

.. code-block:: JSON

    {
    "date_start": "string",
    "date_end": "string",
    "import": "number",
    "profile": "Profile",
    "hiredPerson": "HiredPerson"
    }

Licensias para usuario
----------------------

.. note::

   Gestiona las licensia para una usuario determinado agregando o eliminando una entidad **LicenseUser**.

**LicenseUser**

.. code-block:: JSON

    {
    "user": "User",
    "license": "License",
    "active": "boolean"
    }

Periodo fiscal
--------------

**FiscalYear**

.. code-block:: JSON

    {
    "year": "number",
    "general_scheme"?: "boolean",
    "profile": "Profile"
    }

Elemento de gastos
------------------

**ExpenseElement**

.. code-block:: JSON

    {
    "description": "string",
    "type": "string",
    "profile": "Profile"
    }

Documento de soporte
--------------------

**SupportDocument**

.. code-block:: JSON

    {
    "description": "string",
    "document"?: "string",
    "amount": "number",
    "date": "string",
    "type_document": "string",
    "is_bank": "boolean";
    "expenseElement": "ExpenseElement",
    "fiscalYear": "FiscalYear"
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
    "haber": "number";
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

Impuesto
--------

**Tax**

.. code-block:: JSON

    {
    "description": "string",
    "code"?: "string",
    "active"?: "boolean"
    }

Impuesto pagado
---------------

**TaxPaid**

.. code-block:: JSON

    {
    "import": "number",
    "date": "Date",
    "profile": "Profile",
    "tax": "Tax"
    }