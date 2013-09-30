RAMP utilities 
===================

## Introduction

  The scripts and stylesheets in this folder can be used to merge a set of EAD and EAC-CPF files as part of a separate preprocessing stage prior to import into RAMP. 
  **These utilities have been designed to work with files exported from the Archon archival management system, but may be adapted to work with files from other systems.**

## 1 Requirements

  * XSLT 2.0 processor like Saxon-HE 9+ or desktop XML editor like oXygen
  * Bash shell  

## 2 File merging

  * Download your EAC-CPF and EAD files and place them in their respective directories, `eac` and `ead`.
  * Run `eac2eadMatch.sh` on the files in the `eac` directory and `eadRename.sh` on the `ead` directory. The scripts are already located in the directories.
    **Note: some files exported from Archon may contain undeclared `&nbsp;` entities. These can be removed with a sed script run on the contents of the directory:
    `find ./ -type f -exec sed -i 's/&nbsp;/ /g' {} \;`   
  * Run the `eacFileListGenerator.xsl` stylesheet on the files in the `eac` directory. The output file can be named something like `eacFileList.xml`.
  * `eacFileList.xml` should be run as the input file for the `eac2eadMerge.xsl` stylesheet.
  * The merged EAD files will be located in the `merge` directory inside `utils`. This directory will be created by the `eac2eadMerge.xsl` stylesheet.
  
  **Once EAD files have been merged, they should be moved to the `ead` directory that is located one level up, within the RAMP root directory.**