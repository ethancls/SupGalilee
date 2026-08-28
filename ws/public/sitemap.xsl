<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap XML - Portfolio Ethan Nicolas</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
          .container { max-width: 1200px; margin: 0 auto; }
          .header { background: rgba(255,255,255,0.95); color: #2c3e50; padding: 30px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); text-align: center; }
          .header h1 { margin: 0; font-size: 2.5em; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .header p { margin: 10px 0 0; font-size: 1.1em; color: #7f8c8d; }
          
          .stats { background: rgba(255,255,255,0.9); padding: 20px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 5px 20px rgba(0,0,0,0.2); display: flex; justify-content: space-around; text-align: center; }
          .stat-item { flex: 1; }
          .stat-number { font-size: 2em; font-weight: bold; color: #2980b9; }
          .stat-label { color: #7f8c8d; font-size: 0.9em; }
          
          .url-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }
          .url-item { background: rgba(255,255,255,0.95); padding: 20px; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); transition: transform 0.3s ease, box-shadow 0.3s ease; }
          .url-item:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
          
          .url-loc { font-weight: 600; color: #2980b9; text-decoration: none; font-size: 1.1em; display: block; margin-bottom: 10px; }
          .url-loc:hover { text-decoration: underline; color: #3498db; }
          
          .meta { display: flex; justify-content: space-between; align-items: center; }
          .priority { padding: 5px 12px; border-radius: 20px; font-weight: bold; font-size: 0.9em; }
          .priority-high { background: #2ecc71; color: white; }
          .priority-medium { background: #f39c12; color: white; }
          .priority-low { background: #95a5a6; color: white; }
          
          .lang-badge { display: inline-block; padding: 4px 8px; border-radius: 15px; font-size: 0.8em; font-weight: bold; margin-left: 10px; }
          .lang-fr { background: #e74c3c; color: white; }
          .lang-en { background: #3498db; color: white; }
          .lang-ar { background: #27ae60; color: white; }
          .lang-ja { background: #9b59b6; color: white; }
          .lang-ru { background: #e67e22; color: white; }
          .lang-pt { background: #f1c40f; color: #2c3e50; }
          .lang-zh { background: #34495e; color: white; }
          .lang-el { background: #1abc9c; color: white; }
          
          .lastmod { color: #7f8c8d; font-size: 0.9em; }
          
          .footer { text-align: center; margin-top: 40px; color: rgba(255,255,255,0.8); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🗺️ Sitemap XML</h1>
            <p>Portfolio Multilingue d'Ethan Nicolas - Site web sémantique</p>
          </div>

          <div class="stats">
            <div class="stat-item">
              <div class="stat-number"><xsl:value-of select="count(//sitemap:url)" /></div>
              <div class="stat-label">URLs Total</div>
            </div>
            <div class="stat-item">
              <div class="stat-number"><xsl:value-of select="count(//sitemap:url[contains(sitemap:loc, 'lang=')])" /></div>
              <div class="stat-label">Pages Multilingues</div>
            </div>
            <div class="stat-item">
              <div class="stat-number"><xsl:value-of select="count(//sitemap:url[sitemap:priority = '1.00'])" /></div>
              <div class="stat-label">Pages Prioritaires</div>
            </div>
          </div>

          <div class="url-grid">
            <xsl:for-each select="//sitemap:url">
              <div class="url-item">
                <a class="url-loc" href="{sitemap:loc}">
                  <xsl:value-of select="sitemap:loc" />
                  
                  <!-- Badges de langue -->
                  <xsl:choose>
                    <xsl:when test="contains(sitemap:loc, 'lang=fr')">
                      <span class="lang-badge lang-fr">🇫🇷 Français</span>
                    </xsl:when>
                    <xsl:when test="contains(sitemap:loc, 'lang=en')">
                      <span class="lang-badge lang-en">🇬🇧 English</span>
                    </xsl:when>
                    <xsl:when test="contains(sitemap:loc, 'lang=ar')">
                      <span class="lang-badge lang-ar">🇸🇦 العربية</span>
                    </xsl:when>
                    <xsl:when test="contains(sitemap:loc, 'lang=ja')">
                      <span class="lang-badge lang-ja">🇯🇵 日本語</span>
                    </xsl:when>
                    <xsl:when test="contains(sitemap:loc, 'lang=ru')">
                      <span class="lang-badge lang-ru">🇷🇺 Русский</span>
                    </xsl:when>
                    <xsl:when test="contains(sitemap:loc, 'lang=pt')">
                      <span class="lang-badge lang-pt">🇵🇹 Português</span>
                    </xsl:when>
                    <xsl:when test="contains(sitemap:loc, 'lang=zh')">
                      <span class="lang-badge lang-zh">🇨🇳 中文</span>
                    </xsl:when>
                    <xsl:when test="contains(sitemap:loc, 'lang=el')">
                      <span class="lang-badge lang-el">🇬🇷 Ελληνικά</span>
                    </xsl:when>
                  </xsl:choose>
                </a>
                
                <div class="meta">
                  <div>
                    <!-- Badge de priorité -->
                    <xsl:choose>
                      <xsl:when test="sitemap:priority = '1.00'">
                        <span class="priority priority-high">Priorité: <xsl:value-of select="sitemap:priority" /></span>
                      </xsl:when>
                      <xsl:when test="sitemap:priority = '0.80' or sitemap:priority = '0.90'">
                        <span class="priority priority-medium">Priorité: <xsl:value-of select="sitemap:priority" /></span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="priority priority-low">Priorité: <xsl:value-of select="sitemap:priority" /></span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </div>
                  <div class="lastmod">
                    📅 <xsl:value-of select="substring(sitemap:lastmod, 1, 10)" />
                  </div>
                </div>
              </div>
            </xsl:for-each>
          </div>

          <div class="footer">
            <p>✨ Sitemap généré pour un portfolio multilingue respectant les standards SEO</p>
            <p>🌍 <xsl:value-of select="count(distinct-values(//sitemap:url/substring-after(sitemap:loc, 'lang=')))" /> langues supportées | 📊 <xsl:value-of select="count(//sitemap:url)" /> pages indexées</p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
