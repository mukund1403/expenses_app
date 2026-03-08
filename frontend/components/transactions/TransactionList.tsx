import {
  Avatar,
  Box,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { Add, EditRounded } from '@mui/icons-material';
import { Transaction } from '@/components/transactions/consts';
import { getTransactionIcon } from '@/components/transactions/utils';
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
        boxShadow: 3,
      }}
    >
      <List disablePadding>
        {transactionList.map((transaction, index) => {
          // prettier-ignore
          const { transaction_id, merchant, amount, currency, account, category, datetime, type } = transaction;

          const primaryText = [merchant, account].filter(Boolean).join(' • ');

          // Secondary Text
          const formattedDatetime = datetime
            ? new Date(datetime).toLocaleString('en-US', datetimeOptions)
            : '';
          const formattedCategory = category
            ? category
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (char) => char.toUpperCase())
            : '';
          const secondaryText = [formattedCategory, formattedDatetime]
            .filter(Boolean)
            .join(' • ');

          const Icon = getTransactionIcon(category);

          const formattedAmount = amount.toFixed(2);

          return (
            <ListItem
              key={transaction_id}
              divider
              secondaryAction={
                <IconButton
                  href={`/transactions/edit?transaction_id=${transaction_id}`}
                  size='small'
                >
                  <EditRounded />
                </IconButton>
              }
            >
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
                  pr: '0.4rem', // add space between `ListItem` and `secondaryAction`
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
                  type={type}
                />
              </Box>
            </ListItem>
          );
        })}
      </List>
      <Fab
        color='primary'
        aria-label='add-transaction'
        href='/transactions/create'
        sx={{
          position: 'fixed',
          bottom: { xs: 71, sm: 16 }, // TODO: Find more robust way to float button
          right: 16,
          zIndex: 10,
          color: 'text.primary',
        }}
      >
        <Add />
      </Fab>
    </Box>
  );
}

// prettier-ignore
const datetimeOptions: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
