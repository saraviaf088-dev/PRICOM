import React, { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { CONFIG } from '../../config';
import { Heart, Eye, Scale, MessageCircle, Star, ShoppingBag, ImageIcon } from 'lucide-react';
import PropTypes from 'prop-types';

function ProductCard({ product }) {
  const {
    isInWishlist, toggleWishlist,
    isInComparator, toggleComparator,
    openProductDetail, openQuickView,
  } = useApp();

  const [imgError, setImgError] = useState(false);
  const [secondaryImgError, setSecondaryImgError] = useState(false);

  const isWish = isInWishlist(product.id);
  const isComp = isInComparator(product.id);

  const primaryImg = product.images[0];
  const secondaryImg = product.images[1] || product.images[0];

  const whatsappMessage = encodeURIComponent(
    `Hola PRICOM, estoy interesado en el producto *${product.name}* (Precio: Bs. ${product.price.toLocaleString('es-BO')}). ¿Podrían brindarme información y disponibilidad?`
  );

  const handleImageError = useCallback(() => setImgError(true), []);
  const handleSecondaryImageError = useCallback(() => setSecondaryImgError(true), []);

  return (
    <div className="product-card">
      {/* 1. Image Container */}
      <div
        className="product-card-image-container"
        onClick={() => openProductDetail(product)}
        role="button"
        tabIndex={0}
        aria-label={`Ver detalles de ${product.name}`}
        onKeyDown={(e) => { if (e.key === 'Enter') openProductDetail(product); }}
      >
        {imgError ? (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-muted)', gap: '0.5rem',
          }}>
            <ImageIcon size={40} />
            <span style={{ fontSize: '0.78rem' }}>Imagen no disponible</span>
          </div>
        ) : (
          <>
            <img
              src={primaryImg}
              alt={product.name}
              className="product-card-img primary"
              loading="lazy"
              onError={handleImageError}
            />
            {!secondaryImgError && (
              <img
                src={secondaryImg}
                alt={`${product.name} - Vista 2`}
                className="product-card-img secondary"
                loading="lazy"
                onError={handleSecondaryImageError}
              />
            )}
          </>
        )}

        {/* Badges */}
        <div className="product-card-badges">
          {product.discount > 0 && (
            <span className="badge badge-discount" aria-label={`Descuento ${product.discount}%`}>-{product.discount}%</span>
          )}
          {product.isOffer && (
            <span className="badge badge-oferta">Oferta</span>
          )}
          {product.isNew && (
            <span className="badge badge-celeste">Nuevo</span>
          )}
        </div>

        {/* Action buttons on card */}
        <div className="product-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`card-action-btn ${isWish ? 'active' : ''}`}
            onClick={() => toggleWishlist(product.id)}
            title={isWish ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}
            aria-label={isWish ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}
          >
            <Heart size={16} fill={isWish ? '#ffffff' : 'none'} />
          </button>

          <button
            className="card-action-btn"
            onClick={() => openQuickView(product)}
            title="Vista Rápida"
            aria-label="Vista rápida del producto"
          >
            <Eye size={16} />
          </button>

          <button
            className={`card-action-btn ${isComp ? 'compare-active' : ''}`}
            onClick={() => toggleComparator(product.id)}
            title={isComp ? 'Quitar de Comparador' : 'Comparar'}
            aria-label={isComp ? 'Quitar de Comparador' : 'Agregar al Comparador'}
          >
            <Scale size={16} />
          </button>
        </div>
      </div>

      {/* 2. Product Body */}
      <div className="product-card-body">
        <div className="product-card-brand">{product.brand}</div>

        <h3
          className="product-card-title"
          onClick={() => openProductDetail(product)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') openProductDetail(product); }}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="product-card-rating" aria-label={`Calificación ${product.rating} de 5`}>
          <Star size={13} fill="currentColor" />
          <span>{product.rating}</span>
          <span className="product-card-reviews">({product.reviewCount} opiniones)</span>
        </div>

        {/* Price Row */}
        <div className="product-card-prices">
          <span className="product-price-current">
            Bs. {product.price.toLocaleString('es-BO')}
          </span>
          {product.originalPrice && (
            <span className="product-price-original">
              Antes Bs. {product.originalPrice.toLocaleString('es-BO')}
            </span>
          )}
        </div>

        {/* Actions Footer */}
        <div className="product-card-footer">
          <button
            className="btn btn-primary btn-card-buy"
            onClick={() => openProductDetail(product)}
          >
            Ver Producto
          </button>

          <a
            href={`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="btn-card-whatsapp"
            title="Consultar disponibilidad por WhatsApp"
            aria-label="Consultar por WhatsApp"
          >
            <MessageCircle size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    brand: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    originalPrice: PropTypes.number,
    discount: PropTypes.number,
    isOffer: PropTypes.bool,
    isNew: PropTypes.bool,
    rating: PropTypes.number.isRequired,
    reviewCount: PropTypes.number.isRequired,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    material: PropTypes.string,
  }).isRequired,
};

export default React.memo(ProductCard);
