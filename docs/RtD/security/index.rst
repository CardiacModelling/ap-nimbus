.. include:: ../global.rst

Security
========

|client-direct| makes use of built-in security measures of Django, in terms of accounts, logging-in and Cross site scripting,
SQL injection, and Clickjacking protections.

It is important that |client-direct| is provided with a strong secret key that is kept private. This can be done using the
`DJANGO_SECRET_KEY` environment variable see :ref:`running-client-direct`.

.. note:: The docker component is not set-up to use https. Therefore it is strongly recommended that a webserver such
          as apache or nginx using https is used to proxy external requests to the |client-direct| component. |br| |br|
          Due to the lack of security features it is NOT recommended to expose the |app-manager| over the internet.

Shared Computers / Browser Memory
---------------------------------

All simulation results are stored in `browser memory <https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API>`_
until manually deleted, so can potentially be seen by all users of a shared computer.
