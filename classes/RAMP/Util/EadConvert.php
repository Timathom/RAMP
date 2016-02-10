<?php
/**
 * EadConvert
 *
 * This class goes over the files in the ead folder and imports them into the database
 *
 *
 * @author little9 (Jamie Little)
 * @copyright Copyright (c) 2013
 *
 */
namespace RAMP\Util;

class EadConvert {
    private $agency_code;
    private $other_agency_code;
    private $agency_name;
    private $short_agency_name;
    private $serverName;
    private $localURL;
    private $repositoryOne;
    private $repositoryTwo;
    private $eventDescDerive;
    private $eventDescCreate;
    private $eventDescRevise;
    private $eventDescExport;

    private $allfiles;
    // The array of EAD files
    private $ead_path;
    // The path to an individual EAD file
    private $XMLDOM;
    //The Dom Document for XML
    private $cycleCount = 20;

    public function __construct( $ead_path )
    {
        if ($ead_path == "none") {
            $this->XMLDOM = new \DOMDocument();
            $this->XMLDOM = new \DOMDocument();
            $this->XMLDOM->formatOutput = true;
            $this->ead_path = $ead_path;
        } else {

            $this->allfiles = array_diff(scandir($this->ead_path), array('.svn', '.', '..'));
        }
    }

    /* Getters */
    public function getAllFiles() {
        // This function filters out some of the Unixy stuff that comes from running scandir
        $this->allfiles;

    }

    public function getEadPath() {
        return $this->ead_path;
    }

    public function setAllFiles($allfiles)
    {
        $this->allfiles = $allfiles;
    }


    public function getAgency_code() {
        return $this->agency_code;
    }

    public function setAgency_code($agency_code)
    {
        $this->agency_code = $agency_code;
    }

    public function getOther_agency_code() {
        return $this->other_agency_code;
    }

    public function setOther_agency_code($other_agency_code)
    {
        $this->other_agency_code = $other_agency_code;
    }

    public function getAgency_name() {
        return $this->agency_name;
    }

    public function setAgency_name($agency_name)
    {
        $this->agency_name = $agency_name;
    }

    public function getShortAgency_name() {
        return $this->short_agency_name;
    }

    public function setShortAgency_name($short_agency_name)
    {
        $this->short_agency_name = $short_agency_name;
    }

    public function setServer_name($serverName) {
        $this->serverName = $serverName;
    }

    public function getServer_name() {
        return $this->serverName;
    }

    public function setLocal_url($localURL) {
        $this->localURL = $localURL;
    }
    public function getLocal_url() {
        return $this->localURL;

    }

    public function setRepository_one($repositoryOne) {
        $this->repositoryOne = $repositoryOne;
    }
    public function getRepository_one() {
        return $this->repositoryOne;

    }

    public function setRepository_two($repositoryTwo) {
        $this->repositoryTwo = $repositoryTwo;
    }
    public function getRepository_two() {
        return $this->repositoryTwo;

    }

    public function setEventDescCreate($eventDescCreate) {
        $this->eventDescCreate = $eventDescCreate;
    }
    public function getEventDescCreate() {
        return $this->eventDescCreate;

    }

    public function setEventDescRevise($eventDescRevise) {
        $this->eventDescRevise = $eventDescRevise;
    }
    public function getEventDescRevise() {
        return $this->eventDescRevise;

    }

    public function setEventDescDerive($eventDescDerive) {
        $this->eventDescDerive = $eventDescDerive;
    }
    public function getEventDescDerive() {
        return $this->eventDescDerive;

    }

    public function setEventDescExport($eventDescExport) {
        $this->eventDescExport = $eventDescExport;
    }
    public function getEventDescExport() {
        return $this->eventDescExport;

    }

    public function setEventDescRAMP($eventDescRAMP) {
        $this->eventDescRAMP = $eventDescRAMP;
    }
    public function getEventDescRAMP() {
        return $this->eventDescRAMP;

    }



    public function new_eac( $file_name )
    {
        $file_path = $this->ead_path .  '/' . $file_name . ".xml";

        try {
            $this->XMLDOM->load($file_path);
            // Try to load the ead file

        } catch(Exception $e) {
            die ('Caught exception: ' .  $e->getMessage() . "\n");
        }

        $this->insert_into_db( $file_path, $file_name . ".xml" );
    }

