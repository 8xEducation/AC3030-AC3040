import { useAppStore } from '../store/appStore'

const vi = {
  // Navigation
  'nav.home': 'Trang chủ',
  'nav.budgets': 'Ngân sách',
  'nav.debts': 'Sổ nợ',
  'nav.settings': 'Cài đặt',
  
  // Dashboard
  'dashboard.hello': 'Xin chào',
  'dashboard.title': 'Cash Flow Wave',
  'dashboard.action_center': 'Hành động nhanh',
  'dashboard.add_account': 'Thêm ví đầu tiên',
  'dashboard.add_transaction': 'Thêm giao dịch',
  'dashboard.analytics': 'Phân tích chi tiêu',
  'dashboard.trend': 'Xu hướng 7 ngày',
  'dashboard.monthly': 'Tỉ lệ tháng',
  'dashboard.my_wallets': 'Ví & Tài sản nợ',
  'dashboard.recent_tx': 'Giao dịch gần đây',
  'dashboard.no_tx': 'Chưa có giao dịch. Nhấn nút bên trên để tạo mới!',
  'dashboard.no_chart': 'Chưa có dữ liệu để hiển thị.',
  
  // Settings
  'settings.title': 'Cài đặt',
  'settings.pref': 'Tuỳ chọn & Hệ thống',
  'settings.theme': 'Giao diện',
  'settings.light': 'Sáng',
  'settings.dark': 'Tối',
  'settings.system': 'Hệ thống',
  'settings.currency': 'Tiền tệ',
  'settings.currency_symbol': 'Ký hiệu tiền tệ',
  'settings.symbol_pos': 'Vị trí ký hiệu',
  'settings.lang': 'Ngôn ngữ',
  'settings.security': 'Bảo mật',
  'settings.biometric': 'Khoá sinh trắc học',
  'settings.danger': 'Khu vực nguy hiểm',
  'settings.reset': 'Xoá toàn bộ dữ liệu',
  
  // Modal Common
  'modal.cancel': 'Hủy',
  'modal.save': 'Lưu',
  'modal.saving': 'Đang lưu...',
  'modal.amount': 'Số tiền',
  'modal.desc': 'Ghi chú (Tùy chọn)',
  
  // Add Transaction Modal
  'tx.add': 'Thêm giao dịch',
  'tx.expense': 'Chi tiêu',
  'tx.income': 'Thu nhập',
  'tx.account': 'Ví / Tài khoản',
  'tx.category': 'Danh mục',
  'tx.placeholder.amount': '0',
  'tx.placeholder.desc': 'Mua sắm, ăn uống...',
  
  // Add Account Modal
  'acc.add': 'Thêm tài khoản',
  'acc.name': 'Tên tài khoản',
  'acc.type': 'Loại',
  'acc.wallet': 'Ví / Ngân hàng',
  'acc.credit': 'Thẻ tín dụng / Khoản vay',
  'acc.balance': 'Số dư ban đầu',
  
  // Debt Ledger
  'debt.title': 'Sổ nợ',
  'debt.active': 'Đang mở',
  'debt.settled': 'Đã trả',
  'debt.no_debts': 'Chưa có khoản nợ nào.',
  'debt.lent': 'Cho mượn (Thu)',
  'debt.borrowed': 'Đi mượn (Trả)',
  'debt.remaining': 'Còn lại',
  'debt.total': 'Tổng cộng',
  'debt.repay': 'Ghi nhận thanh toán',
  
  // Misc
  'networth.total': 'Tổng tài sản ròng',
  'networth.assets': 'Tài sản',
  'networth.liabilities': 'Khoản nợ',
}

const en = {
  'nav.home': 'Home',
  'nav.budgets': 'Budgets',
  'nav.debts': 'Debts',
  'nav.settings': 'Settings',
  
  'dashboard.hello': 'Hello',
  'dashboard.title': 'Cash Flow Wave',
  'dashboard.action_center': 'Action Center',
  'dashboard.add_account': 'Add First Account',
  'dashboard.add_transaction': 'Add Transaction',
  'dashboard.analytics': 'Spending Analytics',
  'dashboard.trend': '7-Day Trend',
  'dashboard.monthly': 'Monthly Breakdown',
  'dashboard.my_wallets': 'My Wallets & Liabilities',
  'dashboard.recent_tx': 'Recent Transactions',
  'dashboard.no_tx': 'No transactions recorded yet. Tap an action above to log one!',
  'dashboard.no_chart': 'No data to display.',
  
  'settings.title': 'Settings',
  'settings.pref': 'Preferences & System',
  'settings.theme': 'Theme Preference',
  'settings.light': 'Light',
  'settings.dark': 'Dark',
  'settings.system': 'System',
  'settings.currency': 'Currency Settings',
  'settings.currency_symbol': 'Currency Symbol',
  'settings.symbol_pos': 'Symbol Position',
  'settings.lang': 'Language',
  'settings.security': 'Security',
  'settings.biometric': 'Biometric Lock',
  'settings.danger': 'Danger Zone',
  'settings.reset': 'Reset Application Database',
  
  'modal.cancel': 'Cancel',
  'modal.save': 'Save',
  'modal.saving': 'Saving...',
  'modal.amount': 'Amount',
  'modal.desc': 'Description (Optional)',
  
  'tx.add': 'Add Transaction',
  'tx.expense': 'Expense',
  'tx.income': 'Income',
  'tx.account': 'Account',
  'tx.category': 'Category',
  'tx.placeholder.amount': '0.00',
  'tx.placeholder.desc': 'What was this for?',
  
  'acc.add': 'Add New Account',
  'acc.name': 'Account Name',
  'acc.type': 'Type',
  'acc.wallet': 'Wallet / Bank',
  'acc.credit': 'Credit Card / Loan',
  'acc.balance': 'Starting Balance',
  
  'debt.title': 'Debt Ledger',
  'debt.active': 'Active Debts',
  'debt.settled': 'Settled',
  'debt.no_debts': 'No debts found.',
  'debt.lent': 'You Lent (Receivable)',
  'debt.borrowed': 'You Borrowed (Payable)',
  'debt.remaining': 'Remaining',
  'debt.total': 'Total Loan',
  'debt.repay': 'Record Repayment',
  
  'networth.total': 'Total Net Worth',
  'networth.assets': 'Assets',
  'networth.liabilities': 'Liabilities',
}

const dictionaries = {
  vi,
  en,
}

type DictionaryKey = keyof typeof en

export const useTranslation = () => {
  const { language } = useAppStore()
  
  const t = (key: DictionaryKey): string => {
    const dict = dictionaries[language as keyof typeof dictionaries] || dictionaries.en
    return dict[key] || en[key] || key
  }
  
  return { t }
}
