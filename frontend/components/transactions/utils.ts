import { ElementType } from 'react';
import { SvgIconProps } from '@mui/material';
import { MoreHorizRounded } from '@mui/icons-material';
import { transactionCategoryMap } from '@/components/transactions/consts';

export function getTransactionIcon(
  subcategory: string,
): ElementType<SvgIconProps> {
  for (const category of Object.values(transactionCategoryMap)) {
    if (category.subcategories.includes(subcategory)) {
      return category.icon;
    }
  }

  return MoreHorizRounded;
}
