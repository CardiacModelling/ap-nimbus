.. include:: ../../global.rst

Further Information
===================

.. _further-info-durable-functions:

Azure Durable Functions
-----------------------

The following were based on observations as at March 9th 2020.

 * Based on `Allow selecting disk type when creating AKS cluster <https://feedback.azure.com/forums/914020-azure-kubernetes-service-aks/suggestions/35056588-allow-selecting-disk-type-when-creating-aks-cluste>`_
   it appears that the default policy which can't be overridden is to use expensive disk.
   I want to use cheap storage for proof-of-concept, not premium |SSD|!!! |br|
   ``az disk list``

 * I want to test my stuff on Linux but when investigating the use of
   `Async HTTP APIs <https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview?tabs=javascript#async-http>`_
   I discover that it's not possible because as of March 2020 it's impossible to fully emulate core elements of Azure Storage (e.g. blob, file, queue and table). |br|
   The nearest option is `Azurite <https://github.com/Azure/Azurite>`_
   which, in version 3, `does not offer Azure Tables emulation <https://github.com/Azure/azure-functions-core-tools/issues/1247>`_
   (e.g. ``docker run -p 10000:10000 -p 10001:10001 mcr.microsoft.com/azure-storage/azurite``)
   because it doesn't listen for Table Storage on port 10002. Ironically it did in
   `version 2 <https://github.com/Azure/azurite/tree/legacy-master>`_, i.e.
   ``docker run -d -t -p 10000:10000 -p 10001:10001 -p 10002:10002 -v /path/to/folder:/opt/azurite/folder arafato/azurite``,
   however when I tried to use it it failed -- perhaps because Azure Functions arrived after version 2. |br|
   Microsoft does kindly provide a `storage emulator <https://hub.docker.com/r/microsoft/azure-storage-emulator/>`_,
   but unkindly it only runs on Windows. |br|
   ``az storage account list``

