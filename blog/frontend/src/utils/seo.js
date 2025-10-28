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

  // Update page title
  document.title = title;

  // Update or create meta tags
  updateMetaTag('name', 'description', description);
  updateMetaTag('name', 'keywords', keywords);
  updateMetaTag('name', 'author', author);
  updateMetaTag('name', 'robots', 'index, follow');

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
  if (!content) return;

  const selector = `meta[${attribute}="${name}"]`;
  let existingTag = document.querySelector(selector);

  if (existingTag && !allowMultiple) {
    existingTag.setAttribute('content', content);
  } else {
    const metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, name);
    metaTag.setAttribute('content', content);
    document.head.appendChild(metaTag);
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
    url: 'https://darslinker.uz',
    type: 'website',
    image: 'https://darslinker.uz/og-image.jpg'
  });
}

/**
 * Generate SEO data for article (Hybrid: Manual first, Auto fallback)
 */
export function generateArticleSEO(article) {
  const articleUrl = `https://darslinker.uz?article=${article.id}`;

  // Get article tags
  const tags = article.tags ? article.tags.map(tag => tag.value || tag) : [];

  // HYBRID SEO LOGIC
  let title, description, keywords;

  // 1. Check for MANUAL SEO fields first
  if (article.seo && article.seo.metaTitle && article.seo.metaDescription) {
    // ✅ USE MANUAL SEO (Admin tomonidan kiritilgan)
    console.log('🎯 Using MANUAL SEO for:', article.title);
    title = article.seo.metaTitle;
    description = article.seo.metaDescription;
    keywords = article.seo.keywords && article.seo.keywords.length > 0
      ? article.seo.keywords.join(', ')
      : `${article.title}, ${tags.join(', ')}, ta'lim, o'qituvchi, dars, Darslinker`;
  } else {
    // ⚡ USE AUTOMATIC SEO (fallback)
    console.log('⚡ Using AUTOMATIC SEO for:', article.title);
    title = `${article.title} - Darslinker Blog`;
    description = article.subtitle ||
      (article.sections && article.sections[0] && article.sections[0].content
        ? article.sections[0].content.substring(0, 155) + '...'
        : 'Darslinker blogida o\'qituvchilar uchun foydali maqola'
      );
    keywords = `${article.title}, ${tags.join(', ')}, ta'lim, o'qituvchi, dars, Darslinker`;
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