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