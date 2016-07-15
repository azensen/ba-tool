<?php
/**
 * Created by PhpStorm.
 * User: André Zensen
 * Date: 10.07.2016
 * Time: 10:38
 */


/*
 * takes xml data and a direct, relative file path to where the xml is to be saved to
 * example: "filePath": "..\/..\/projects\/ATMProject\/Business\/ATMProcess\/business_atm.bpmn"
 */

//collect data
$xmlData = $_POST['xml'];
$filePath = $_POST['filePath'];

//save data
file_put_contents($filePath, $xmlData, LOCK_EX);
