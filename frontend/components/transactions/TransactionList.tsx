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

export default function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <Box>
      <List>
        {transactions.map((transaction, index) => {
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

          const formattedAmount = [currency, amount.toFixed(2)].join(' ');

          return (
            <ListItem key={transaction_id} divider>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: 'background.paper',
                    color: 'primary.main',
                    border: '2px solid rgba(255,255,255,0.15)', // shadow effect
                  }}
                >
                  <Icon fontSize='small' />
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
                <Typography
                  sx={{
                    color: 'error.main',
                    fontWeight: 500,
                  }}
                >
                  {formattedAmount}
                </Typography>
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
