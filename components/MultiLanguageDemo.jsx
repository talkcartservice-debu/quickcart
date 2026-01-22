import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

const MultiLanguageDemo = () => {
  const { t, currentLanguage, isRTL } = useLanguage();

  // Apply RTL styles if needed
  const containerClass = isRTL() 
    ? 'text-right' 
    : 'text-left';

  return (
    <div className={`max-w-4xl mx-auto p-6 ${containerClass}`}>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {t('common.multi_language_demo')}
          </h2>
          <LanguageSelector />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Navigation Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              {t('navigation.navigation')}
            </h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-600 hover:text-blue-800">{t('navigation.home')}</a></li>
              <li><a href="#" className="text-blue-600 hover:text-blue-800">{t('navigation.shop')}</a></li>
              <li><a href="#" className="text-blue-600 hover:text-blue-800">{t('navigation.categories')}</a></li>
              <li><a href="#" className="text-blue-600 hover:text-blue-800">{t('navigation.about')}</a></li>
              <li><a href="#" className="text-blue-600 hover:text-blue-800">{t('navigation.contact')}</a></li>
            </ul>
          </div>

          {/* Product Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              {t('product.product_details')}
            </h3>
            <div className="space-y-2">
              <p><span className="font-medium">{t('product.price')}:</span> $99.99</p>
              <p><span className="font-medium">{t('product.availability')}:</span> {t('product.in_stock')}</p>
              <p><span className="font-medium">{t('product.rating')}:</span> 4.5 {t('reviews.stars', {count: 5})}</p>
              <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                {t('common.add_to_cart')}
              </button>
            </div>
          </div>

          {/* Cart Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              {t('cart.cart_title')}
            </h3>
            <div className="space-y-2">
              <p>{t('cart.items_in_cart', {count: 3})}</p>
              <p><span className="font-medium">{t('cart.subtotal')}:</span> $299.97</p>
              <p><span className="font-medium">{t('cart.shipping')}:</span> {t('cart.free_shipping')}</p>
              <p className="font-bold"><span className="font-medium">{t('cart.grand_total')}:</span> $299.97</p>
              <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                {t('cart.checkout_now')}
              </button>
            </div>
          </div>

          {/* Auth Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              {t('auth.login_title')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.email')}
                </label>
                <input 
                  type="email" 
                  placeholder={t('auth.enter_email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.password')}
                </label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                {t('auth.sign_in')}
              </button>
              <p className="text-center text-sm text-gray-600">
                {t('auth.no_account')}{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  {t('auth.sign_up')}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Current Language Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">
            {t('common.current_language_info')}
          </h3>
          <p className="text-blue-700">
            {t('common.currently_using')} <span className="font-bold">{currentLanguage.toUpperCase()}</span> {t('common.language')}
          </p>
          <p className="text-blue-700 mt-1">
            {t('common.direction')}: {isRTL() ? t('common.rtl') : t('common.ltr')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MultiLanguageDemo;