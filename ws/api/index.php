<?php
session_start();

class LanguageManager
{
    private $languages;
    private $defaultLanguage = 'fr';
    private $currentLanguage;
    private $availableLanguages = ['fr', 'en', 'ja', 'ru', 'pt', 'zh', 'el', 'ar'];

    public function __construct()
    {
        $this->loadLanguages();
        $this->determineLanguage();
    }

    private function loadLanguages()
    {
        $configPath = __DIR__ . '/../config/languages.json';
        if (!file_exists($configPath)) {
            $configPath = __DIR__ . '/config/languages.json';
        }
        $jsonContent = file_get_contents($configPath);
        $this->languages = json_decode($jsonContent, true);
    }

    private function determineLanguage()
    {
        // 1. Paramètre GET explicite
        if (isset($_GET['lang']) && in_array($_GET['lang'], $this->availableLanguages)) {
            $this->currentLanguage = $_GET['lang'];
            $_SESSION['language'] = $this->currentLanguage;
            return;
        }

        // 2. Session existante
        if (isset($_SESSION['language']) && in_array($_SESSION['language'], $this->availableLanguages)) {
            $this->currentLanguage = $_SESSION['language'];
            return;
        }

        // 3. Détection via Accept-Language avec votre fonction
        if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
            $preferredLangs = $this->prefered_language($this->availableLanguages, $_SERVER['HTTP_ACCEPT_LANGUAGE']);
            if (!empty($preferredLangs)) {
                $this->currentLanguage = key($preferredLangs); // Première langue détectée
                $_SESSION['language'] = $this->currentLanguage;
                return;
            }
        }

        // 4. Langue par défaut
        $this->currentLanguage = $this->defaultLanguage;
        $_SESSION['language'] = $this->currentLanguage;
    }

    private function prefered_language(array $available_languages, $http_accept_language) {
        $available_languages = array_flip($available_languages);

        $langs = [];
        preg_match_all('~([\w-]+)(?:[^,\d]+([\d.]+))?~', strtolower($http_accept_language), $matches, PREG_SET_ORDER);
        foreach($matches as $match) {

            list($a, $b) = explode('-', $match[1]) + array('', '');
            $value = isset($match[2]) ? (float) $match[2] : 1.0;

            if(isset($available_languages[$match[1]])) {
                $langs[$match[1]] = $value;
                continue;
            }

            if(isset($available_languages[$a])) {
                $langs[$a] = $value - 0.1;
            }
        }
        
        if (!empty($langs)) {
            arsort($langs);
        }
        
        return $langs;
    }

    public function getCurrentLanguage()
    {
        return $this->currentLanguage;
    }

    public function getAvailableLanguages()
    {
        return $this->availableLanguages;
    }

    public function getText($key)
    {
        $keys = explode('.', $key);
        $text = $this->languages[$this->currentLanguage];

        foreach ($keys as $k) {
            if (isset($text[$k])) {
                $text = $text[$k];
            } else {
                return "Missing translation: $key";
            }
        }

        return $text;
    }

    public function getLanguageData($lang = null)
    {
        $lang = $lang ?: $this->currentLanguage;
        return $this->languages[$lang] ?? $this->languages[$this->defaultLanguage] ?? [];
    }

    public function getCurrentPage()
    {
        $page = $_GET['page'] ?? 'home';
        return in_array($page, ['home', 'projects', 'contact', 'experiences', 'education']) ? $page : 'home';
    }

    public function getYouTubeUrl($videoId, $lang = null)
    {
        $lang = $lang ?: $this->currentLanguage;
        
        // Paramètres YouTube pour forcer la langue de l'interface
        $params = [
            'hl' => $lang,                    // Host language (langue de l'interface)
            'cc_lang_pref' => $lang,          // Closed captions language preference
            'cc_load_policy' => 1,            // Force l'affichage des sous-titres
            'rel' => 0,                       // Ne pas montrer de vidéos relatives
            'modestbranding' => 1,            // Branding YouTube minimal
            'playsinline' => 1,               // Lecture en ligne sur mobile
            'origin' => urlencode($this->getBaseUrl()), // Origine pour la sécurité
        ];
        
        // Pour l'arabe et les langues RTL, ajouter des paramètres spéciaux
        if (in_array($lang, ['ar', 'he', 'fa'])) {
            $params['dir'] = 'rtl';
        }
        
        $queryString = http_build_query($params);
        return "https://www.youtube.com/embed/{$videoId}?{$queryString}";
    }

    public function getPageTitle()
    {
        $currentPage = $this->getCurrentPage();
        $baseTitle = $this->getText('home.title');
        
        // Titres de pages spécifiques
        $pageTitles = [
            'home' => $baseTitle,
            'projects' => $this->getText('navigation.projects') . ' - ' . $baseTitle,
            'contact' => $this->getText('navigation.contact') . ' - ' . $baseTitle,
            'experiences' => $this->getText('navigation.experiences') . ' - ' . $baseTitle,
            'education' => $this->getText('navigation.education') . ' - ' . $baseTitle
        ];
        
        return $pageTitles[$currentPage] ?? $baseTitle;
    }

    public function generateAlternateLinks()
    {
        $currentPage = $this->getCurrentPage();
        $baseUrl = $this->getBaseUrl();
        $links = '';

        foreach ($this->availableLanguages as $lang) {
            $url = $baseUrl . "?page=$currentPage&lang=$lang";
            $links .= "<link rel=\"alternate\" hreflang=\"$lang\" href=\"$url\">\n    ";
        }

        return $links;
    }

    public function generateLanguageUrl($lang, $page = null)
    {
        $page = $page ?: $this->getCurrentPage();
        return "?page=$page&lang=$lang";
    }

    public function getBaseUrl()
    {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        return $protocol . '://' . $host;
    }
}

