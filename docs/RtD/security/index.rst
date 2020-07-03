.. include:: ../global.rst

Security
========

With the exception of running the containers in a |kubernetes| environment, whereby there
are |kubernetes|' |RBAC| controls, there are currently no security controls in place in
any of the containers, i.e. no |RBAC|, no |Authn|, no |Authz|, no |HTTPS|.

All simulation results are stored in `browser memory <https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API>`_
until manually deleted, so can potentially be seen by all users of a shared computer.
