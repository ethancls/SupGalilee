<?php
// Définir le type de contenu comme CSS
header('Content-Type: text/css; charset=UTF-8');

// Ajouter des en-têtes de cache pour optimiser les performances
header('Cache-Control: public, max-age=31536000'); // Cache 1 an
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');

// Inclure le fichier CSS
$cssFile = __DIR__ . '/style.css';

if (file_exists($cssFile)) {
    echo file_get_contents($cssFile);
} else {
    // Fallback si le fichier n'existe pas
    http_response_code(404);
    echo '/* CSS file not found */';
}
?>
