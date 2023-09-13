Uso
=====

.. _installation:

Instalación
------------

API-REST for CA-MyGestor aplicación.

1. Ejecute el comando ``npm i``
2. Configure los ajustes de la base de datos dentro del archivo ``.env``
3. Ejecute el comando ``npm start``

.. Steps to run this project:

.. .. code-block:: console

..    (.venv) $ pip install lumache

.. Creating recipes
.. ----------------

.. To retrieve a list of random ingredients,
.. you can use the ``lumache.get_random_ingredients()`` function:

.. .. autofunction:: lumache.get_random_ingredients

.. The ``kind`` parameter should be either ``"meat"``, ``"fish"``,
.. or ``"veggies"``. Otherwise, :py:func:`lumache.get_random_ingredients`
.. will raise an exception.

.. .. autoexception:: lumache.InvalidKindError

.. For example:

.. >>> import lumache
.. >>> lumache.get_random_ingredients()
.. ['shells', 'gorgonzola', 'parsley']

