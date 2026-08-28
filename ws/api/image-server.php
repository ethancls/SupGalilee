<?php
// Serveur d'images générique pour le dossier public
$imageName = $_GET['img'] ?? '';

// Nettoyer le nom de fichier pour éviter les attaques de traversée de répertoire
$imageName = basename($imageName);
$imageName = preg_replace('/[^a-zA-Z0-9._-]/', '', $imageName);

if (empty($imageName)) {
    header('HTTP/1.1 400 Bad Request');
    exit('Image name required');
}

$imagePath = __DIR__ . '/../public/' . $imageName;

if (!file_exists($imagePath)) {
    header('HTTP/1.1 404 Not Found');
    exit('Image not found');
}

// Déterminer le type MIME
$imageInfo = getimagesize($imagePath);
$mimeType = $imageInfo['mime'] ?? 'application/octet-stream';

// Headers pour l'image
header('Content-Type: ' . $mimeType);
header('Cache-Control: public, max-age=86400'); // Cache 24h
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 86400) . ' GMT');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', filemtime($imagePath)) . ' GMT');

// Vérifier le cache côté client
$etag = '"' . md5_file($imagePath) . '"';
header('Etag: ' . $etag);

if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && $_SERVER['HTTP_IF_NONE_MATCH'] === $etag) {
    header('HTTP/1.1 304 Not Modified');
    exit;
}

// Servir l'image
readfile($imagePath);
?>
