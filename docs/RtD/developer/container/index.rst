.. include:: ../../global.rst

Running Containerised
=======================

.. _developer-container-app-manager:

|ap-nimbus-app-manager|
-----------------------

If you start |ap-nimbus-app-manager| using the conventional ``docker run`` command, e.g.
``docker run -it --rm -p 8080:8080 cardiacmodelling/ap-nimbus-app-manager:<version>``,
the instruction is to "publish" or "expose" the container ports (see 
`Publish or expose port (-p, --expose) <https://docs.docker.com/engine/reference/commandline/run/#publish-or-expose-port--p---expose>`_
for more information). |br|
What this does on an ``iptables``-based system is adjust the firewall such as :

::

  user@host:~> iptables -L -n --line-numbers -t nat

  :

  Chain POSTROUTING (policy ACCEPT)
  num  target     prot opt source               destination         
  1    MASQUERADE  all  --  10.254.93.0/24       0.0.0.0/0           
  2    POSTROUTING_direct  all  --  0.0.0.0/0            0.0.0.0/0           
  3    POSTROUTING_ZONES  all  --  0.0.0.0/0            0.0.0.0/0           
  4    MASQUERADE  tcp  --  10.254.93.2          10.254.93.2          tcp dpt:8080

  Chain DOCKER (2 references)
  num  target     prot opt source               destination         
  1    RETURN     all  --  0.0.0.0/0            0.0.0.0/0           
  2    DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:8080 to:10.254.93.2:8080

  :

.. _developer-container-client-direct:

|ap-nimbus-client-direct|
-------------------------

If you start |ap-nimbus-client-direct| using the conventional ``docker run`` command, e.g.
``docker run -it --rm -p 4200:4200 cardiacmodelling/ap-nimbus-client-direct:<version>``,
the instruction is to "publish" or "expose" the container ports (see 
`Publish or expose port (-p, --expose) <https://docs.docker.com/engine/reference/commandline/run/#publish-or-expose-port--p---expose>`_
for more information). |br|
What this does on an ``iptables``-based system is adjust the firewall such as :

::

  user@host:~> iptables -L -n --line-numbers -t nat

  :

  Chain POSTROUTING (policy ACCEPT)
  num  target     prot opt source               destination         
  1    MASQUERADE  all  --  10.254.93.0/24       0.0.0.0/0           
  2    POSTROUTING_direct  all  --  0.0.0.0/0            0.0.0.0/0           
  3    POSTROUTING_ZONES  all  --  0.0.0.0/0            0.0.0.0/0           
  4    MASQUERADE  tcp  --  10.254.93.2          10.254.93.2          tcp dpt:4200

  Chain DOCKER (2 references)
  num  target     prot opt source               destination         
  1    RETURN     all  --  0.0.0.0/0            0.0.0.0/0           
  2    DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:4200 to:10.254.93.2:4200

  :
