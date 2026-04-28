import { FluentProvider, Toaster, webDarkTheme, webLightTheme } from '@fluentui/react-components'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './routes/AppRouter'
import { useThemeStore } from './store/themeStore'

const queryClient = new QueryClient()

function App() {
  const theme = useThemeStore((s) => s.theme)

  return (
    <FluentProvider theme={theme === 'dark' ? webDarkTheme : webLightTheme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </QueryClientProvider>
      <Toaster toasterId="app-toaster" position="top-end" />
    </FluentProvider>
  )
}

export default App
