
# Singularity 

## Environment

CentOS Linux release 7.6.1810  
Singularity v3.2.1 (from source)  
squashfs-tools-4.3-0.21.gitaae0aff4.el7.x86_64  

## Local settings and download info.

 1. Currently 8	processors are expected. If you	wish to	adjust this value
    then try something like...  
    `find . -type f -name "Singularity" -exec sed -i 's/BUILD_PROCESSORS=8/BUILD_PROCESSORS=10/g' {} +`
 2. The following files are downloaded `grep -r "\(wget https*\|git clone\|apk add\|From: \)" *`

### Singularity persistent overlays

https://sylabs.io/guides/3.2/user-guide/persistent_overlays.html

 1. `touch my_overlay`
 1. `dd if=/dev/zero of=my_overlay bs=1M count=500 && mkfs.ext3 my_overlay`
 1. `sudo singularity shell --overlay my_overlay appredict-with-emulators.img`
