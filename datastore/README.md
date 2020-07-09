# Action Potential prediction -- Intermediary datastore.

`AP-Nimbus`'s `datastore` "REST" API endpoint to a database.  
It's used to (very nearly <sup>1</sup>) avoid direct `client-direct` <==> `app-manager`
communication. The idea being that it allows each component to scale independently of the others.

Documentation is available at https://ap-nimbus.readthedocs.io/.

[1] The only communication between `client-direct` and `app-manager` is when `client-direct` sends
    an instruction to `app-manager` to run a simulation, and `app-manager` responds with an
    identifier. Thereafter all communication is via data being sent to and retrieved from
    the `datastore` using the identifier.