import { Transaction } from '@/components/transactions/consts';
import { getTransactionIcon } from '@/components/transactions/utils';
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import CurrencyAmountItem from '@/components/transactions/CurrencyAmountItem';

export default function TransactionList({
  transactionList = [],
}: {
  transactionList: Transaction[];
}) {
  return (
    <Box
      sx={{
        borderRadius: '0.5rem',
        backgroundColor: 'background.paper',
        margin: '0.5rem',
        overflow: 'hidden',
      }}
    >
      <List disablePadding>
        {transactionList.map((transaction, index) => {
          // prettier-ignore
          const { transaction_id, merchant, amount, currency, account, category, datetime } = transaction;

          const primaryText = [merchant, account].filter(Boolean).join(' • ');

          // Secondary Text
          const formattedDatetime = datetime
            ? new Date(datetime).toLocaleString('en-US', datetimeOptions)
            : '';
          const formattedCategory = category
            ? category.replace(/\b\w/g, (char) => char.toUpperCase())
            : '';
          const secondaryText = [formattedCategory, formattedDatetime]
            .filter(Boolean)
            .join(' • ');

          const Icon = getTransactionIcon(category);

          const formattedAmount = amount.toFixed(2);

          return (
            <ListItem key={transaction_id} divider>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: 'background.default',
                    color: 'primary.main',
                    border: '2px solid rgba(255,255,255,0.15)', // shadow effect
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: 20,
                      transform: { xs: '', sm: 'translateX(0.6px)' }, // fix optical centering
                    }}
                  />
                </Avatar>
              </ListItemAvatar>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  width: '100%',
                }}
              >
                <ListItemText
                  primary={primaryText}
                  secondary={secondaryText}
                  sx={{ flex: 1 }}
                />
                <CurrencyAmountItem
                  currency={currency}
                  amount={formattedAmount}
                />
              </Box>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

// prettier-ignore
const datetimeOptions: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
