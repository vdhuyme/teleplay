import { isNil, isUndefined } from './ts-utils';

export interface MaskOptions {
  maskChar?: string;
  visibleStart?: number;
  visibleEnd?: number;
  percentage?: number;
  preserveDelimiter?: string;
}

/**
 * Masks a string value based on the provided options.
 *
 * @param value - The string to be masked.
 * @param options - Configuration for masking, including mask character, number of visible characters at the start and end, percentage to mask, and optional delimiter to preserve.
 * @returns The masked string according to the specified options.
 *
 * @example
 * Mask all but the first and last character
 * mask('SensitiveData', { visibleStart: 1, visibleEnd: 1 }); // "S**********a"
 *
 * Mask 50% of the string
 * mask('SensitiveData', { percentage: 50 }); // "******tiveData"
 *
 * Mask only the part before a delimiter
 * mask('user@example.com', { preserveDelimiter: '@', visibleStart: 1 }); // "u***@example.com"
 */
export function mask(value: string | null, options: MaskOptions = {}): string {
  if (isNil(value)) {
    return '';
  }

  const {
    maskChar = '*',
    visibleStart = 0,
    visibleEnd = 0,
    percentage,
    preserveDelimiter,
  } = options;

  if (!isUndefined(preserveDelimiter) && value.includes(preserveDelimiter)) {
    const [leftPart, rightPart] = value.split(preserveDelimiter);
    const maskedLeft = mask(leftPart, {
      maskChar,
      visibleStart,
      visibleEnd,
      percentage,
    });
    return `${maskedLeft}${preserveDelimiter}${rightPart}`;
  }

  if (!isUndefined(percentage) && percentage > 0 && percentage < 100) {
    const lengthToMask = Math.floor((value.length * percentage) / 100);
    const maskedSection = maskChar.repeat(lengthToMask);
    const visibleSection = value.slice(lengthToMask);
    return maskedSection + visibleSection;
  }

  const startVisible = value.slice(0, visibleStart);
  const endVisible = value.slice(value.length - visibleEnd);
  const maskedMiddle = maskChar.repeat(
    Math.max(0, value.length - visibleStart - visibleEnd),
  );

  return startVisible + maskedMiddle + endVisible;
}
