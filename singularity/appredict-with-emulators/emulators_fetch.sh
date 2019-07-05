#!/bin/bash -e

#
# If behind a proxy try editing ~/.wgetrc as ...
#
#use_proxy=yes
#http_proxy=http://<user>:<pwd>@<proxy>
#https_proxy=http://<user>:<pwd>@<proxy>
#
wget https://www.cs.ox.ac.uk/people/gary.mirams/files/appredict_lookup_table_manifest.txt
while read tgz_file; do
  wget https://www.cs.ox.ac.uk/people/gary.mirams/files/${tgz_file}
  tar -zxvf ${tgz_file}
done <appredict_lookup_table_manifest.txt
