# ERPNext Accounting/Inventory/Tax Extraction Report

Date: 2026-01-19

## Extraction Summary

The following ERPNext modules were extracted from the original source and placed in:

- packages/erpnext-extract/erpnext

Extracted directories:

- accounts
- stock
- regional
- buying
- selling
- assets
- templates

These contain ERPNext’s accounting, inventory, and taxation-related code (including print formats and tax templates). The original erpnext-develop folder has been deleted as requested after extraction.

## JavaScript Port (Initial Foundation)

New finance services were added under:

- apps/api/src/modules/finance
- apps/api/src/routes/finance.ts

Capabilities implemented:

- General ledger storage (file-backed, per user)
- Journal posting and validation (debits = credits)
- Trial balance calculation
- Tax calculations (inclusive/exclusive), summaries, and insights
- Inventory item management and FIFO transactions
- Budget plan creation and actuals tracking
- Financial reporting snapshots (P&L, Balance Sheet, Cashflow, Trial Balance)

API endpoints are mounted at:

- /api/finance/\*

## Next Steps (Porting Depth)

To fully convert ERPNext accounting logic to JavaScript, the following areas should be ported in depth:

1. Chart of Accounts & Account Types
2. GL Posting Rules and Voucher Types
3. Tax templates, withholding, and jurisdiction rules
4. Inventory valuation methods (FIFO/LIFO/Moving Avg) and serial/batch tracking
5. Financial reports (aging, profitability, cashflow, balance sheet, P&L) based on ERPNext report logic
6. Period closing, opening balances, and fiscal year management
7. Budget variance analysis and approvals

This report documents the extraction baseline and the initial JS implementation to track ledgers, journals, tax, inventory, cashflow, and budgeting.
