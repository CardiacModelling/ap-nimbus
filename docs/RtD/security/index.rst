.. include:: ../global.rst

Security
========

With the exception of running the containers in a |kubernetes| environment, whereby there
are |kubernetes|' |RBAC| controls, there are currently no security controls in place in
any of the containers, i.e. no |RBAC|, no |Authn|, no |Authz|, no |HTTPS|. The exception to this is however the re-developed client-direct.
|br|

client-direct makes use of built-in security measures of Django, in terms of accounts, logging-in and Cross site scripting, SQL injection, and Clickjacking protections. It is important that client-direct is provided with a strong secret key that is kep private. This can be done using the `DJANGO_SECRET_KEY` environment variable see :ref:`installation-client-direct`. |br|
**Please Note:** The docker component is not set-up to use https however. Therefore it is strongly recommended that a webserver such as apache or nginx using HTTPS is used to proxy external requests to the client-direct component.|br|
**Please Note:** Due to the lack of security features it is NOT recommended to expose the app-manager over the internet.

|br|
All simulation results are stored in `browser memory <https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API>`_
until manually deleted, so can potentially be seen by all users of a shared computer.
