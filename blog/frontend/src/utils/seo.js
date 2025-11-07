// SEO Utility for Dynamic Meta Tag Updates

/**
 * Update page meta tags dynamically
 * @param {Object} seoData - SEO data object
 */
export function updateSEO(seoData) {
  const {
    title,
    description,
    keywords,
    url,
    image,
    type = 'article',
    publishedTime,
    modifiedTime,
    author = 'Darslinker',
    tags = []
  } = seoData;

  // Console logging for SEO application
  console.log('🔧 Applying SEO to page meta tags:');
  console.log('   📄 Title:', title);
  console.log('   📝 Description:', description);
  console.log('   🔍 Keywords:', keywords);
  console.log('   🔗 URL:', url);
  console.log('   🏷️ Tags:', tags);
  console.log('   📸 Image:', image);

  // Update page title
  document.title = title;
  console.log('   ✅ Page title updated');

  // Update or create meta tags
  updateMetaTag('name', 'description', description);
  updateMetaTag('name', 'keywords', keywords);
  updateMetaTag('name', 'author', author);
  updateMetaTag('name', 'robots', 'index, follow');

  console.log('   ✅ Meta tags updated (description, keywords, author, robots)');

  // Update canonical URL
  updateLinkTag('canonical', url);

  // Open Graph tags
  updateMetaTag('property', 'og:title', title);
  updateMetaTag('property', 'og:description', description);
  updateMetaTag('property', 'og:url', url);
  updateMetaTag('property', 'og:type', type);
  updateMetaTag('property', 'og:site_name', 'Darslinker');
  updateMetaTag('property', 'og:locale', 'uz_UZ');

  if (image) {
    updateMetaTag('property', 'og:image', image);
    updateMetaTag('property', 'og:image:width', '1200');
    updateMetaTag('property', 'og:image:height', '630');
  }

  // Article specific Open Graph tags
  if (type === 'article') {
    updateMetaTag('property', 'article:author', author);
    updateMetaTag('property', 'article:section', 'Ta\'lim');

    if (publishedTime) {
      updateMetaTag('property', 'article:published_time', publishedTime);
    }

    if (modifiedTime) {
      updateMetaTag('property', 'article:modified_time', modifiedTime);
    }

    // Article tags
    tags.forEach(tag => {
      updateMetaTag('property', 'article:tag', tag, true);
    });
  }

  // Twitter Card tags
  updateMetaTag('name', 'twitter:card', 'summary_large_image');
  updateMetaTag('name', 'twitter:title', title);
  updateMetaTag('name', 'twitter:description', description);
  updateMetaTag('name', 'twitter:url', url);

  if (image) {
    updateMetaTag('name', 'twitter:image', image);
    updateMetaTag('name', 'twitter:image:alt', title);
  }

  // Telegram specific tags
  updateMetaTag('property', 'telegram:channel', '@darslinker');
  updateMetaTag('name', 'telegram:card', 'summary_large_image');

  // Additional social media optimization
  updateMetaTag('property', 'og:image:alt', title);
  updateMetaTag('property', 'og:image:type', 'image/jpeg');
  updateMetaTag('name', 'format-detection', 'telephone=no');

  // Add structured data (JSON-LD)
  if (type === 'article') {
    addStructuredData(seoData);
  }
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(attribute, name, content, allowMultiple = false) {
  if (!content) {
    console.log(`   ⚠️ Skipping empty meta tag: ${name}`);
    return;
  }

  const selector = `meta[${attribute}="${name}"]`;
  let existingTag = document.querySelector(selector);

  if (existingTag && !allowMultiple) {
    existingTag.setAttribute('content', content);
    console.log(`   ✅ Updated existing meta tag: ${name} = "${content.substring(0, 50)}..."`);
  } else {
    const metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, name);
    metaTag.setAttribute('content', content);
    document.head.appendChild(metaTag);
    console.log(`   ✅ Created new meta tag: ${name} = "${content.substring(0, 50)}..."`);
  }

  // Special handling for keywords - verify they're applied
  if (name === 'keywords') {
    setTimeout(() => {
      const verifyTag = document.querySelector(selector);
      if (verifyTag && verifyTag.getAttribute('content') === content) {
        console.log(`   🔍 VERIFIED: Keywords applied successfully`);
        console.log(`   🔍 Current keywords in DOM:`, verifyTag.getAttribute('content'));
      } else {
        console.error(`   ❌ ERROR: Keywords not applied correctly!`);
      }
    }, 100);
  }
}

