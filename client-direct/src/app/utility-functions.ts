import { AssociatedData, AssociatedItem } from './ap-predict-input';

export enum AssociatedItemType {
  HILL,
  HILLSPREAD,
  PIC50,
  PIC50SPREAD,
  SATURATION
}

export enum LocalStorageItem {
  APPREDICT_INPUT,
  IP_ADDRESS,
  STDERR,
  STDOUT,
  VOLTAGE_RESULTS,
  VOLTAGE_TRACES
}

/**
 * Retrieve the ApPredict input "associated item" data values.
 * <p>
 * As the associated item contains an array of associated data objects we will
 * return the value from the first array element. For spread data, it'll be
 * the specified value.
 *
 * @param associatedItem pIC50, Hill, saturation and spread data for channel.
 * @param associatedItemType The specific data requested.
 * @return The value of the requested item if defined, otherwise an empty string.
 */
export function displayData(associatedItem: AssociatedItem,
                            associatedItemType: AssociatedItemType): string {
  var defaultReturn = '';

  if (typeof associatedItem !== 'undefined') {
    var associatedData = associatedItem.associatedData;
    var spreads = associatedItem.spreads;

    switch (associatedItemType) {
      case AssociatedItemType.HILL:
      case AssociatedItemType.PIC50:
      case AssociatedItemType.SATURATION:
        if (typeof associatedData !== 'undefined') {
          switch (associatedItemType) {
            case AssociatedItemType.HILL:
              return associatedData[0].hill;
            case AssociatedItemType.PIC50:
              return associatedData[0].pIC50;
            case AssociatedItemType.SATURATION:
              return associatedData[0].saturation;
          }
        }
        return defaultReturn;
      case AssociatedItemType.HILLSPREAD:
      case AssociatedItemType.PIC50SPREAD:
        if (typeof spreads !== 'undefined') {
          switch (associatedItemType) {
            case AssociatedItemType.HILLSPREAD:
              return spreads.hillSpread;
            case AssociatedItemType.PIC50SPREAD:
              return spreads.c50Spread;
          }
        }
        return defaultReturn;
      default:
        console.error('Unrecognized AssociatedItem type ' + associatedItemType);
    }
  }

  return defaultReturn;
}
