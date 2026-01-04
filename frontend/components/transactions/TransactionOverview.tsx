import { CurrencySummary } from '@/components/transactions/consts';
import { Box, Divider, List, ListItem, Typography } from '@mui/material';
import { NorthEastRounded, SouthEastRounded } from '@mui/icons-material';
import CurrencyAmountItem from '@/components/transactions/CurrencyAmountItem';

export default function TransactionOverview({
  currencySummaryList,
}: {
  currencySummaryList: CurrencySummary[];
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
        {currencySummaryList.map(({ currency, income, expense }, index) => {
          const formattedExpense = expense.toFixed(2);
          const formattedIncome = income.toFixed(2);

          return (
            <div key={currency}>
              <ListItem sx={{ width: '100%' }}>
                <List disablePadding sx={{ width: '100%' }}>
                  <ListItem
                    disablePadding
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <NorthEastRounded sx={{ color: 'success.main' }} />
                    <Typography>Income</Typography>
                  </ListItem>
                  <CurrencyAmountItem
                    currency={currency}
                    amount={formattedIncome}
                    type='income'
                  />
                </List>
                <List disablePadding sx={{ width: '100%' }}>
                  <ListItem
                    disablePadding
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <SouthEastRounded sx={{ color: 'error.main' }} />
                    <Typography>Expenses</Typography>
                  </ListItem>
                  <CurrencyAmountItem
                    currency={currency}
                    amount={formattedExpense}
                    type='expense'
                  />
                </List>
              </ListItem>
              {index < currencySummaryList.length - 1 && <Divider />}
            </div>
          );
        })}
      </List>
    </Box>
  );
}
