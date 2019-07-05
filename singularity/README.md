
# Singularity 

## Environment

CentOS Linux release 7.6.1810
Singularity v3.2.1
squashfs-tools-4.3-0.21.gitaae0aff4.el7.x86_64

### Singularity persistent overlays

https://sylabs.io/guides/3.2/user-guide/persistent_overlays.html

 1. `touch my_overlay`
 1. `dd if=/dev/zero of=my_overlay bs=1M count=500 && mkfs.ext3 my_overlay`
 1. `sudo singularity shell --overlay my_overlay appredict-with-emulators.img`
