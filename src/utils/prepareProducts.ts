import { ProductGeneral } from '../types/ProductGeneral';

export const prepareProducts = (
  elements: ProductGeneral[],
  sort: string,
  query: string,
) => {
  let preparedPhones = [...elements];

  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery) {
    preparedPhones = preparedPhones.filter(item =>
      item.name.trim().toLowerCase().includes(normalizedQuery),
    );
  }

  if (sort) {
    switch (sort) {
      case 'Newest':
        return preparedPhones.sort(
          (phone1, phone2) => phone2.year - phone1.year,
        );

      case 'Alphabetically':
        return preparedPhones.sort((phone1, phone2) =>
          phone1.name.localeCompare(phone2.name),
        );
      case 'Cheapest':
        return preparedPhones.sort(
          (phone1, phone2) => phone1.price - phone2.price,
        );

      default:
        return preparedPhones;
    }
  }

  return preparedPhones;
};
