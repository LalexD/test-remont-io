import '@/app/styles/index.css'
import { AppProviders } from '@/app/providers/AppProviders'
import ExpenseTrackingPage from '@/pages/expense-tracking/ExpenseTrackingPage'

function App() {
  return (
    <AppProviders>
      <ExpenseTrackingPage />
    </AppProviders>
  )
}

export default App