$lang = new LanguageManager();
$currentLang = $lang->getCurrentLanguage();
$currentPage = $lang->getCurrentPage();
$langData = $lang->getLanguageData();
?>

<!DOCTYPE html>
<html lang="<?php echo $currentLang; ?>" dir="<?php echo $langData['dir']; ?>">

<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title><?php echo htmlspecialchars($lang->getPageTitle()); ?></title>
    <link rel="icon" href="https://portfolio.ethancls.com/favicon.ico" type="image/x-icon"/>

    <!-- SEO Meta Tags -->
    <meta name="description" content="<?php echo htmlspecialchars($lang->getText('home.subtitle')); ?>"/>
    <meta name="author" content="Ethan Nicolas"/>
    <meta name="keywords" content="portfolio, développeur, ingénieur informatique, web development, programming"/>

    <!-- Open Graph Metadata -->
    <meta property="og:title" content="<?php echo htmlspecialchars($lang->getPageTitle()); ?>"/>
    <meta property="og:description" content="<?php echo htmlspecialchars($lang->getText('home.subtitle')); ?>"/>
    <meta property="og:type" content="website"/>
    <meta property="og:url" content="<?php echo $lang->getBaseUrl() . '?page=' . $currentPage . '&lang=' . $currentLang; ?>"/>
    <meta property="og:locale" content="<?php echo $currentLang; ?>"/>
    <meta property="og:image" content="<?php echo $lang->getBaseUrl(); ?>/background.jpeg"/>
    <meta property="og:image:url" content="<?php echo $lang->getBaseUrl(); ?>/background.jpeg"/>
    <meta property="og:image:alt" content="<?php echo htmlspecialchars($lang->getPageTitle()); ?>"/>
    <meta property="og:image:secure_url" content="<?php echo $lang->getBaseUrl(); ?>/background.jpeg"/>
    <meta property="og:image:width" content="1200"/>
    <meta property="og:image:height" content="630"/>
    <meta property="og:image:type" content="image/png"/>
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:site" content="@somayhka"/>
    <meta name="twitter:creator" content="@somayhka"/>
    <meta name="twitter:title" content="<?php echo htmlspecialchars($lang->getPageTitle()); ?>"/>
    <meta name="twitter:description" content="<?php echo htmlspecialchars($lang->getText('home.subtitle')); ?>"/>
    <meta name="twitter:image" content="<?php echo $lang->getBaseUrl(); ?>/background.jpeg"/>
    <meta name="twitter:image:alt" content="<?php echo htmlspecialchars($lang->getPageTitle()); ?>"/>

    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- Fichier CSS -->
    <link rel="stylesheet" href="/style.css"/>

    <!-- SEO | Sitemap & Robots -->
    <link rel="sitemap" type="application/xml" href="<?php echo $lang->getBaseUrl(); ?>/sitemap.xml"/>
    <meta name="robots" content="index, follow"/>

    <!-- Liens alternatifs de langues -->
    <?php echo $lang->generateAlternateLinks(); ?>

    <!-- Schema Person -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Ethan Nicolas",
        "jobTitle": "<?php echo json_encode($lang->getText('job')); ?>",
        "description": <?php echo json_encode($lang->getText('home.subtitle')); ?>,
        "url": "<?php echo $lang->getBaseUrl(); ?>",
        "image": "<?php echo $lang->getBaseUrl(); ?>/background.jpeg",
        "sameAs": [
            "https://github.com/ethancls",
            "https://linkedin.com/in/ethannicolas",
            "https://twitter.com/somayhka",
            "https://instagram.com/ethancls",
        ],
        "email": "contact@ethancls.com",
    }
    </script>
