<?php
// Sert l'image Jarvys depuis le dossier public
$imagePath = __DIR__ . '/../public/jarvys.png';

if (!file_exists($imagePath)) {
    header('HTTP/1.1 404 Not Found');
    exit('Image not found');
}

// Headers pour l'image
header('Content-Type: image/png');
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
