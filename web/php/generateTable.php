<?php

$project = $_POST['project'];
$process = $_POST['process'];
$model1 = $_POST['model1'];
$level1 = $_POST['level1'];
$model2 = $_POST['model2'];
$level2 = $_POST['level2'];
$consistency = $_POST['consistency'];
$unmatched = $_POST['unmatched'];
$correspondences = $_POST['correspondences'];

echo '<h1>Vertical Consistency - Correspondences</h1>';
echo 'Created on ' . date('l jS \of F Y h:i:s A');
echo '</br></br>';
echo '<table>
            <tr>
                <th>Project</th>
                <th>Process</th>
            </tr>
            <tr>
                <td>' . $project . '</td>
                <td>' . $process . '</td>
            </tr>
    </table>';
echo '</br></br>';


function generateHeader ($project, $process, $model1, $level1, $model2, $level2, $consistency, $unmatched) {

}

function generateBody ($correspondences) {

}

?>