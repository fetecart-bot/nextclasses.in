import { useState } from 'react';
import { Sparkles, Download, Check, Star, FileText, Layers, ExternalLink, Zap, Eye } from 'lucide-react';
import { AIProduct, ProductCategory, CartItem } from '../types';

interface ProductCatalogProps {
  products: AIProduct[];
  onAddToCart: (item: CartItem) => void;
  onInstantBuy: (item: CartItem) => void;
  onOpenAdmin?: () => void;
}

export default function ProductCatalog({ products, onAddToCart, onInstantBuy, onOpenAdmin }: ProductCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [previewProduct, setPreviewProduct] = useState<AIProduct | null>(null);

  const categories: { id: ProductCategory; label: string }[] = [
    { id: 'all', label: 'All Products' },
    { id: 'prompts', label: 'Prompt Vaults' },
    { id: 'toolkits', label: 'Educator Systems' },
    { id: 'ebooks', label: 'eBooks & Guides' },
    { id: 'templates', label: 'Templates' },
  ];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <section id="products" className="py-20 sm:py-28 bg-neutral-900 text-white border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Download className="w-3.5 h-3.5" />
              <span>Instant Digital Access</span>
            </div>
            <h2 id="products-section-title" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              AI Toolkits, Prompts & Digital Systems
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
              Curated, plug-and-play digital assets designed to save you hundreds of hours. Delivered instantly with lifetime updates.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>1-Click Notion Duplication & PDF Downloads</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-8">
          <div id="product-category-tabs" className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`product-tab-${cat.id}`}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-neutral-950 shadow-md'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div id="product-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const discountPercent =
              product.originalPrice && product.originalPrice > product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

            return (
              <div
                key={product.id}
                id={product.id}
                className="group rounded-2xl bg-neutral-950 border border-neutral-800 overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-all duration-300 shadow-xl"
              >
                <div>
                  {/* Image Preview */}
                  <div className="relative aspect-16/10 overflow-hidden bg-neutral-800">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-neutral-950/90 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                        {product.badge || 'Digital Asset'}
                      </span>
                      {discountPercent > 0 && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 text-[11px] font-semibold border border-emerald-800">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-neutral-300">
                      <span className="font-mono text-neutral-300">{product.fileType}</span>
                      <span className="text-neutral-400">{product.downloadsCount.toLocaleString()}+ downloads</span>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-6 space-y-4">
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-neutral-500 font-normal">Rating</span>
                    </div>

                    {/* Title & Tagline */}
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight leading-snug group-hover:text-amber-300 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-xs text-neutral-300 mt-2 line-clamp-2 leading-relaxed">
                        {product.tagline}
                      </p>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-1.5 text-xs text-neutral-400 pt-1">
                      {product.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                    </ul>

                  </div>
                </div>

                {/* Footer and Cart CTA */}
                <div className="p-6 pt-0 mt-2 border-t border-neutral-800/80">
                  <div className="pt-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-white">₹{product.price}</span>
                        <span className="text-xs line-through text-neutral-500">₹{product.originalPrice}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 block">{product.format.split('+')[0]}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewProduct(product)}
                        className="p-2 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-700 transition-colors cursor-pointer"
                        title="Preview Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onAddToCart({
                          id: product.id,
                          itemType: 'product',
                          title: product.title,
                          price: product.price,
                          originalPrice: product.originalPrice,
                          thumbnail: product.thumbnail,
                          format: product.format,
                          category: product.category,
                        })}
                        className="px-4 py-2 rounded-lg bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-200 transition-all shadow-sm cursor-pointer"
                      >
                        Get Tool
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Product Preview Modal */}
        {previewProduct && (
          <div
            id="product-preview-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-2xl rounded-2xl bg-neutral-950 border border-neutral-800 p-6 sm:p-8 space-y-6 text-white shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {previewProduct.format}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-2">{previewProduct.title}</h3>
                  <p className="text-sm text-neutral-300 mt-1">{previewProduct.tagline}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewProduct(null)}
                  className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 text-lg leading-none cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {previewProduct.previewSnippet && (
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Inside this product
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {previewProduct.previewSnippet}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Full Feature Highlights
                </span>
                <ul className="space-y-2 text-sm text-neutral-300">
                  {previewProduct.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">₹{previewProduct.price}</span>
                    <span className="text-sm line-through text-neutral-500">₹{previewProduct.originalPrice}</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">Instant Digital Delivery via Email & Portal</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviewProduct(null)}
                    className="px-4 py-2.5 rounded-xl bg-neutral-900 text-neutral-300 text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart({
                        id: previewProduct.id,
                        itemType: 'product',
                        title: previewProduct.title,
                        price: previewProduct.price,
                        originalPrice: previewProduct.originalPrice,
                        thumbnail: previewProduct.thumbnail,
                        format: previewProduct.format,
                        category: previewProduct.category,
                      });
                      setPreviewProduct(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity shadow-md cursor-pointer"
                  >
                    Add to Cart & Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