</head>

<body itemscope itemtype="https://schema.org/Person">
    <header class="header">
        <nav class="nav-container">
            <a class="logo" href="?page=home&lang=<?php echo $currentLang; ?>">
                <img src="https://portfolio.ethancls.com/favicon.ico" alt="Portfolio" class="logo-icon">
            </a>

            <div class="nav-menu">
                <a class="nav-link<?php if ($currentPage === 'home') echo ' active'; ?>" href="?page=home&lang=<?php echo $currentLang; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                    <?php echo $lang->getText('navigation.home'); ?>
                </a>
                <a class="nav-link<?php if ($currentPage === 'projects') echo ' active'; ?>" href="?page=projects&lang=<?php echo $currentLang; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    <?php echo $lang->getText('navigation.projects'); ?>
                </a>
                <a class="nav-link<?php if ($currentPage === 'experiences') echo ' active'; ?>" href="?page=experiences&lang=<?php echo $currentLang; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <?php echo $lang->getText('navigation.experiences'); ?>
                </a>
                <a class="nav-link<?php if ($currentPage === 'education') echo ' active'; ?>" href="?page=education&lang=<?php echo $currentLang; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
                        <path d="M22 10v6" />
                        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
                    </svg>
                    <?php echo $lang->getText('navigation.education'); ?>
                </a>
                <a class="nav-link<?php if ($currentPage === 'contact') echo ' active'; ?>" href="?page=contact&lang=<?php echo $currentLang; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <?php echo $lang->getText('navigation.contact'); ?>
                </a>
            </div>

            <button class="hamburger" id="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </button>

            <button class="theme-toggle" id="theme-toggle" title="Basculer mode sombre/clair">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            </button>

            <div class="language-selector">
                <button class="language-btn" onclick="toggleLanguageDropdown()">
                    <span class="language-iso"><?php echo strtoupper($currentLang); ?></span> <span class="language-name"><?php echo $langData['name']; ?></span> ▼
                </button>
                <div class="language-dropdown" id="languageDropdown">
                    <?php foreach ($lang->getAvailableLanguages() as $langCode): ?>
                        <?php if ($langCode !== $currentLang): ?>
                            <?php $langInfo = $lang->getLanguageData($langCode); ?>
                            <a href="<?php echo $lang->generateLanguageUrl($langCode); ?>" class="language-option">
                                <span class="language-iso"><?php echo strtoupper($langCode); ?></span> <span class="language-name"><?php echo $langInfo['name']; ?></span>
                            </a>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="mobile-menu" id="mobileMenu">
                <a class="nav-link<?php if ($currentPage === 'home') echo ' active'; ?>" href="?page=home&lang=<?php echo $currentLang; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                    <?php echo $lang->getText('navigation.home'); ?>
                </a>
                <a class="nav-link<?php if ($currentPage === 'projects') echo ' active'; ?>" href="?page=projects&lang=<?php echo $currentLang; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <path d="M12 11h4" />
                        <path d="M12 16h4" />
                        <path d="M8 11h.01" />
                        <path d="M8 16h.01" />
                    </svg>
                    <?php echo $lang->getText('navigation.projects'); ?>
                </a>
                <a class="nav-link<?php if ($currentPage === 'experiences') echo ' active'; ?>" href="?page=experiences&lang=<?php echo $currentLang; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <?php echo $lang->getText('navigation.experiences'); ?>
                </a>
                <a class="nav-link<?php if ($currentPage === 'education') echo ' active'; ?>" href="?page=education&lang=<?php echo $currentLang; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
                        <path d="M22 10v6" />
                        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
                    </svg>
                    <?php echo $lang->getText('navigation.education'); ?>
                </a>
                <a class="nav-link<?php if ($currentPage === 'contact') echo ' active'; ?>" href="?page=contact&lang=<?php echo $currentLang; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <?php echo $lang->getText('navigation.contact'); ?>
                </a>

                <div class="mobile-controls">
                    <button class="theme-toggle" onclick="toggleTheme()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    </button>
                    <div class="language-selector">
                        <button class="language-btn" onclick="toggleLanguageDropdown()">
                            <span class="language-iso"><?php echo strtoupper($currentLang); ?></span> <span class="language-name"><?php echo $langData['name']; ?></span> ▼
                        </button>
                        <div class="language-dropdown" id="languageDropdownMobile">
                            <?php foreach ($lang->getAvailableLanguages() as $langCode): ?>
                                <?php if ($langCode !== $currentLang): ?>
                                    <?php $langInfo = $lang->getLanguageData($langCode); ?>
                                    <a href="<?php echo $lang->generateLanguageUrl($langCode); ?>" class="language-option">
                                        <span class="language-iso"><?php echo strtoupper($langCode); ?></span> <span class="language-name"><?php echo $langInfo['name']; ?></span>
                                    </a>
                                <?php endif; ?>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </header>

    <main class="main-content">
        <!-- Home Page -->
        <div class="page-content <?php echo $currentPage === 'home' ? 'active' : ''; ?>" id="home">
            <section class="about-section">
                <div class="section-header">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <h2><?php echo $lang->getText('home.about_title'); ?></h2>
                </div>
                <div class="about-content">
                    <div class="about-card avatar-right">
                        <p class="about-text"><?php echo $lang->getText('home.about_content'); ?></p>
                        <img src="https://www.gravatar.com/avatar/fdabfb6dddfc22957ffd6f22a1802941?s=400" alt="Profile Picture" class="about-avatar">
                    </div>
                </div>
            </section>

            <section class="video-section">
                <div class="section-header">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    <h2><?php echo $lang->getText('home.video_title'); ?></h2>
                </div>
                <div class="video-card">
                    <p class="video-description"><?php echo $lang->getText('home.video_description'); ?></p>
                    <div class="video-container">
                        <?php
                        // ID de la vidéo YouTube
                        $videoId = 'o8NPllzkFhE';
                        $videoUrl = $lang->getYouTubeUrl($videoId, $currentLang);
                        ?>
                        <iframe
                            src="<?php echo $videoUrl; ?>"
                            title="<?php echo htmlspecialchars($lang->getText('home.video_title')); ?>"
                            lang="<?php echo $currentLang; ?>"
                            width="560"
                            height="315"
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>
            </section>
        </div>

        <!-- Projects Page -->
        <div class="page-content <?php echo $currentPage === 'projects' ? 'active' : ''; ?>" id="projects">

            <div class="projects-grid">

                <a href="https://fs0ciety.uk" target="_blank" class="project-card" itemscope itemtype="https://schema.org/CreativeWork">
                    <div class="project-header">
                        <h3 class="project-title" itemprop="name"><?php echo $lang->getText('projects.fs0ciety.title'); ?></h3>
                        <p class="project-description" itemprop="description"><?php echo $lang->getText('projects.fs0ciety.description'); ?></p>
                    </div>
                    <div class="project-preview">
                        <img src="/fs0ciety.png" alt="fs0ciety Preview" itemprop="url">
                    </div>
                </a>
                
                <a href="https://atlas.ethancls.com" target="_blank" class="project-card" itemscope itemtype="https://schema.org/CreativeWork">
                    <div class="project-header">
                        <h3 class="project-title" itemprop="name"><?php echo $lang->getText('projects.atlas.title'); ?></h3>
                        <p class="project-description" itemprop="description"><?php echo $lang->getText('projects.atlas.description'); ?></p>
                    </div>
                     <div class="project-preview">
                        <img src="/atlas.png" alt="Atlas Preview" itemprop="url">
                    </div>
                </a>

                <a href="https://jarvys.ethancls.com" target="_blank" class="project-card" itemscope itemtype="https://schema.org/CreativeWork">
                    <div class="project-header">
                        <h3 class="project-title" itemprop="name"><?php echo $lang->getText('projects.jarvys.title'); ?></h3>
                        <p class="project-description" itemprop="description"><?php echo $lang->getText('projects.jarvys.description'); ?></p>
                    </div>
                    <div class="project-preview">
                        <img src="/jarvys.png" alt="Jarvys Preview" itemprop="url">
                    </div>
                </a>

                <a href="https://portfolio.ethancls.com" target="_blank" class="project-card" itemscope itemtype="https://schema.org/CreativeWork">
                    <div class="project-header">
                        <h3 class="project-title" itemprop="name"><?php echo $lang->getText('projects.portfolio.title'); ?></h3>
                        <p class="project-description" itemprop="description"><?php echo $lang->getText('projects.portfolio.description'); ?></p>
                    </div>
                    <div class="project-preview">
                        <img src="/portfolio.png" alt="Portfolio Preview" itemprop="url">
                    </div>
                </a>
            </div>
        </div>

        <!-- Experiences Page -->
        <div class="page-content <?php echo $currentPage === 'experiences' ? 'active' : ''; ?>" id="experiences">
            <div class="experience-grid">
                <?php if (isset($langData['experiences']) && is_array($langData['experiences'])): ?>
                    <?php foreach ($langData['experiences'] as $exp): ?>
                        <div class="experience-card">
                            <div class="experience-header">
                                <div class="experience-badge"><?php echo htmlspecialchars($exp['date'] ?? ''); ?></div>
                                <div class="experience-meta">
                                    <h3 class="experience-title"><?php echo htmlspecialchars($exp['title'] ?? ''); ?></h3>
                                    <p class="experience-company">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <?php echo htmlspecialchars($exp['company'] ?? ''); ?>
                                    </p>
                                </div>
                            </div>
                            <?php if (isset($exp['details']) && is_array($exp['details'])): ?>
                                <div class="experience-content">
                                    <ul class="experience-details">
                                        <?php foreach ($exp['details'] as $d): ?>
                                            <li>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <path d="M9 12l2 2 4-4" />
                                                    <circle cx="12" cy="12" r="10" />
                                                </svg>
                                                <?php echo htmlspecialchars($d); ?>
                                            </li>
                                        <?php endforeach; ?>
                                    </ul>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                        <p>Données d'expérience non disponibles.</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Education Page -->
        <div class="page-content <?php echo $currentPage === 'education' ? 'active' : ''; ?>" id="education">
            <section class="cv-education">
                <h2><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
                        <path d="M22 10v6" />
                        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
                    </svg> <?php echo $langData['subtitles'][0]; ?></h2>
                <div class="cv-timeline">
                    <?php if (isset($langData['education']) && is_array($langData['education'])): ?>
                        <?php foreach ($langData['education'] as $edu): ?>
                            <div class="cv-timeline-item">
                                <div class="cv-timeline-date"><?php echo htmlspecialchars($edu['date'] ?? ''); ?></div>
                                <div class="cv-timeline-content">
                                    <div class="cv-timeline-title"><?php echo htmlspecialchars($edu['title'] ?? ''); ?> <span class="cv-timeline-company">@ <?php echo htmlspecialchars($edu['school'] ?? ''); ?></span></div>
                                    <div class="cv-timeline-desc"><?php echo htmlspecialchars($edu['desc'] ?? ''); ?></div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <p>Données d'éducation non disponibles.</p>
                    <?php endif; ?>
                </div>
            </section>
            <section class="cv-skills">
                <h2><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/>
                        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                        <path d="M12 2v2"/>
                        <path d="M12 22v-2"/>
                        <path d="m17 20.66-1-1.73"/>
                        <path d="M11 10.27 7 3.34"/>
                        <path d="m20.66 17-1.73-1"/>
                        <path d="m3.34 7 1.73 1"/>
                        <path d="M14 12h8"/>
                        <path d="M2 12h2"/>
                        <path d="m20.66 7-1.73 1"/>
                        <path d="m3.34 17 1.73-1"/>
                        <path d="m17 3.34-1 1.73"/>
                        <path d="m11 13.73-4 6.93"/>
                    </svg> <?php echo $langData['subtitles'][1]; ?></h2>
                <div class="cv-skills-list">
                    <?php if (isset($langData['skills']) && is_array($langData['skills'])): ?>
                        <?php foreach ($langData['skills'] as $skill): ?>
                            <div><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M9 12l2 2 4-4" />
                                    <circle cx="12" cy="12" r="10" />
                                </svg> <strong><?php echo htmlspecialchars($skill['cat'] ?? ''); ?> :</strong> <?php echo htmlspecialchars($skill['items'] ?? ''); ?></div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </section>
            <section class="cv-languages">
                <h2><span class="fa-solid fa-language"></span> <?php echo $langData['subtitles'][2]; ?></h2>
                <ul class="cv-languages-list">
                    <?php foreach ($langData['languageskills'] as $ls): ?>
                        <li><span class="fa-solid fa-circle-check"></span> <?php echo htmlspecialchars($ls['lang']); ?> : <?php echo htmlspecialchars($ls['level']); ?></li>
                    <?php endforeach; ?>
                </ul>
            </section>
            <section class="cv-interests">
                <h2><span class="fa-solid fa-heart"></span> <?php echo $langData['subtitles'][3]; ?></h2>
                <ul class="cv-interests-list">
                    <?php foreach ($langData['interests'] as $interest): ?>
                        <li><span class="fa-solid fa-heart"></span> <?php echo htmlspecialchars($interest); ?></li>
                    <?php endforeach; ?>
                </ul>
            </section>
            <section class="cv-qualities">
                <h2><span class="fa-solid fa-star"></span> <?php echo $langData['subtitles'][4]; ?></h2>
                <ul class="cv-qualities-list">
                    <?php foreach ($langData['qualities'] as $q): ?><li><?php echo htmlspecialchars($q); ?></li><?php endforeach; ?>
                </ul>
            </section>
        </div>

        <!-- Contact Page -->
        <div class="page-content <?php echo $currentPage === 'contact' ? 'active' : ''; ?>" id="contact">

            <div class="contact-container">
                <div class="contact-info">
                    <div class="contact-card">
                        <div class="contact-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                        <div class="contact-details">
                            <h3><?php echo $lang->getText('contact.email'); ?></h3>
                            <a href="mailto:contact@ethancls.com" itemprop="email">contact@ethancls.com</a>
                        </div>
                    </div>

                    <div class="contact-card">
                        <div class="contact-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                <path d="M9 18c-4.51 2-5-2-7-2" />
                            </svg>
                        </div>
                        <div class="contact-details">
                            <h3><?php echo $lang->getText('contact.github'); ?></h3>
                            <a href="https://github.com/ethancls" target="_blank" rel="noopener" itemprop="sameAs">github.com/ethancls</a>
                        </div>
                    </div>

                    <div class="contact-card">
                        <div class="contact-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                <rect width="4" height="12" x="2" y="9" />
                                <circle cx="4" cy="4" r="2" />
                            </svg>
                        </div>
                        <div class="contact-details">
                            <h3><?php echo $lang->getText('contact.linkedin'); ?></h3>
                            <a href="https://linkedin.com/in/ethannicolas" target="_blank" rel="noopener" itemprop="sameAs">linkedin.com/in/ethannicolas</a>
                        </div>
                    </div>

                    <div class="contact-card">
                        <div class="contact-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                            </svg>
                        </div>
                        <div class="contact-details">
                            <h3><?php echo $lang->getText('contact.twitter'); ?></h3>
                            <a href="https://twitter.com/somayhka" target="_blank" rel="noopener" itemprop="sameAs">@somayhka</a>
                        </div>
                    </div>

                    <div class="contact-card">
                        <div class="contact-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                            </svg>
                        </div>
                        <div class="contact-details">
                            <h3><?php echo $lang->getText('contact.instagram'); ?></h3>
                            <a href="https://instagram.com/ethancls" target="_blank" rel="noopener" itemprop="sameAs">@ethancls</a>
                        </div>
                    </div>

                    <div class="contact-card">
                        <div class="contact-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -28.5 256 256" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="currentColor" />
                            </svg>
                        </div>
                        <div class="contact-details">
                            <h3><?php echo $lang->getText('contact.discord'); ?></h3>
                            <a href="https://discord.com/invite/MtQPwYZZ" target="_blank" rel="noopener" itemprop="sameAs">azuma93</a>
                        </div>
                    </div>
                </div>

                <div class="contact-cta">
                    <div class="cta-card">
                        <h3><?php echo $lang->getText('contact.cta_title'); ?></h3>
                        <p><?php echo $lang->getText('contact.cta_description'); ?></p>
                        <a href="mailto:contact@ethancls.com" class="cta-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <?php echo $lang->getText('contact.send_email'); ?>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <footer class="footer">
        <p><?php echo $lang->getText('footer.copyright'); ?></p>
    </footer>

    <script type="text/javascript">
    //<![CDATA[
        // Dark/Light mode toggle
        const themeToggle = document.getElementById('theme-toggle');
        const root = document.documentElement;

        function setTheme(theme) {
            root.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            const sunIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';
            const moonIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
            themeToggle.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
        }

        function toggleTheme() {
            const current = root.getAttribute('data-theme') || 'light';
            setTheme(current === 'dark' ? 'light' : 'dark');
        }

        themeToggle.addEventListener('click', toggleTheme);

        // Init theme
        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setTheme(savedTheme);

        // Hamburger menu toggle
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobileMenu');

        function toggleMobileMenu() {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('show');
        }

        hamburger.addEventListener('click', toggleMobileMenu);

        // Language dropdown toggle
        function toggleLanguageDropdown() {
            const dropdown = document.getElementById('languageDropdown');
            const dropdownMobile = document.getElementById('languageDropdownMobile');
            if (dropdown) dropdown.classList.toggle('show');
            if (dropdownMobile) dropdownMobile.classList.toggle('show');
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            const languageSelectors = document.querySelectorAll('.language-selector');
            const dropdowns = document.querySelectorAll('.language-dropdown');

            let clickedInside = false;
            languageSelectors.forEach(selector => {
                if (selector.contains(event.target)) {
                    clickedInside = true;
                }
            });

            if (!clickedInside) {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }

            // Close mobile menu when clicking outside
            const header = document.querySelector('.header');
            if (!header.contains(event.target)) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('show');
            }
        });

        // Close dropdown when pressing Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                document.querySelectorAll('.language-dropdown').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('show');
            }
        });
    //]]>
    </script>
</body>

</html>