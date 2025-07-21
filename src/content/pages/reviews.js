/**
 * Reviews Widget - JavaScript Injection System
 * Collection ID: 14
 * Generated: 2025-07-15T23:41:26.273479Z
 */

(function() {
    'use strict';

    // Widget configuration
    const WIDGET_CONFIG = {
        collectionToken: "po5MsFdf0PoefwN6dsTEhPDiwajRVLko",
        apiBase: "https:\/\/app.reviewconnect.me",
        containerId: 'reviews-widget-14',
        theme: "light",
        showPhotos: true,
        showRatings: true,
        showDates: false,
        showAuthorPhotos: true,
        showLeaveReviewButton: false,
        enableReviewSchema: true
    };

    // HTML escaping function to prevent XSS
    function escapeHtml(text) {
        if (text == null) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    // URL validation function
    function isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    // Main widget class
    class ReviewsWidget {
        constructor(config) {
            this.config = config;
            this.container = null;
            this.data = null;
            this.isLoaded = false;
        }

        // Initialize the widget
        init() {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.load());
            } else {
                this.load();
            }
        }

        // Load widget data and render
        async load() {
            try {
                // Find or create container
                this.container = document.getElementById(this.config.containerId);
                if (!this.container) {
                    console.error(`Reviews Widget: Container #${this.config.containerId} not found`);
                    return;
                }

                // Add loading state
                this.container.innerHTML = this.getLoadingHTML();
                this.container.className = `reviews-widget reviews-widget--loading reviews-widget--${this.config.theme}`;

                // Load CSS if not already loaded
                this.loadCSS();

                // Fetch review data
                const response = await fetch(`${this.config.apiBase}/embed/${this.config.collectionToken}/data`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                this.data = await response.json();
                
                // Log widget load (fire and forget)
                this.logWidgetLoad();

                // Render the widget
                this.render();
                this.isLoaded = true;

            } catch (error) {
                console.error('Reviews Widget Error:', error);
                this.renderError(error.message);
            }
        }

        // Load widget CSS
        loadCSS() {
            const cssId = 'reviews-widget-css';
            if (!document.getElementById(cssId)) {
                const link = document.createElement('link');
                link.id = cssId;
                link.rel = 'stylesheet';
                link.href = `${this.config.apiBase}/embed/widget.css`;
                document.head.appendChild(link);
            }
        }

        // Log widget load for analytics
        logWidgetLoad() {
            try {
                fetch(`${this.config.apiBase}/embed/${this.config.collectionToken}/log`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        event: 'widget_load',
                        timestamp: new Date().toISOString(),
                        user_agent: navigator.userAgent,
                        referrer: document.referrer || null
                    })
                }).catch(() => {
                    // Silently fail - analytics shouldn't break the widget
                });
            } catch (error) {
                // Silently fail - analytics shouldn't break the widget
            }
        }

        // Render the complete widget
        render() {
            const { collection, location, reviews } = this.data;

            // Apply layout and theme classes
            const layoutClass = collection.layout ? `reviews-widget--${collection.layout}` : 'reviews-widget--list';
            this.container.className = `reviews-widget reviews-widget--${collection.theme} ${layoutClass}`;
            
            // Remove fixed width - let the container be responsive
            this.container.style.width = '100%';
            this.container.style.height = 'auto';

            this.container.innerHTML = `
                <div class="reviews-widget__inner">
                    ${this.renderHeader(location, reviews.length)}
                    ${this.renderReviews(reviews, collection.layout)}
                    ${this.renderFooter()}
                </div>
            `;

            // Add event listeners
            this.attachEvents();
            
            // Initialize carousel if needed
            if (collection.layout === 'carousel') {
                this.initCarousel();
            }
            
            // Generate schema markup if enabled
            if (this.config.enableReviewSchema && collection.enable_review_schema) {
                this.generateSchema();
            }
        }

        // Render header with overall stats
        renderHeader(location, reviewCount) {
            const businessInfo = this.renderBusinessInfo();
            const leaveReviewButton = this.renderLeaveReviewButton();
            return `
                <div class="reviews-widget__header">
                    <div class="reviews-widget__header-content">
                        <div class="reviews-widget__summary">
                            <h3 class="reviews-widget__title">${escapeHtml(location.name)}</h3>
                            <div class="reviews-widget__rating">
                                ${this.renderStars(location.average_rating)}
                                <span class="reviews-widget__rating-text">
                                    ${location.average_rating.toFixed(1)}
                                </span>
                                <span class="reviews-widget__count">
                                    (${parseInt(location.total_reviews, 10)})
                                </span>
                            </div>
                            ${businessInfo}
                        </div>
                        ${leaveReviewButton}
                    </div>
                </div>
            `;
        }

        // Render business information
        renderBusinessInfo() {
            const { collection, location } = this.data;
            
            if (!collection.show_phone || !location.phone_number) {
                return '';
            }

            return `
                <div class="reviews-widget__business-info">
                    <a href="tel:${escapeHtml(location.phone_number)}" class="reviews-widget__business-phone">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        <span>${escapeHtml(location.phone_number)}</span>
                    </a>
                </div>
            `;
        }

        // Render leave review button
        renderLeaveReviewButton() {
            const { collection } = this.data;
            
            if (!collection.show_leave_review_button || !collection.google_review_url) {
                return '';
            }

            return `
                <div class="reviews-widget__leave-review">
                    <a href="${escapeHtml(collection.google_review_url)}" target="_blank" rel="noopener noreferrer" class="reviews-widget__leave-review-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span>Leave a Review</span>
                    </a>
                </div>
            `;
        }

        // Render reviews list
        renderReviews(reviews, layout = 'list') {
            if (!reviews || reviews.length === 0) {
                return `
                    <div class="reviews-widget__empty">
                        <p>No reviews to display.</p>
                    </div>
                `;
            }

            const reviewsHTML = reviews.map(review => this.renderReview(review)).join('');
            
            let reviewsContainer;
            
            if (layout === 'carousel') {
                reviewsContainer = `
                    <div class="reviews-widget__reviews">
                        <div class="reviews-widget__reviews-container">
                            ${reviewsHTML}
                        </div>
                        ${this.renderCarouselNavigation(reviews.length)}
                    </div>
                `;
            } else {
                reviewsContainer = `
                    <div class="reviews-widget__reviews">
                        <div class="reviews-widget__reviews-container">
                            ${reviewsHTML}
                        </div>
                    </div>
                `;
            }
            
            return reviewsContainer;
        }

        // Render individual review
        renderReview(review) {
            const authorName = review.author_name || 'Anonymous';
            const escapedAuthorName = escapeHtml(authorName);
            const authorPhoto = this.config.showAuthorPhotos && review.author_photo && isValidUrl(review.author_photo)
                ? `<img class="reviews-widget__author-photo" src="${escapeHtml(review.author_photo)}" alt="${escapedAuthorName}" loading="lazy">`
                : `<div class="reviews-widget__author-avatar">${escapedAuthorName.charAt(0).toUpperCase()}</div>`;

            const reviewDate = this.config.showDates 
                ? `<span class="reviews-widget__date">${escapeHtml(review.review_date_human)}</span>`
                : '';

            const rating = this.config.showRatings 
                ? `<div class="reviews-widget__review-rating">${this.renderStars(review.rating)}</div>`
                : '';

            const googleLink = review.review_url ? `
                <div class="reviews-widget__review-source">
                    <a href="${escapeHtml(review.review_url)}" target="_blank" rel="noopener noreferrer" class="reviews-widget__google-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span>View on Google</span>
                    </a>
                </div>
            ` : '';

            return `
                <div class="reviews-widget__review" data-review-id="${parseInt(review.id, 10)}">
                    ${rating}
                    <div class="reviews-widget__review-header">
                        <div class="reviews-widget__author">
                            ${authorPhoto}
                            <div class="reviews-widget__author-info">
                                <span class="reviews-widget__author-name">${escapedAuthorName}</span>
                                ${reviewDate}
                            </div>
                        </div>
                    </div>
                    ${review.review_text ? `<div class="reviews-widget__review-text">${escapeHtml(review.review_text)}</div>` : ''}
                    ${googleLink}
                </div>
            `;
        }

        // Render star rating
        renderStars(rating) {
            if (!this.config.showRatings) return '';

            const fullStars = Math.floor(rating);
            const partialStar = rating - fullStars;
            const emptyStars = 5 - fullStars - (partialStar > 0 ? 1 : 0);

            let starsHTML = '';

            // Full stars
            for (let i = 0; i < fullStars; i++) {
                starsHTML += `
                    <span class="reviews-widget__star reviews-widget__star--full">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </span>`;
            }

            // Partial star
            if (partialStar > 0) {
                const fillPercent = partialStar * 100;
                starsHTML += `
                    <span class="reviews-widget__star reviews-widget__star--partial">
                        <svg width="12" height="12" viewBox="0 0 24 24">
                            <defs>
                                <linearGradient id="partial-star-${this.config.containerId}-${fullStars}">
                                    <stop offset="${fillPercent}%" stop-color="#fbbf24"/>
                                    <stop offset="${fillPercent}%" stop-color="#d1d5db"/>
                                </linearGradient>
                            </defs>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#partial-star-${this.config.containerId}-${fullStars})"/>
                        </svg>
                    </span>`;
            }

            // Empty stars
            for (let i = 0; i < emptyStars; i++) {
                starsHTML += `
                    <span class="reviews-widget__star reviews-widget__star--empty">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </span>`;
            }

            return `<div class="reviews-widget__stars" title="${rating} out of 5 stars">${starsHTML}</div>`;
        }

        // Render footer
        renderFooter() {
            return `
                <div class="reviews-widget__footer">
                    <div class="reviews-widget__powered-by">
                    </div>
                </div>
            `;
        }

        // Generate JSON-LD schema markup
        generateSchema() {
            const { collection, location, reviews } = this.data;
            
            // Don't generate schema if already exists
            const existingSchema = document.querySelector('script[type="application/ld+json"]');
            if (existingSchema) return;
            
            const schema = {
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                "name": location.name,
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": location.average_rating.toFixed(1),
                    "bestRating": "5",
                    "worstRating": "1",
                    "ratingCount": location.total_reviews
                },
                "review": reviews.map(review => {
                    const reviewSchema = {
                        "@type": "Review",
                        "author": {
                            "@type": "Person",
                            "name": review.author_name || 'Anonymous'
                        },
                        "reviewRating": {
                            "@type": "Rating",
                            "ratingValue": review.rating,
                            "bestRating": "5",
                            "worstRating": "1"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "ReviewConnect"
                        }
                    };
                    
                    if (review.review_text) {
                        reviewSchema.reviewBody = review.review_text;
                    }
                    
                    if (review.review_date_human) {
                        // Convert human date to ISO format for schema
                        try {
                            const date = new Date(review.review_date_human);
                            if (!isNaN(date.getTime())) {
                                reviewSchema.datePublished = date.toISOString().split('T')[0];
                            }
                        } catch (e) {
                            // Ignore date parsing errors
                        }
                    }
                    
                    return reviewSchema;
                })
            };
            
            // Add comprehensive business information
            if (location.address) {
                schema.address = {
                    "@type": "PostalAddress",
                    "streetAddress": location.address
                };
            }
            
            if (location.latitude && location.longitude) {
                schema.geo = {
                    "@type": "GeoCoordinates",
                    "latitude": location.latitude,
                    "longitude": location.longitude
                };
            }
            
            if (location.phone_number) {
                schema.telephone = location.phone_number;
            }
            
            if (location.website) {
                schema.url = location.website;
            }
            
            if (location.business_hours && Array.isArray(location.business_hours) && location.business_hours.length > 0) {
                schema.openingHours = location.business_hours;
            }
            
            if (location.price_level) {
                const priceRanges = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };
                schema.priceRange = priceRanges[location.price_level] || "$$";
            }
            
            if (location.photo_urls && Array.isArray(location.photo_urls) && location.photo_urls.length > 0) {
                schema.image = location.photo_urls[0];
            }
            
            // Create and inject schema script
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(schema, null, 2);
            document.head.appendChild(script);
        }

        // Render loading state
        getLoadingHTML() {
            return `
                <div class="reviews-widget__loading">
                    <div class="reviews-widget__spinner"></div>
                    <span>Loading reviews...</span>
                </div>
            `;
        }

        // Render error state
        renderError(message) {
            this.container.className = `reviews-widget reviews-widget--error reviews-widget--${this.config.theme}`;
            this.container.innerHTML = `
                <div class="reviews-widget__error">
                    <span>Unable to load reviews: ${message}</span>
                </div>
            `;
        }

        // Attach event listeners
        attachEvents() {
            // No additional event listeners needed - Google links handle their own clicks
        }

        // Handle review click
        onReviewClick(reviewId) {
            // Could implement modal, highlight, etc.
            console.log('Review clicked:', reviewId);
        }

        // Helper method to detect mobile devices
        isMobileDevice() {
            return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        }

        // Render carousel navigation with mobile detection
        renderCarouselNavigation(reviewCount) {
            const showArrows = !this.isMobileDevice();
            
            return `
                <div class="reviews-widget__carousel-nav" style="${showArrows ? '' : 'display: none;'}">
                    <button class="reviews-widget__carousel-btn reviews-widget__carousel-btn--prev" data-direction="prev">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                    </button>
                    <button class="reviews-widget__carousel-btn reviews-widget__carousel-btn--next" data-direction="next">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </button>
                </div>
                <div class="reviews-widget__carousel-dots"></div>
            `;
        }

        // Initialize carousel functionality
        initCarousel() {
            this.currentSlide = 0;
            this.carouselContainer = this.container.querySelector('.reviews-widget__reviews-container');
            this.isAnimating = false;
            this.touchStartX = 0;
            this.touchCurrentX = 0;
            this.isDragging = false;
            
            if (!this.carouselContainer) return;
            
            // Set up carousel container
            this.carouselContainer.style.display = 'flex';
            this.carouselContainer.style.transition = 'none';
            this.carouselContainer.style.willChange = 'transform';
            
            // Calculate layout parameters
            this.itemsPerSlide = this.getItemsPerSlide();
            this.totalSlides = Math.ceil(this.data.reviews.length / this.itemsPerSlide);
            
            // Set initial positioning
            this.setupCarouselItems();
            
            // Initialize navigation
            this.createCarouselDots();
            this.setupCarouselControls();
            this.addTouchSupport();
            this.addResizeListener();
            this.updateCarouselNavigation();
        }

        // Get responsive items per slide
        getItemsPerSlide() {
            if (!this.carouselContainer) return 1;
            
            const containerWidth = this.carouselContainer.parentElement.offsetWidth;
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            
            // 5 columns for screens bigger than 1600px
            if (containerWidth >= 1600) return 5;
            
            // 4 columns for devices below 1600px (desktop)
            if (containerWidth >= 1024) return 4;
            
            // 3 columns for tablet
            if (containerWidth >= 768) return 3;
            
            // 2 columns for landscape mobile (detect landscape orientation)
            if (containerWidth >= 500 && windowWidth > windowHeight) return 2;
            
            // 1 column for mobile portrait
            return 1;
        }

        // Setup carousel items with proper sizing
        setupCarouselItems() {
            const reviews = this.carouselContainer.querySelectorAll('.reviews-widget__review');
            if (reviews.length === 0) return;

            // Set CSS custom properties for automatic width calculation
            this.carouselContainer.style.setProperty('--items-per-slide', this.itemsPerSlide);
            this.carouselContainer.style.setProperty('--carousel-gap', '20px');

            // Let CSS handle the width calculation automatically
            reviews.forEach((review, index) => {
                // Remove any predefined width - let CSS calc() handle it
                review.style.width = '';
                review.style.flexShrink = '0';
                review.style.flexGrow = '0';
                review.style.marginLeft = '0';
                
                // On mobile (1 item per slide), no margin needed except between items
                if (this.itemsPerSlide === 1) {
                    review.style.marginRight = index < reviews.length - 1 ? '20px' : '0';
                } else {
                    // For desktop, let CSS handle margin with :last-child
                    review.style.marginRight = '';
                }
            });

            // Position carousel to current slide
            this.updateCarouselPosition();
        }

        // Setup carousel control buttons
        setupCarouselControls() {
            const prevBtn = this.container.querySelector('.reviews-widget__carousel-btn--prev');
            const nextBtn = this.container.querySelector('.reviews-widget__carousel-btn--next');
            
            if (prevBtn) prevBtn.addEventListener('click', () => this.previousSlide());
            if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Update carousel position with smooth animation
        updateCarouselPosition(animate = true) {
            if (!this.carouselContainer || this.isAnimating) return;
            
            const reviews = this.carouselContainer.querySelectorAll('.reviews-widget__review');
            if (reviews.length === 0) return;

            // Use DOM measurements for drift-free positioning
            const targetItemIndex = this.currentSlide * this.itemsPerSlide;
            const targetItem = reviews[targetItemIndex];
            
            let slideOffset = 0;
            if (targetItem) {
                // Use actual DOM position to prevent drift
                slideOffset = targetItem.offsetLeft;
            }
            
            if (animate) {
                this.isAnimating = true;
                this.carouselContainer.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                
                // Use transform for smooth animation
                this.carouselContainer.style.transform = `translateX(-${slideOffset}px)`;
                
                // Reset animation flag after transition
                setTimeout(() => {
                    this.isAnimating = false;
                }, 300);
            } else {
                this.carouselContainer.style.transition = 'none';
                this.carouselContainer.style.transform = `translateX(-${slideOffset}px)`;
            }
        }

        // Navigation methods
        previousSlide() {
            if (this.isAnimating || this.currentSlide <= 0) return;
            
            this.currentSlide--;
            this.updateCarouselPosition(true);
            this.updateCarouselNavigation();
        }

        nextSlide() {
            if (this.isAnimating || this.currentSlide >= this.totalSlides - 1) return;
            
            this.currentSlide++;
            this.updateCarouselPosition(true);
            this.updateCarouselNavigation();
        }

        goToSlide(slideIndex) {
            if (this.isAnimating || slideIndex < 0 || slideIndex >= this.totalSlides || slideIndex === this.currentSlide) return;
            
            this.currentSlide = slideIndex;
            this.updateCarouselPosition(true);
            this.updateCarouselNavigation();
        }

        // Update navigation states and mobile visibility
        updateCarouselNavigation() {
            // Update arrow visibility based on screen size
            const carouselNav = this.container.querySelector('.reviews-widget__carousel-nav');
            if (carouselNav) {
                carouselNav.style.display = this.isMobileDevice() ? 'none' : '';
            }

            // Update button states
            const prevBtn = this.container.querySelector('.reviews-widget__carousel-btn--prev');
            const nextBtn = this.container.querySelector('.reviews-widget__carousel-btn--next');
            
            if (prevBtn) prevBtn.disabled = this.currentSlide === 0;
            if (nextBtn) nextBtn.disabled = this.currentSlide >= this.totalSlides - 1;
            
            // Update dots
            this.updateDots();
        }

        // Dot management
        createCarouselDots() {
            const dotsContainer = this.container.querySelector('.reviews-widget__carousel-dots');
            if (!dotsContainer) return;
            
            this.maxDots = 8;
            
            if (this.totalSlides <= this.maxDots) {
                this.renderAllDots(dotsContainer);
            } else {
                this.updateSlidingDots();
            }
        }

        renderAllDots(dotsContainer) {
            const dots = Array.from({length: this.totalSlides}, (_, i) => 
                `<div class="reviews-widget__carousel-dot ${i === 0 ? 'reviews-widget__carousel-dot--active' : ''}" data-slide="${i}"></div>`
            ).join('');
            
            dotsContainer.innerHTML = dots;
            
            dotsContainer.querySelectorAll('.reviews-widget__carousel-dot').forEach((dot, index) => {
                dot.addEventListener('click', () => this.goToSlide(index));
            });
        }

        updateDots() {
            if (this.totalSlides <= this.maxDots) {
                const dots = this.container.querySelectorAll('.reviews-widget__carousel-dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('reviews-widget__carousel-dot--active', index === this.currentSlide);
                });
            } else {
                this.updateSlidingDots();
            }
        }

        updateSlidingDots() {
            const dotsContainer = this.container.querySelector('.reviews-widget__carousel-dots');
            if (!dotsContainer) return;
            
            const halfWindow = Math.floor(this.maxDots / 2);
            let startSlide = Math.max(0, this.currentSlide - halfWindow);
            let endSlide = Math.min(this.totalSlides - 1, startSlide + this.maxDots - 1);
            
            if (endSlide - startSlide < this.maxDots - 1) {
                startSlide = Math.max(0, endSlide - this.maxDots + 1);
            }
            
            const dots = Array.from({length: endSlide - startSlide + 1}, (_, i) => {
                const slideIndex = startSlide + i;
                const isActive = slideIndex === this.currentSlide;
                return `<div class="reviews-widget__carousel-dot ${isActive ? 'reviews-widget__carousel-dot--active' : ''}" data-slide="${slideIndex}"></div>`;
            }).join('');
            
            dotsContainer.innerHTML = dots;
            
            dotsContainer.querySelectorAll('.reviews-widget__carousel-dot').forEach((dot) => {
                const slideIndex = parseInt(dot.dataset.slide);
                dot.addEventListener('click', () => this.goToSlide(slideIndex));
            });
        }

        // Responsive handling
        addResizeListener() {
            let resizeTimeout;
            
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    const oldItemsPerSlide = this.itemsPerSlide;
                    this.itemsPerSlide = this.getItemsPerSlide();
                    
                    if (oldItemsPerSlide !== this.itemsPerSlide) {
                        this.totalSlides = Math.ceil(this.data.reviews.length / this.itemsPerSlide);
                        this.currentSlide = Math.min(this.currentSlide, this.totalSlides - 1);
                        this.createCarouselDots();
                    }
                    
                    // Recalculate and reposition
                    this.setupCarouselItems();
                    this.updateCarouselNavigation();
                }, 250);
            });
        }

        // Touch/swipe support
        addTouchSupport() {
            if (!this.carouselContainer) return;
            
            let startX = 0;
            let currentX = 0;
            let isDragging = false;
            let startTime = 0;

            const handleStart = (e) => {
                if (this.isAnimating) return;
                
                isDragging = true;
                startTime = Date.now();
                startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
                currentX = startX;
                
                this.carouselContainer.style.transition = 'none';
                this.carouselContainer.style.cursor = 'grabbing';
            };
            
            const handleMove = (e) => {
                if (!isDragging || this.isAnimating) return;
                
                e.preventDefault();
                currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
                
                const diff = currentX - startX;
                const reviews = this.carouselContainer.querySelectorAll('.reviews-widget__review');
                const targetItemIndex = this.currentSlide * this.itemsPerSlide;
                const targetItem = reviews[targetItemIndex];
                
                let slideOffset = 0;
                if (targetItem) {
                    slideOffset = targetItem.offsetLeft;
                }
                
                // Apply drag with resistance at boundaries
                let dragOffset = diff;
                if (this.currentSlide === 0 && diff > 0) {
                    dragOffset = diff * 0.3; // Resistance at start
                } else if (this.currentSlide === this.totalSlides - 1 && diff < 0) {
                    dragOffset = diff * 0.3; // Resistance at end
                }
                
                this.carouselContainer.style.transform = `translateX(${-slideOffset + dragOffset}px)`;
            };
            
            const handleEnd = (e) => {
                if (!isDragging) return;
                
                isDragging = false;
                this.carouselContainer.style.cursor = 'grab';
                
                const endX = e.type === 'mouseup' ? e.clientX : e.changedTouches[0].clientX;
                const diff = endX - startX;
                const duration = Date.now() - startTime;
                
                // Determine if it's a swipe based on distance and velocity
                const threshold = 50;
                const velocity = Math.abs(diff) / duration;
                const isSwipe = Math.abs(diff) > threshold || velocity > 0.3;
                
                if (isSwipe) {
                    if (diff > 0) {
                        this.previousSlide();
                    } else {
                        this.nextSlide();
                    }
                } else {
                    // Snap back to current position
                    this.updateCarouselPosition(true);
                }
            };
            
            // Event listeners
            this.carouselContainer.addEventListener('mousedown', handleStart);
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
            
            this.carouselContainer.addEventListener('touchstart', handleStart, { passive: false });
            this.carouselContainer.addEventListener('touchmove', handleMove, { passive: false });
            this.carouselContainer.addEventListener('touchend', handleEnd);
            
            // Prevent default drag behavior on images
            this.carouselContainer.addEventListener('dragstart', (e) => e.preventDefault());
        }

        // Public API methods
        refresh() {
            if (this.isLoaded) {
                this.load();
            }
        }

        destroy() {
            if (this.container) {
                this.container.innerHTML = '';
                this.container.className = '';
            }
        }
    }

    // Initialize widget
    const widget = new ReviewsWidget(WIDGET_CONFIG);
    widget.init();

    // Expose widget instance globally for debugging/API access
    window.ReviewsWidget_14 = widget;

})();