    public function insert_into_db($file_path, $file){

        $db = Database::getInstance();
        $mysqli = $db->getConnection();
        // Connect to the database
        $ramp_id = "ramp" . rand(1,193918491834931);

        try {
            $this->XMLDOM->load($file_path);
            // Try to load the ead file

        } catch(Exception $e) {
            die ('Caught exception: ' .  $e->getMessage() . "\n");
        }

        $xml_string =  $mysqli->real_escape_string( $this->XMLDOM->saveXML() );

        $eac_id = $this->create_eac_id();
        // Create an id for the EAC file
        $parameters = array(

            'agencyCode'=>$this->agency_code,
            'otherAgencyCode' => $this->other_agency_code,
            'agencyName' => $this->agency_name,
            'shortAgencyName' => $this->short_agency_name,
            'standardDateTime'=>substr(date('c'), 0, -15), // Removed hours from date to avoid unecessary Diffs. --timathom
            'file' => $file,
            'serverName' => $this->serverName,
            'localURL' => $this->localURL,
            'eventDescCreate' => $this->eventDescCreate,
            'repositoryOne' => $this->repositoryOne,
            'repositoryTwo' => $this->repositoryTwo,
            'eventDescDerive' => $this->eventDescDerive,
            'eventDescRevise' => $this->eventDescRevise,
            'eventDescExport' => $this->eventDescExport,
            'eventDescRAMP' => $this->eventDescRAMP);

        $xslt = XsltTransform::transform($this->XMLDOM, $file, $parameters); // Changed $ramp_id back to $file. Value of $ramp_id assigned only to newly created records.
        // Do the XSLT transform. Send the XSLT the id and the EAD XML.

        if( $mysqli->query("SELECT ead_file FROM ead WHERE ead_file = '$file_path'")->num_rows === 0 ) {
            // Check if the EAD file has already been inserted.
            // If it hasn't then insert it and and insert the transformed EAC.

            $ead_result = $mysqli->query("INSERT into ead (ead_xml, ead_file) VALUES ('$xml_string', '$file_path') ");
            // Insert the EAD into the database

            if( !$ead_result )
                die ("<p>Error! " . mysqli_error($mysqli) . "</p>");

            $date = date("Y-m-d H:i:s");
            // Get the date

            $eac_result = $mysqli->query("INSERT into eac (created, eac_xml, ead_file) VALUES (  '$date', '$xslt','$file_path' ) ");

            if( !$eac_result )
                die ("<p>Error! " . mysqli_error($mysqli) . "</p>");

            // Insert the EAC into the database

            return "Upload Sucessful";
        } else {
            // If you couldn't insert the EAD into the database

            $ead_str_compare = $this->ead_update_check($file_path);

            // Then do a string comparision to see if the EAD file has changed since the last import

            if ($ead_str_compare != 0) {
                // Check to see if the string comparison returned a positive result.
                $mysqli->query("UPDATE ead SET ead_xml='$xml_string' WHERE ead_file='$file_path'");
                // If it has then update the EAD.

                return $this->eac_update_check($file_path,$xslt);
                //Check eac

            }
        }

    }

    private function name_check() {
        // This function checks to see if the EAD file has a defined name

        $xpath = new \DOMXPath($this->XMLDOM);
        // Create a new xpath

        $xpath->registerNamespace("ead","urn:isbn:1-931666-22-9");
        // Register the EAD namespace

        $xpath->registerNamespace("eac","urn:isbn:1-931666-33-4");

        $xpath_results = $xpath->evaluate('boolean(//eac:eac-cpf/eac:cpfDescription/eac:identity/eac:nameEntry[1]/eac:part|//ead:ead/ead:archdesc/ead:did/ead:origination[ead:persname|ead:corpname|ead:famname])');

        // Eval the xpath
        return $xpath_results;

    }

    private function ead_update_check($file_path) {
        // This function checks to see if an EAD file needs to be updated.

        $db = \Database::getInstance();
        $mysqli = $db->getConnection();
        // Connect to the database

        $ead_from_db = $mysqli->query("SELECT ead_xml FROM ead WHERE ead_file = '$file_path'");


        $ead_from_db_xml = mysqli_fetch_row($ead_from_db);
        // Get the EAD from the database

        $ead_str_compare = strcasecmp( preg_replace( '/[\s]+/', '',stripslashes(trim($ead_from_db_xml[0]))), preg_replace( '/[\s]+/', '',trim($this->XMLDOM->saveXML())));
        // Do the string comparison
        //remove whitespace (added by dgonzalez) should not matter if formatted differently

        return $ead_str_compare;

    }

    private function create_eac_id() {
        $eac_id = rand(1,1013481048194);
        return $eac_id;
    }







}