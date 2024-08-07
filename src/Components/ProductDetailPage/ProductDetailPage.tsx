import classNames from 'classnames';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { getDetailedItems } from '../../api/DetailedProduct';
import { getProductsItems } from '../../api/Products';
import { ProductContext } from '../../store/ProductContext';
import { Product } from '../../types/Product';
import { ProductGeneral } from '../../types/ProductGeneral';
import { getHotPrices } from '../../utils/getHotPrices';
import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs';
import { ProductsSlider } from '../ProductsSlider';
import { AvailableColors } from './AvailableProperties/AvailableColors';
import { CapacityAvailable } from './CapacityAvailable/CapacityAvailable';
import './ProductDetailPage.scss';
import { SliderPhotos } from './SliderPhotos/SliderPhotos';
import { NotFoundProduct } from '../NotFoundProduct';
import { Loader } from '../Loader';

export const ProductDetailPage = () => {
  const {} = useParams();
  const {} = useLocation();
  const {
    onLoading,
    loading,
    selectedProduct,
    selectedImg,
    phones,
    inFavourites,
    addProductToFavourites,
    addProductToCart,
    removeProductFromCart,
    inCart,
  } = useContext(ProductContext);
  const [element, setElement] = useState<Product>();
  const [generalElement, setGeneralElement] = useState<ProductGeneral>();
  const youMayAlsoLike = getHotPrices(phones);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [productNotFound, setProductNotFound] = useState(false);
  const { pathname } = useLocation();

  const cellElements = element?.cell.join(', ').slice(0, -1);
  const handlePathNameProduct = useCallback(async () => {
    const pathNameElements = pathname.split('/');
    const [category, id] = [pathNameElements[1], pathNameElements[2]];

    if (category && id) {
      const products = await getDetailedItems(category);
      const generalProducts = await getProductsItems();
      const newElem = products.find(product => product.id === id);
      const newGeneralElement = generalProducts.find(
        product => product.itemId === id,
      );

      if (newGeneralElement) {
        setGeneralElement(newGeneralElement);
      }

      if (newElem) {
        setElement(newElem);
      }

      if (!newElem && !newGeneralElement) {
        setProductNotFound(true);
      } else {
        setProductNotFound(false);
      }
    }
  }, [pathname]);

  useEffect(() => {
    const updateGeneralElement = async () => {
      if (selectedProduct) {
        try {
          const generalProducts = await getProductsItems();
          const newGeneralElement = generalProducts.find(
            product => product.itemId === selectedProduct.id,
          );

          if (newGeneralElement) {
            setGeneralElement(newGeneralElement);
          }
        } finally {
          setTimeout(() => onLoading(false), 500);
        }
      }
    };

    updateGeneralElement();
  }, [selectedProduct, onLoading]);

  useEffect(() => {
    if (!selectedProduct || !generalElement || !element) {
      handlePathNameProduct();
    } else {
      setElement(selectedProduct);
    }
  }, [
    handlePathNameProduct,
    pathname,
    selectedProduct,
    onLoading,
    generalElement,
    element,
  ]);

  const checkItemInCart = (card: ProductGeneral) => {
    return inCart.find(product => product.id === card.id);
  };

  const checkLikedItem = (card: ProductGeneral) => {
    return inFavourites.find(prod => prod === card);
  };

  const handleAddButton = (product: ProductGeneral) => {
    const valueInCart = inCart.find(val => val.id === product.id);

    if (!valueInCart) {
      addProductToCart(product);
    } else {
      removeProductFromCart(product);
    }
  };

  useEffect(() => {
    if (!element || !generalElement) {
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      return;
    }
  }, [element, generalElement]);

  if (shouldRedirect) {
    return <Navigate to="/" />;
  }

  if (productNotFound) {
    return <NotFoundProduct />;
  }

  if (!element || !generalElement) {
    return;
  }

  const elementParts = element.name.split(' ');
  const name = elementParts.slice(0, -1).join(' ');
  const color = elementParts[elementParts.length - 1];

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="details__wrapper container">
          <Breadcrumbs />
          <div className="details">
            <h1 className="details__title">
              {name}
              <br />
              {color}
            </h1>
            <div className="details__container">
              <div className="details__slider-photos">
                {element.images.map(img => (
                  <div className="details__slider-photo" key={`img${img}`}>
                    <SliderPhotos img={img} onActive={selectedImg === img} />
                  </div>
                ))}
              </div>

              <div className="details__main-photo">
                {selectedImg ? (
                  <img
                    className="details__main-photo--img"
                    src={selectedImg}
                    alt="main photo"
                  />
                ) : (
                  <img
                    className="details__main-photo--img"
                    src={element.images[0]}
                    alt="main photo"
                  />
                )}
              </div>

              <div className="details__properties">
                <p className="details__properties--text">Available colors</p>
                <AvailableColors
                  selectedProduct={element}
                  property={'colors'}
                />
                <div className="line"></div>

                <CapacityAvailable selectedProduct={element} />

                <div className="line"></div>
                <div className="details__buttons">
                  <div className="details__prices">
                    <p className="details__prices--discount">
                      ${element.priceDiscount}
                    </p>
                    <p className="details__prices--full">
                      ${element.priceRegular}
                    </p>
                  </div>
                  <div className="details__button">
                    <button
                      onClick={() => handleAddButton(generalElement)}
                      className={classNames('details__button--add', {
                        'details__button--add--active':
                          checkItemInCart(generalElement),
                      })}
                    >
                      {!checkItemInCart(generalElement)
                        ? 'Add to cart'
                        : 'Added'}
                    </button>
                    <button
                      className="details__button--like"
                      onClick={() => addProductToFavourites(generalElement)}
                    >
                      <div
                        className={classNames('details__button--like__link', {
                          'details__button--like__link__active':
                            checkLikedItem(generalElement),
                        })}
                      />
                    </button>
                  </div>
                  <div className="details__descriptions">
                    <div className="details__descriptions__item">
                      <p className="details__descriptions__item--name">
                        Screen
                      </p>
                      <p className="details__descriptions__item--description">
                        {element.screen}
                      </p>
                    </div>
                    <div className="details__descriptions__item">
                      <p className="details__descriptions__item--name">
                        Resolution
                      </p>
                      <p className="details__descriptions__item--description">
                        {element.resolution}
                      </p>
                    </div>
                    <div className="details__descriptions__item">
                      <p className="details__descriptions__item--name">
                        Processor
                      </p>
                      <p className="details__descriptions__item--description">
                        {element.processor}
                      </p>
                    </div>
                    <div className="details__descriptions__item">
                      <p className="details__descriptions__item--name">RAM</p>
                      <p className="details__descriptions__item--description">
                        {element.capacity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="details__descriptions--container">
              <div className="details__items-about">
                <p className="details__items-about-title">About</p>
                <div className="line"></div>
                <div className="details__items-about__wrapper">
                  {element.description.map(item => {
                    return (
                      <React.Fragment key={`${item.text}`}>
                        <div className="details__items-about-container">
                          <p className="details__items-about-container-title">
                            {item.title}
                          </p>
                          <p className="details__items-about-container-text">
                            {item.text}
                          </p>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
              <div className="details__specs">
                <p className="details__specs__title">Tech specs</p>
                <div className="line"></div>
                <div className="details__specs__items">
                  <div className="details__specs__item">
                    <p className="details__specs__item--name">Screen</p>
                    <p className="details__specs__item--description">
                      {element.screen}
                    </p>
                  </div>
                  <div className="details__specs__item">
                    <p className="details__specs__item--name">Resolution</p>
                    <p className="details__specs__item--description">
                      {element.resolution}
                    </p>
                  </div>
                  <div className="details__specs__item">
                    <p className="details__specs__item--name">Processor</p>
                    <p className="details__specs__item--description">
                      {element.processor}
                    </p>
                  </div>
                  <div className="details__specs__item">
                    <p className="details__specs__item--name">RAM</p>
                    <p className="details__specs__item--description">
                      {element.ram}
                    </p>
                  </div>
                  <div className="details__specs__item">
                    <p className="details__specs__item--name">
                      Built in memory
                    </p>
                    <p className="details__specs__item--description">
                      {element.capacity}
                    </p>
                  </div>
                  <div className="details__specs__item">
                    <p className="details__specs__item--name">Camera</p>
                    <p className="details__specs__item--description">
                      {element.camera}
                    </p>
                  </div>
                  <div className="details__specs__item">
                    <p className="details__specs__item--name">Zoom</p>
                    <p className="details__specs__item--description">
                      {element.zoom}
                    </p>
                  </div>
                  <div className="details__specs__item">
                    <p className="details__specs__item--name">Cell</p>
                    <p className="details__specs__item--description">
                      {cellElements}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ProductsSlider
            title={'You may also like'}
            products={youMayAlsoLike}
          />
        </div>
      )}
    </>
  );
};
