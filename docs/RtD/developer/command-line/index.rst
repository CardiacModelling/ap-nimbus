.. include:: ../../global.rst

Starting simulations via command line
=====================================

Alternative Mechanisms
----------------------

 #. Start |ap-nimbus-app-manager| and call its endpoint from the command line. |br|
    See :ref:`running-app-manager`.
 #. Run |appredict-with-emulators| or |appredict-no-emulators|. |br|
    See :ref:`running-appredict`.
 #. Start |ap-nimbus-app-manager| and a database as you normally would for |ap-nimbus-client-direct| (see
    :ref:`running-client-direct-prerequisites`), but rather than use the |client-direct| UI, instead invoke
    |ap-nimbus-client-direct| from the command line as below.

Invoking |ap-nimbus-client-direct| as a |CLI|
---------------------------------------------

Apart from using the web front-end in the form of :ref:`activity_client_direct`, |ap-nimbus-client-direct| also offers a command-line tool for
starting simulations. In order to call this tool, it needs a setup with Python, the same installed components as the web front-end
and access to the database (see :ref:`running-client-direct-prerequisites`). The most conveniant way to achieve this is to start a
docker component specifically for the purpose of starting simulations in command line. |br|
The example below starts a docker component and shows the various command line options available.

.. note:: Any path to PK data files is local to the docker component.

::

    sudo docker run -it \
                    --rm \
                    --net ap_nimbus_network \
                    -v ap_nimbus_file_upload:/opt/django/media \
                    --env-file env \
                    cardiacmodelling/ap-nimbus-client-direct:<version> \
                    python manage.py start_simulation -h

    usage: manage.py start_simulation [-h] [--model_year MODEL_YEAR] [--model_version MODEL_VERSION] [--notes NOTES] [--pacing_frequency PACING_FREQUENCY] [--maximum_pacing_time MAXIMUM_PACING_TIME] [--ion_current_type ION_CURRENT_TYPE] [--ion_units ION_UNITS] [--concentration_type PK_OR_CONCS]
                                      [--minimum_concentration MINIMUM_CONCENTRATION] [--maximum_concentration MAXIMUM_CONCENTRATION] [--intermediate_point_count INTERMEDIATE_POINT_COUNT] [--intermediate_point_log_scale INTERMEDIATE_POINT_LOG_SCALE] [--PK_data_file PK_DATA] [--concentration_point CONCENTRATION_POINT]
                                      [--current_inhibitory_concentration <current> concentration hill coefficient saturation level spread of uncertainty] [--version] [-v {0,1,2,3}] [--settings SETTINGS] [--pythonpath PYTHONPATH] [--traceback] [--no-color] [--force-color] [--skip-checks]
                                      title author_email model_name

    positional arguments:
      title                 Title to identify sumulations. Please note: use quotes if the title contains spaces or quotes.
      author_email          Email address of the author for which the simulation is run
      model_name            The name of the model to use. If the name is not unique, please also specify year and/or version. Please note: use quotes if the model name contains spaces or quotes.

    optional arguments:
      -h, --help            show this help message and exit
      --model_year MODEL_YEAR
                            The year for a specified model, to tell models with the same name apart e.g. 2020
      --model_version MODEL_VERSION
                            The model version, where a model has multiple versions e.g. CiPA-v1.0
      --notes NOTES         Textual notes for the simulation. Please note: use quotes if the notes contain spaces or quotes.
      --pacing_frequency PACING_FREQUENCY
                            (in Hz) Frequency of pacing (between 0.05 and 5).
      --maximum_pacing_time MAXIMUM_PACING_TIME
                            (in mins) Maximum pacing time (between 0 and 120).
      --ion_current_type ION_CURRENT_TYPE
                            Ion current type: (pIC50 or IC50)
      --ion_units ION_UNITS
                            Ion current units. (-log(M), M, µM, or nM)
      --concentration_type PK_OR_CONCS, --pk_or_concs PK_OR_CONCS
                            Concentration specification type. (compound_concentration_range, compound_concentration_points, or pharmacokinetics)
      --minimum_concentration MINIMUM_CONCENTRATION
                            (in µM) at least 0.
      --maximum_concentration MAXIMUM_CONCENTRATION
                            (in µM) > minimum_concentration.
      --intermediate_point_count INTERMEDIATE_POINT_COUNT
                            Count of plasma concentrations between the minimum and maximum (between 0 and 10).
      --intermediate_point_log_scale INTERMEDIATE_POINT_LOG_SCALE
                            Use log scale for intermediate points.
      --PK_data_file PK_DATA, --PK_data PK_DATA
                            File format: tab-seperated values (TSV). Encoding: UTF-8 Column 1 : Time (hours) Columns 2-31 : Concentrations (µM).
      --concentration_point CONCENTRATION_POINT
                            Specify compound concentrations points one by one. For example for points 0.1 and 0.2 specify as follows: --concentration_point 0.1 --concentration_point 0.2
      --current_inhibitory_concentration <current> concentration hill coefficient saturation level spread of uncertainty
                            Inhibitory concentrations, one by one e.g. --current_inhibitory_concentration INa 0.5 1 0 0
      --version             Show program's version number and exit.
      -v {0,1,2,3}, --verbosity {0,1,2,3}
                            Verbosity level; 0=minimal output, 1=normal output, 2=verbose output, 3=very verbose output
      --settings SETTINGS   The Python path to a settings module, e.g. "myproject.settings.main". If this isn't provided, the DJANGO_SETTINGS_MODULE environment variable will be used.
      --pythonpath PYTHONPATH
                            A directory to add to the Python path, e.g. "/home/djangoprojects/myproject".
      --traceback           Raise on CommandError exceptions.
      --no-color            Don't colorize the command output.
      --force-color         Force colorization of the command output.
      --skip-checks         Skip system checks.

