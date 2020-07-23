.. include:: ../../global.rst

.. _running-appredict:

Running |appredict-no-emulators| or |appredict-with-emulators|
==============================================================

.. seealso:: Offical ``docker run`` `documentation <https://docs.docker.com/engine/reference/commandline/run/>`_.

Without dynamic CellML (``--cellml``) or |PKPD| (``--pkpd-file``)
-----------------------------------------------------------------

::

   user@host:~/tmp> mkdir testoutput
   user@host:~/tmp> docker run --rm \
                               -u `id -u`:`id -g` \
                               -v `pwd`/testoutput:/home/appredict/apps/ApPredict/testoutput:Z \
                               -w /home/appredict/apps/ApPredict/ \
                               cardiacmodelling/appredict-no-emulators:<version> \
                               /home/appredict/apps/ApPredict/ApPredict.sh --model 1 --plasma-conc-high 100

.. seealso:: :ref:`sample-appredict-argument-input`

With dynamic CellML (``--cellml``) or |PKPD| (``--pkpd-file``)
--------------------------------------------------------------

For simplicity, the `annotated` [#f1]_ CellML file is called :file:`this.cellml`, the |PKPD| file is
called :file:`this.pkpd`, and both are in the directory where docker is being run.

::

   user@host:~/tmp> mkdir testoutput
   user@host:~/tmp> docker run --rm \
                               -u `id -u`:`id -g` \
                               -v `pwd`/testoutput:/home/appredict/apps/ApPredict/testoutput:Z \
                               -v `pwd`/this.cellml:/home/appredict/apps/ApPredict/this.cellml:ro \
                               -v `pwd`/this.pkpd:/home/appredict/apps/ApPredict/this.pkpd:ro \
                               -w /home/appredict/apps/ApPredict/ \
                               cardiacmodelling/appredict-no-emulators:<version> \
                               /home/appredict/apps/ApPredict/ApPredict.sh --cellml this.cellml --pkpd-file this.pkpd

.. seealso:: :ref:`sample-appredict-argument-input`

.. _sample-appredict-argument-input:

Sample |ApPredict| argument input
---------------------------------

The following is derived from ``cardiacmodelling/appredict-no-emulators:0.0.6`` (i.e. around July 2020)

::

***********************************************************************************************
* ApPredict::Please provide some of these inputs:
*
* EITHER --model
*   options: 1 = Shannon, 2 = TenTusscher (06), 3 = Mahajan,
*            4 = Hund-Rudy, 5 = Grandi, 6 = O'Hara-Rudy 2011 (endo),
*            7 = Paci (ventricular), 8 = O'Hara-Rudy CiPA v1 2017 (endo)
* OR --cellml <file>
*
* SPECIFYING PACING:
* --pacing-freq            Pacing frequency (Hz) (optional - defaults to 1Hz)
* --pacing-max-time        Maximum time for which to pace the cell model in MINUTES
*                          (optional - defaults to time for 10,000 paces at this frequency)
* --pacing-stim-duration   Duration of the square wave stimulus pulse applied (ms)
*                          (optional - defaults to stimulus duration from CellML)
* --pacing-stim-magnitude  Height of the square wave stimulus pulse applied (uA/cm^2)
*                          (optional - defaults to stimulus magnitude from CellML)
*
* SPECIFYING DRUG PROPERTIES dose-response properties for each channel:
* Channels are named:
* * herg (IKr current - hERG),
* * na (fast sodium current - NaV1.5),
* * nal (late/persistent sodium current - NaV1.5 (perhaps!)),
* * cal (L-type calcium current- CaV1.2),
* * iks (IKs current - KCNQ1 + MinK),
* * ik1 (IK1 current - KCNN4 a.k.a. KCa3.1),
* * ito ([fast] Ito current - Kv4.3 + KChIP2.2).
*
* For each channel you specify dose-response parameters [multiple entries for repeat experiments]
*   EITHER with IC50 values (in uM), for example for 'hERG':
* --ic50-herg     hERG IC50    (optional - defaults to "no effect")
*   OR with pIC50 values (in log M):
* --pic50-herg    hERG pIC50   (optional - defaults to "no effect")
*     (you can use a mixture of these for different channels if you wish, 
*     e.g. --ic50-herg 16600 --pic50-na 5.3 )
*   AND specify Hill coefficients (dimensionless):
* --hill-herg     hERG Hill    (optional - defaults to "1.0")
*   AND specify the saturation effect of the drug on peak conductance (%):
* --saturation-herg   saturation level effect of drug (optional - defaults to 0%)
*
* SPECIFYING CONCENTRATIONS AT COMMAND LINE:
* --plasma-concs  A list of (space separated) plasma concentrations at which to test (uM)
* OR alternatively:
* --plasma-conc-high  Highest plasma concentration to test (uM)
* --plasma-conc-low   Lowest  plasma concentration to test (uM) 
*                     (optional - defaults to 0)
*
* both ways of specifying test concentrations have the following optional arguments
* --plasma-conc-count  Number of intermediate plasma concentrations to test 
*                 (optional - defaults to 0 (for --plasma-concs) or 11 (for --plasma-conc-high))
* --plasma-conc-logscale <True/False> Whether to use log spacing for the plasma concentrations 
*
* SPECIFYING CONCENTRATIONS IN A FILE (for PKPD runs):
* if you want to run at concentrations in a file instead of specifying at command line, you can do:
* --pkpd-file <relative or absolute filepath>
*   To evaluate APD90s throughout a PKPD profile please provide a file with the data format:
*   Time(any units)<tab>Conc_trace_1(uM)<tab>Conc_trace_2(uM)<tab>...Conc_trace_N(uM)
*   on each row.
*
* UNCERTAINTY QUANTIFICATION:
* --credible-intervals [x y z...] This flag must be present to do uncertainty calculations.
*                      It can optionally be followed by a specific list of percentiles that are required
*                      (not including 0 or 100, defaults to just the 95% intervals).
* Then to specify 'spread' parameters for assay variability - for use with Lookup Tables:
* --pic50-spread-herg      (for each channel that you are providing ic50/pic50 values for,
* --hill-spread-herg        herg is just given as an example)
*   (for details of what these spread parameters are see 'sigma' and '1/beta' in Table 1 of:
*    Elkins et al. 2013  Journal of Pharmacological and Toxicological 
*    Methods, 68(1), 112-122. doi: 10.1016/j.vascn.2013.04.007 )
*
* OTHER OPTIONS:
* --no-downsampling  By default, we print downsampled output to create small action potential
*                    traces, but you can switch this off by calling this option.
* --output-dir       By default output goes into '$CHASTE_TEST_OUTPUT/ApPredict_output'
*                    but you can redirect it (useful for parallel scripting)
*                    with this argument.
*



.. rubric:: Footnotes

.. [#f1] "Annotated" implies metadata tags for voltage, time, ionic current conductances
         should be added using the `Cardiac Electrophysiology Web Lab <https://chaste.cs.ox.ac.uk/WebLab>`_
         tool, or pre-annotated models can be downloaded from 
         `GitHub Chaste/cellml <https://github.com/chaste/cellml>`_.
