.. include:: ../../global.rst

ap-nimbus-azure-durable-functions
=================================

This was a test activity to determine the viability of using
`Azure Durable Functions <https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview?tabs=javascript#async-http>`_
as a solution to enabling high-concurrency cardiac simulations.

Whereas with the orchestrated container option, e.g. |kubernetes|, which managed the
legacy |client-direct| (superceded by |ap-nimbus-client-direct|), |ap-nimbus-app-manager|
and legacy "ap-nimbus-datastore" container deployment and intercommunication
on an "always-on" basis, the Azure Durable Functions are supposed to rapidly spin up
and down containers "on demand".

For our purposes therefore we were only investigating the ability of Azure Durable
Functions to rapidly scale up and down |ap-nimbus-app-manager|. The expectation being
that by using the `Async HTTP API <https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview?tabs=javascript#async-http>`_
technique we would have an "always on" |HTTP| endpoint that listened to simulation
requests (e.g. as per `simulationInput.json <https://raw.githubusercontent.com/CardiacModelling/ap-nimbus/master/azure-durable-functions/durable-functions/example-2/simulationInput.json>`_)
and would spin up the corresponding number of |ap-nimbus-app-manager|\s and return
the generated results.

 * Azure Durable Functions is available in the ap-nimbus git repository via the ap-nimbus-azure-durable-functions submodule

Developers may be interested to read about some of the issues faced :

 * :ref:`further-info-durable-functions`.
