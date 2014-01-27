<?php
/*

This script accepts a GET request that searches the database
with the EAD path (the foreign key that relates EAD, EAC, and Wiki records in the database) and returns Wiki markup

-- Jamie 

*/
include('conf/db.php');



$ead_path = $_GET["ead_path"];

$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_default, $db_port);
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}




$eac_id_sql = "SELECT eac_id from eac WHERE ead_file LIKE  CONCAT(\"%\",'$ead_path',\"%\")";

$eac_id_result = $mysqli->query($eac_id_sql);
if (!$eac_id_result) {
  printf("%s\n", $mysqli->error);

} 


$eac_id_row = $eac_id_result->fetch_row();

$eac_id = $eac_id_row['0'];


$wiki_sql = "SELECT wiki_text FROM mediawiki WHERE eac_id = '$eac_id'";

$wiki_result = $mysqli->query($wiki_sql);
if (!$wiki_result) {
  printf("%s\n", $mysqli->error);

} 

$wiki_row = $wiki_result->fetch_row();   


$wiki_markup =  $wiki_row[0];
echo($wiki_markup);


$mysqli->close();


?>