/**
 * Update canonical link tag
 */
function updateLinkTag(rel, href) {
  if (!href) return;

  let existingLink = document.querySelector(`link[rel="${rel}"]`);

  if (existingLink) {
    existingLink.setAttribute('href', href);
  } else {
    const linkTag = document.createElement('link');
    linkTag.setAttribute('rel', rel);
    linkTag.setAttribute('href', href);
    document.head.appendChild(linkTag);
  }
}

/**
 * Add structured data (JSON-LD) for articles
 */
function addStructuredData(seoData) {
  const {
    title,
    description,
    url,
    image,
    publishedTime,
    modifiedTime,
    author = 'Darslinker',
    tags = []
  } = seoData;

  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": url,
    "author": {
      "@type": "Organization",
      "name": author,
      "url": "https://darslinker.uz/blog"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Darslinker",
      "url": "https://darslinker.uz/blog",
      "logo": {
        "@type": "ImageObject",
        "url": "https://darslinker.uz/blog/og-image.jpg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };

  if (image) {
    structuredData.image = {
      "@type": "ImageObject",
      "url": image,
      "width": 1200,
      "height": 630
    };
  }

  if (publishedTime) {
    structuredData.datePublished = publishedTime;
  }

  if (modifiedTime) {
    structuredData.dateModified = modifiedTime;
  }

  if (tags.length > 0) {
    structuredData.keywords = tags.join(', ');
  }

  // Add to head
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData, null, 2);
  document.head.appendChild(script);
}

/**
 * Reset to default SEO (for homepage)
 */
export function resetToDefaultSEO() {
  updateSEO({
    title: 'Darslinker Blog - O\'qituvchilar uchun maqolalar',
    description: 'O\'qituvchilar uchun foydali maqolalar, pedagogik maslahatlar va ta\'lim sohasidagi eng so\'nggi yangiliklarni o\'qing. Video dars joylash, onlayn dars yaratish va o\'qituvchilar uchun platforma haqida ma\'lumotlar.',
    keywords: 'video dars joylash, onlayn dars joylash, onlayn dars yaratish, o\'qituvchilar uchun platforma, o\'quv markazi uchun platforma, onlayn dars yozish usullari, onlayn dars tayyorlash, video dars sotish, ta\'lim, o\'qituvchi, dars, maqola, pedagogika, metodika, Darslinker, blog',
    url: 'https://darslinker.uz/blog',
    type: 'website',
    image: 'https://darslinker.uz/og-image.jpg'
  });
}

/**
 * Debug function to check current SEO keywords on page
 * Call this in console: window.checkCurrentSEO()
 */
export function checkCurrentSEO() {
  console.log('🔍 Current SEO Analysis:');

  // Check page title
  console.log('📄 Page Title:', document.title);

  // Check meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  console.log('📝 Meta Description:', metaDesc ? metaDesc.getAttribute('content') : 'NOT FOUND');

  // Check meta keywords
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  console.log('🔍 Meta Keywords:', metaKeywords ? metaKeywords.getAttribute('content') : 'NOT FOUND');

  // Check canonical URL
  const canonical = document.querySelector('link[rel="canonical"]');
  console.log('🔗 Canonical URL:', canonical ? canonical.getAttribute('href') : 'NOT FOUND');

  // Check Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  console.log('📱 OG Title:', ogTitle ? ogTitle.getAttribute('content') : 'NOT FOUND');
  console.log('📱 OG Description:', ogDesc ? ogDesc.getAttribute('content') : 'NOT FOUND');

  // Check structured data
  const structuredData = document.querySelector('script[type="application/ld+json"]');
  console.log('📊 Structured Data:', structuredData ? 'FOUND' : 'NOT FOUND');

  return {
    title: document.title,
    description: metaDesc ? metaDesc.getAttribute('content') : null,
    keywords: metaKeywords ? metaKeywords.getAttribute('content') : null,
    canonical: canonical ? canonical.getAttribute('href') : null,
    hasStructuredData: !!structuredData
  };
}

// Make function available globally for console debugging
if (typeof window !== 'undefined') {
  window.checkCurrentSEO = checkCurrentSEO;
}

/**
 * Generate SEO data for article (Hybrid: Manual first, Auto fallback)
 */
export function generateArticleSEO(article) {
  const articleUrl = `https://darslinker.uz/blog?article=${article.id}`;

  // Get article tags
  const tags = article.tags ? article.tags.map(tag => tag.value || tag) : [];

  // HYBRID SEO LOGIC
  let title, description, keywords;

  // Debug: Show article SEO structure
  console.log('📋 Article SEO Debug for:', article.title);
  console.log('  - Article ID:', article.id);
  console.log('  - Has article.seo object:', !!article.seo);
  console.log('  - Full article object:', article);
  if (article.seo) {
    console.log('  - SEO keywords:', article.seo.keywords || 'NOT SET');
    console.log('  - SEO keywords type:', typeof article.seo.keywords);
    console.log('  - SEO keywords length:', article.seo.keywords ? article.seo.keywords.length : 'No keywords');
    console.log('  - Full SEO object:', article.seo);
    console.log('  - SEO canonicalUrl:', article.seo.canonicalUrl || 'NOT SET');
  } else {
    console.log('  - NO SEO OBJECT FOUND!');
  }
  console.log('  - Article tags:', tags);

  // 1. Check for MANUAL SEO fields first - now only requires keywords
  if (article.seo && article.seo.keywords && article.seo.keywords.length > 0) {
    // ✅ USE MANUAL SEO (Admin tomonidan kiritilgan)
    console.log('🎯 Using MANUAL SEO for:', article.title);
    title = `${article.title} - Darslinker Blog`;
    description = article.subtitle ||
      (article.sections && article.sections[0] && article.sections[0].content
        ? article.sections[0].content.substring(0, 155) + '...'
        : 'Darslinker blogida o\'qituvchilar uchun foydali maqola'
      );

    // Handle keywords - could be array, string, or undefined
    if (article.seo.keywords) {
      if (Array.isArray(article.seo.keywords)) {
        keywords = article.seo.keywords.length > 0
          ? article.seo.keywords.join(', ')
          : `${article.title}, ${tags.join(', ')}, ta'lim, o'qituvchi, dars, Darslinker`;
      } else if (typeof article.seo.keywords === 'string') {
        keywords = article.seo.keywords.trim() !== ''
          ? article.seo.keywords
          : `${article.title}, ${tags.join(', ')}, ta'lim, o'qituvchi, dars, Darslinker`;
      } else {
        keywords = `${article.title}, ${tags.join(', ')}, ta'lim, o'qituvchi, dars, Darslinker`;
      }
    } else {
      keywords = `${article.title}, ${tags.join(', ')}, ta'lim, o'qituvchi, dars, Darslinker`;
    }

    console.log('  ✅ MANUAL SEO Applied:');
    console.log('     - Title:', title);
    console.log('     - Description:', description);
    console.log('     - Keywords:', keywords);
    console.log('     - Keywords Type:', typeof article.seo.keywords);
    console.log('     - Keywords Raw:', article.seo.keywords);
  } else {
    // ⚡ USE AUTOMATIC SEO (fallback)
    console.log('⚡ Using AUTOMATIC SEO for:', article.title);
    console.log('   Reason: No SEO keywords found or empty');
    title = `${article.title} - Darslinker Blog`;
    description = article.subtitle ||
      (article.sections && article.sections[0] && article.sections[0].content
        ? article.sections[0].content.substring(0, 155) + '...'
        : 'Darslinker blogida o\'qituvchilar uchun foydali maqola'
      );
    keywords = `${article.title}, ${tags.join(', ')}, ta'lim, o'qituvchi, dars, Darslinker`;

    console.log('  ⚡ AUTOMATIC SEO Applied:');
    console.log('     - Title:', title);
    console.log('     - Description:', description);
    console.log('     - Keywords:', keywords);
  }

  return {
    title: title,
    description: description,
    keywords: keywords,
    url: article.seo && article.seo.canonicalUrl ? article.seo.canonicalUrl : articleUrl,
    type: 'article',
    publishedTime: article.createdAt,
    modifiedTime: article.updatedAt || article.createdAt,
    tags: tags,
    image: article.image || 'https://darslinker.uz/og-image.jpg'
  };
}