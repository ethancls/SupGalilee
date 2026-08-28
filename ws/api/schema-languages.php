<?php
header('Content-Type: application/schema+json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Servir le schéma JSON
$schemaFile = __DIR__ . '/../schemas/languages.json';
if (file_exists($schemaFile)) {
    readfile($schemaFile);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Schema not found']);
}
?>
