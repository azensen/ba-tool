<?php
/*//projectPath as Param for $file Path
$file = "levels.json";
$handle = fopen($file, "r");
if ($handle) {
    while (($line = fgets($handle)) !== false) {
        echo $line;
    }

    fclose($handle);
} else {
    // error opening the file.
}*/
$projectPath = $_POST['projectPath'];
$string = file_get_contents($projectPath . "project.pcfg");
echo $string;
//$levelsJSON = json_decode($string, true);
//echo $levelsJSON;


?>