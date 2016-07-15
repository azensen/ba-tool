<?php
/**
 * Created by PhpStorm.
 * User: André Zensen
 * Date: 10.07.2016
 * Time: 10:46
 */

/*
 * takes corr JSON data and a direct, relative file path to where the model is
 * example: "filePath": "..\/..\/projects\/ATMProject\/Business\/ATMProcess\/business_atm.corr"
 */

//collect data
$corrList = $_POST['corrList'];
$filePath = $_POST['filePath'];

//save data
file_put_contents($filePath, $corrList, LOCK_EX);