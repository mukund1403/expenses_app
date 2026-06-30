'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  IconButton,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { DeleteRounded, UploadFileRounded } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import {
  parseExpenseExcel,
  getPersonOptionsFromExcel,
  ImportDraftTransaction,
} from '@/components/transactions/import/parseExpenseExcel';
import { transactionCategoryExpenseMap } from '@/components/transactions/consts';
import postTransactionAction from '@/app/(sidebar)/transactions/create/postTransactionAction';
import { useNotification } from '@/providers/NotificationProvider';

export default function ImportForm() {
  const router = useRouter();
  const { showSnackbar } = useNotification();

  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [personOptions, setPersonOptions] = useState<string[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [account, setAccount] = useState<string>('');

  const [drafts, setDrafts] = useState<ImportDraftTransaction[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    setFileBuffer(buffer);
    setDrafts(null);
    setParseErrors([]);

    try {
      const options = getPersonOptionsFromExcel(buffer);
      setPersonOptions(options);
      setSelectedPerson('');
    } catch (err) {
      showSnackbar('Failed to read spreadsheet.', 'error');
    }
  };

  const handleParse = () => {
    if (!fileBuffer || !selectedPerson) return;

    setIsParsing(true);
    try {
      const result = parseExpenseExcel(fileBuffer, {
        selectedPerson,
        fromDate: fromDate ? fromDate.toISOString() : null,
        account,
      });
      setDrafts(result.transactions);
      setParseErrors(result.errors);
      if (result.transactions.length === 0) {
        showSnackbar('No matching transactions found.', 'info');
      }
    } catch (err) {
      showSnackbar('Failed to parse spreadsheet.', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const updateDraft = <K extends keyof ImportDraftTransaction>(
    index: number,
    key: K,
    value: ImportDraftTransaction[K],
  ) => {
    setDrafts((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const removeDraft = (index: number) => {
    setDrafts((prev) => {
      if (!prev) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleConfirmImport = async () => {
    if (!drafts || drafts.length === 0) return;

    setIsSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    for (const draft of drafts) {
      try {
        await postTransactionAction(draft);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setIsSubmitting(false);

    if (failCount === 0) {
      showSnackbar(
        `Imported ${successCount} transactions successfully.`,
        'success',
      );
      router.push('/transactions');
    } else {
      showSnackbar(
        `Imported ${successCount} transactions, ${failCount} failed.`,
        'error',
      );
    }
  };

  const categoryList = useMemo(
    () => Object.entries(transactionCategoryExpenseMap),
    [],
  );

  return (
    <Box sx={{ margin: '1rem', maxWidth: 900 }}>
      <Typography variant='h5' fontWeight={700} sx={{ mb: 2 }}>
        Import Transactions
      </Typography>

      {/* ── Step 1: Upload ── */}
      <Box
        sx={{
          borderRadius: '0.75rem',
          backgroundColor: 'background.paper',
          boxShadow: 1,
          p: 2,
          mb: 2,
        }}
      >
        <Typography variant='body2' fontWeight={600} sx={{ mb: 1 }}>
          1. Upload spreadsheet
        </Typography>
        <Button
          component='label'
          variant='outlined'
          startIcon={<UploadFileRounded />}
          size='small'
        >
          Choose file
          <input
            type='file'
            accept='.xlsx,.xls'
            hidden
            onChange={handleFileChange}
          />
        </Button>
        {fileBuffer && (
          <Typography variant='caption' color='text.secondary' sx={{ ml: 1.5 }}>
            File loaded
          </Typography>
        )}
      </Box>

      {/* ── Step 2: Options ── */}
      {fileBuffer && (
        <Box
          sx={{
            borderRadius: '0.75rem',
            backgroundColor: 'background.paper',
            boxShadow: 1,
            p: 2,
            mb: 2,
          }}
        >
          <Typography variant='body2' fontWeight={600} sx={{ mb: 1.5 }}>
            2. Import settings
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <FormControl size='small' sx={{ minWidth: 200 }}>
              <InputLabel>Which person are you?</InputLabel>
              <Select
                value={selectedPerson}
                label='Which person are you?'
                onChange={(e) => setSelectedPerson(e.target.value)}
              >
                {personOptions.map((person) => (
                  <MenuItem key={person} value={person}>
                    {person}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label='From date (optional)'
                value={fromDate}
                onChange={(date) => setFromDate(date)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </LocalizationProvider>

            <TextField
              label='Account name'
              placeholder='Import'
              size='small'
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
          </Stack>

          <Button
            variant='contained'
            onClick={handleParse}
            disabled={!selectedPerson || isParsing}
          >
            {isParsing ? <CircularProgress size={20} /> : 'Parse spreadsheet'}
          </Button>
        </Box>
      )}

      {/* ── Step 3: Review ── */}
      {drafts && (
        <Box
          sx={{
            borderRadius: '0.75rem',
            backgroundColor: 'background.paper',
            boxShadow: 1,
            p: 2,
            mb: 2,
          }}
        >
          <Typography variant='body2' fontWeight={600} sx={{ mb: 1.5 }}>
            3. Review ({drafts.length} transactions)
          </Typography>

          {parseErrors.length > 0 && (
            <Alert severity='warning' sx={{ mb: 2 }}>
              {parseErrors.length} row(s) were skipped due to parsing issues.
            </Alert>
          )}

          {drafts.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              No transactions to review.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {drafts.map((draft, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: '0.5rem',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ flex: 1.5, minWidth: 0 }}>
                    <Typography variant='body2' fontWeight={500} noWrap>
                      {draft.merchant}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {new Date(draft.datetime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                      })}
                    </Typography>
                  </Box>

                  <FormControl
                    size='small'
                    sx={{ minWidth: { xs: '100%', sm: 180 } }}
                  >
                    <Select
                      value={draft.category}
                      onChange={(e) =>
                        updateDraft(index, 'category', e.target.value)
                      }
                    >
                      {categoryList.map(([key, { icon: Icon }]) => (
                        <MenuItem key={key} value={key}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Icon sx={{ fontSize: 18 }} />
                            {key
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      variant='body2'
                      fontWeight={500}
                      color='error.main'
                      sx={{ minWidth: 90, textAlign: 'right' }}
                    >
                      {draft.currency} {draft.amount.toFixed(2)}
                    </Typography>
                    <IconButton size='small' onClick={() => removeDraft(index)}>
                      <DeleteRounded fontSize='small' />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}

          {drafts.length > 0 && (
            <Button
              variant='contained'
              color='primary'
              onClick={handleConfirmImport}
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? (
                <CircularProgress size={20} />
              ) : (
                `Confirm import (${drafts.length})`
              )}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
